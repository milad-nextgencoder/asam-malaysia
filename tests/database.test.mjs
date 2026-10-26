import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile,readdir } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';
(function databaseTests() {
const MEMBER='10000000-0000-4000-8000-000000000001',ADMIN='10000000-0000-4000-8000-000000000002',OTHER='10000000-0000-4000-8000-000000000003',UNVERIFIED='10000000-0000-4000-8000-000000000004',DUPLICATE='10000000-0000-4000-8000-000000000005';
test('PostgreSQL migration replay, authorization and membership lifecycle',{timeout:120000},async(t)=>{
 const db=new PGlite();t.after(()=>db.close());
 await db.exec(`
 CREATE ROLE anon NOLOGIN; CREATE ROLE authenticated NOLOGIN; CREATE SCHEMA auth;
 CREATE TABLE auth.users(id uuid PRIMARY KEY,email text,email_confirmed_at timestamptz,raw_user_meta_data jsonb DEFAULT '{}'::jsonb);
 CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$ SELECT nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
 GRANT USAGE ON SCHEMA auth TO anon,authenticated; GRANT EXECUTE ON FUNCTION auth.uid() TO anon,authenticated;
 CREATE SCHEMA storage;
 CREATE TABLE storage.buckets(id text PRIMARY KEY,name text NOT NULL,public boolean DEFAULT false,file_size_limit bigint,allowed_mime_types text[]);
 CREATE TABLE storage.objects(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),bucket_id text REFERENCES storage.buckets(id),name text NOT NULL);
 ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
 CREATE FUNCTION storage.foldername(text) RETURNS text[] LANGUAGE sql IMMUTABLE AS $$ SELECT (string_to_array($1,'/'))[1:array_length(string_to_array($1,'/'),1)-1] $$;
 GRANT USAGE ON SCHEMA storage TO anon,authenticated;GRANT SELECT,INSERT,UPDATE,DELETE ON storage.objects TO authenticated;
 `);
 const directory=new URL('../supabase/migrations/',import.meta.url);
 const names=(await readdir(directory)).filter(n=>n.endsWith('.sql')).sort();
 for(const name of names) {
  try{await db.exec(await readFile(new URL(name,directory),'utf8'));}
  catch(error){await db.exec('ROLLBACK');throw new Error('Migration failed: '+name+' ('+error.code+'): '+error.message);}
 }
 const repair=await readFile(new URL(names.find(n=>n.endsWith('_membership_reliability.sql')),directory),'utf8');
 async function as(role,uid,action){
  assert.ok(['anon','authenticated'].includes(role));
  return db.transaction(async tx=>{await tx.exec('SET LOCAL ROLE '+role);await tx.query("SELECT set_config('request.jwt.claim.sub',$1,true)",[uid||'']);return action(tx);});
 }
 const member=(uid,fn)=>as('authenticated',uid,fn);
 const rpc=(uid,name,args=[])=>member(uid,async tx=>(await tx.query('SELECT * FROM public.'+name+'('+args.map((_,i)=>'$'+(i+1)).join(',')+')',args)).rows[0]);
 for(const [uid,email,verified] of [[MEMBER,'amina@example.test',true],[ADMIN,'admin@example.test',true],[OTHER,'other@example.test',true],[UNVERIFIED,'pending@example.test',false],[DUPLICATE,' AMINA@EXAMPLE.TEST ',true]]){
  await db.query('INSERT INTO auth.users(id,email,email_confirmed_at) VALUES($1,$2,$3)',[uid,email,verified?new Date().toISOString():null]);
 }
 await db.query("INSERT INTO public.admin_roles(user_id,role) VALUES($1,'SUPER_ADMIN')",[ADMIN]);
 const university=(await db.query("SELECT id FROM public.universities WHERE name='Albukhary International University' AND status='published'")).rows[0]?.id;
 const complete=(uid)=>member(uid,tx=>tx.query(`UPDATE public.member_profiles SET first_name='Amina',last_name='Ahmad',
 preferred_name='Amina Ahmad',phone='+60123456789',profile_photo_url='https://example.test/photo.jpg',
 university_id=$1,program='BSc Computer Science',faculty='Computing',city='Alor Setar',state='Kedah',bio='Student member.'
 WHERE user_id=$2 RETURNING *`,[university,uid]));
 let approved;
 await t.test('clean install includes one published Albukhary and RLS on every application table',async()=>{
  assert.ok(university);
  assert.equal((await db.query("SELECT count(*)::int AS n FROM public.universities WHERE lower(name)='albukhary international university'")).rows[0].n,1);
  assert.equal((await db.query("SELECT count(*)::int AS n FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND c.relkind='r' AND NOT c.relrowsecurity")).rows[0].n,0);
 });
 await t.test('canonical email, completion and ownership cannot be forged',async()=>{
  for(const uid of [MEMBER,OTHER,UNVERIFIED]){
   const result=await member(uid,tx=>tx.query("INSERT INTO public.member_profiles(user_id,email,first_name,profile_completed) VALUES($1,'spoof@example.test','Amina',true) RETURNING *",[uid]));
   assert.equal(result.rows[0].profile_completed,false);assert.notEqual(result.rows[0].email,'spoof@example.test');
  }
  await assert.rejects(rpc(MEMBER,'submit_membership_application'),/Complete your profile/);
  assert.equal((await member(OTHER,tx=>tx.query('SELECT id FROM public.member_profiles WHERE user_id=$1',[MEMBER]))).rows.length,0);
  await assert.rejects(member(DUPLICATE,tx=>tx.query('INSERT INTO public.member_profiles(user_id) VALUES($1)',[DUPLICATE])),/duplicate key/);
  await member(MEMBER,tx=>tx.query('UPDATE public.member_profiles SET profile_completed=true WHERE user_id=$1',[MEMBER]));
  assert.equal((await db.query('SELECT profile_completed FROM public.member_profiles WHERE user_id=$1',[MEMBER])).rows[0].profile_completed,false);
 });
 await t.test('verified email is required; submission is idempotent and state writes are denied',async()=>{
  await complete(UNVERIFIED);await assert.rejects(rpc(UNVERIFIED,'submit_membership_application'),/Verify your email/);
  await complete(MEMBER);const first=await rpc(MEMBER,'submit_membership_application'),second=await rpc(MEMBER,'submit_membership_application');
  assert.equal(first.id,second.id);assert.ok(first.application_submitted_at);
  assert.equal((await db.query("SELECT count(*)::int AS n FROM public.member_notifications WHERE user_id=$1 AND title='Application submitted'",[MEMBER])).rows[0].n,1);
  await assert.rejects(member(MEMBER,tx=>tx.query("UPDATE public.membership_applications SET status='approved' WHERE user_id=$1",[MEMBER])),/permission denied/);
  await assert.rejects(rpc(MEMBER,'approve_membership_application',[MEMBER]),/Admin access/);
  await assert.rejects(as('anon',null,tx=>tx.query('SELECT public.submit_membership_application()')),/permission denied/);
  await assert.rejects(member(MEMBER,tx=>tx.query('SELECT public.generate_member_id()')),/permission denied/);
 });
 await t.test('review, reject, resubmit and repeated approval issue exactly one ID',async()=>{
  await rpc(ADMIN,'start_membership_review',[MEMBER]);await rpc(ADMIN,'reject_membership_application',[MEMBER,'Please update your profile.']);
  const resubmitted=await rpc(MEMBER,'submit_membership_application');
  assert.equal(resubmitted.status,'submitted');assert.equal(resubmitted.reviewed_by,null);assert.equal(resubmitted.rejection_reason,null);
  await rpc(ADMIN,'start_membership_review',[MEMBER]);approved=await rpc(ADMIN,'approve_membership_application',[MEMBER]);
  assert.equal(approved.member_id,(await rpc(ADMIN,'approve_membership_application',[MEMBER])).member_id);
  assert.match(approved.member_id,/^ASAM-\d{4}-000001$/);
  assert.equal((await db.query('SELECT count(*)::int AS n FROM public.membership_certificates WHERE user_id=$1',[MEMBER])).rows[0].n,1);
 });
 await t.test('issued certificates remain unchanged after profile edits',async()=>{
  await member(MEMBER,tx=>tx.query("UPDATE public.member_profiles SET preferred_name='Changed name',program='Changed program' WHERE user_id=$1",[MEMBER]));
  const record=await as('anon',null,tx=>tx.query('SELECT * FROM public.get_public_certificate($1)',[approved.member_id]));
  assert.equal(record.rows[0].full_name,'Amina Ahmad');assert.equal(record.rows[0].program,'BSc Computer Science');
  await assert.rejects(member(MEMBER,tx=>tx.query('SELECT * FROM public.membership_certificates')),/permission denied/);
  await assert.rejects(as('anon',null,tx=>tx.query('SELECT * FROM public.member_profiles')),/permission denied/);
 });
 await t.test('notifications support read updates but reject content rewriting and cross-member access',async()=>{
  const id=(await db.query('SELECT id FROM public.member_notifications WHERE user_id=$1 LIMIT 1',[MEMBER])).rows[0].id;
  const read=await member(MEMBER,tx=>tx.query('UPDATE public.member_notifications SET read=true,read_at=now() WHERE id=$1 RETURNING *',[id]));
  assert.equal(read.rows[0].read,true);assert.ok(read.rows[0].updated_at);
  await assert.rejects(member(MEMBER,tx=>tx.query("UPDATE public.member_notifications SET title='forged' WHERE id=$1",[id])),/permission denied/);
  assert.equal((await member(OTHER,tx=>tx.query('UPDATE public.member_notifications SET read=true WHERE id=$1 RETURNING id',[id]))).rows.length,0);
 });
 await t.test('event rules cover direct API writes; upcoming query filters before limiting',async()=>{
  const ids={};
  for(const [slug,status,date] of [['future','published',1],['past','published',-1],['draft','draft',1],['planned','published',null]]){
   ids[slug]=(await db.query("INSERT INTO public.events(title,slug,status,date) VALUES($1,$1,$2,CASE WHEN $3::int IS NULL THEN NULL ELSE current_date+$3::int END) RETURNING id",[slug,status,date])).rows[0].id;
  }
  const register=(id,status='registered')=>member(MEMBER,tx=>tx.query('INSERT INTO public.event_registrations(event_id,user_id,status) VALUES($1,$2,$3)',[id,MEMBER,status]));
  await register(ids.future);await assert.rejects(register(ids.future),/duplicate key/);
  for(const id of [ids.past,ids.draft,ids.planned])await assert.rejects(register(id),/row-level security/);
  await assert.rejects(register(ids.future,'attended'),/row-level security/);
  const upcoming=await as('anon',null,tx=>tx.query('SELECT * FROM public.get_upcoming_events(20)'));
  assert.ok(upcoming.rows.some(e=>e.id===ids.future));assert.ok(!upcoming.rows.some(e=>e.id===ids.past));
  assert.equal((await member(OTHER,tx=>tx.query('DELETE FROM public.event_registrations WHERE event_id=$1 RETURNING id',[ids.future]))).rows.length,0);
  assert.equal((await member(MEMBER,tx=>tx.query('DELETE FROM public.event_registrations WHERE event_id=$1 RETURNING id',[ids.future]))).rows.length,1);
 });
 await t.test('anonymous contact inserts are throttled in the database',async()=>{
  const send=()=>as('anon',null,tx=>tx.query("INSERT INTO public.contact_messages(name,email,message) VALUES('Visitor','VISITOR@example.test','Please contact me')"));
  await send();await send();await send();await assert.rejects(send(),/Too many messages/);
 });
 await t.test('PDF authorization denies other members and enforces the shared per-user limit',async()=>{
  await assert.rejects(rpc(OTHER,'authorize_certificate_download',[approved.member_id]),/cannot download/);
  for(let i=0;i<5;i++)await rpc(MEMBER,'authorize_certificate_download',[approved.member_id]);
  await assert.rejects(rpc(MEMBER,'authorize_certificate_download',[approved.member_id]),/wait before downloading/);
 });
 await t.test('notification failures roll back approval and certificate together',async()=>{
  await complete(OTHER);await rpc(OTHER,'submit_membership_application');await rpc(ADMIN,'start_membership_review',[OTHER]);
  await db.exec("CREATE FUNCTION public.fail_test_notification() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'test notification failure'; END $$; CREATE TRIGGER test_notification_failure BEFORE INSERT ON public.member_notifications FOR EACH ROW EXECUTE FUNCTION public.fail_test_notification();");
  await assert.rejects(rpc(ADMIN,'approve_membership_application',[OTHER]),/test notification failure/);
  assert.equal((await db.query('SELECT status FROM public.membership_applications WHERE user_id=$1',[OTHER])).rows[0].status,'under_review');
  assert.equal((await db.query('SELECT count(*)::int AS n FROM public.membership_certificates WHERE user_id=$1',[OTHER])).rows[0].n,0);
  await db.exec('DROP TRIGGER test_notification_failure ON public.member_notifications; DROP FUNCTION public.fail_test_notification();');
 });

await t.test('direct API validation rejects malformed photos and treats whitespace names as incomplete',async()=>{
 await assert.rejects(member(MEMBER,tx=>tx.query("UPDATE public.member_profiles SET profile_photo_url='not-an-image-url' WHERE user_id=$1",[MEMBER])),/valid phone number and profile photo/);
 await member(MEMBER,tx=>tx.query("UPDATE public.member_profiles SET first_name=E'\\n',profile_completed=true WHERE user_id=$1",[MEMBER]));
 assert.equal((await db.query('SELECT profile_completed FROM public.member_profiles WHERE user_id=$1',[MEMBER])).rows[0].profile_completed,false);
});
await t.test('authenticated callers cannot backdate messages to bypass throttling',async()=>{
 await assert.rejects(member(MEMBER,tx=>tx.query("INSERT INTO public.contact_messages(name,email,message,created_at) VALUES('Visitor','backdate@example.test','Message','1970-01-01')")),/permission denied/);
});
await t.test('Auth email changes synchronize profiles and release the former email',async()=>{
 await db.query("UPDATE auth.users SET email='other-new@example.test' WHERE id=$1",[OTHER]);
 assert.equal((await db.query('SELECT email FROM public.member_profiles WHERE user_id=$1',[OTHER])).rows[0].email,'other-new@example.test');
 await db.query("UPDATE auth.users SET email='other@example.test' WHERE id=$1",[DUPLICATE]);
 await member(DUPLICATE,tx=>tx.query('INSERT INTO public.member_profiles(user_id) VALUES($1)',[DUPLICATE]));
});
await t.test('admin search and joins operate before pagination across over 1,000 records',async()=>{
 await db.exec(`
 INSERT INTO auth.users(id,email,email_confirmed_at)
 SELECT md5('directory-'||n)::uuid,'directory-'||n||'@example.test',now() FROM generate_series(1,1105) n;
 INSERT INTO public.member_profiles(user_id,preferred_name)
 SELECT id,'Directory member '||substring(email from 'directory-([0-9]+)@') FROM auth.users WHERE email LIKE 'directory-%';
 INSERT INTO public.membership_applications(user_id,status)
 SELECT id,'submitted' FROM auth.users WHERE email='directory-1104@example.test';
 `);
 const filtered=await member(ADMIN,tx=>tx.query("SELECT * FROM public.get_admin_directory('members','Directory member 1104','submitted',0,50)"));
 assert.equal(filtered.rows.length,1);assert.equal(Number(filtered.rows[0].total_count),1);assert.equal(filtered.rows[0].record.membership_status,'submitted');
 const first=await member(ADMIN,tx=>tx.query("SELECT * FROM public.get_admin_directory('members','Directory member','all',0,50)"));
 const second=await member(ADMIN,tx=>tx.query("SELECT * FROM public.get_admin_directory('members','Directory member','all',50,50)"));
 assert.equal(Number(first.rows[0].total_count),1105);assert.equal(first.rows.length,50);
 assert.equal(first.rows.some(a=>second.rows.some(b=>a.record.user_id===b.record.user_id)),false);
 await assert.rejects(member(MEMBER,tx=>tx.query("SELECT * FROM public.get_admin_directory('members')")),/Admin access/);
});

 await t.test('administrator role invariants also protect direct API updates',async()=>{
  await assert.rejects(member(ADMIN,tx=>tx.query("UPDATE public.admin_roles SET role='EDITOR' WHERE user_id=$1",[ADMIN])),/own administrator role/);
  await assert.rejects(db.query("DELETE FROM public.admin_roles WHERE user_id=$1",[ADMIN]),/final SUPER_ADMIN/);
  await assert.rejects(member(MEMBER,tx=>tx.query("INSERT INTO public.admin_roles(user_id,role) VALUES($1,'SUPER_ADMIN')",[MEMBER])),/row-level security/);
 });
 await t.test('corrective migration is repeatable and preserves issued credentials',async()=>{
  await db.exec(repair);await db.exec(repair);
  const record=await as('anon',null,tx=>tx.query('SELECT * FROM public.get_public_certificate($1)',[approved.member_id]));
  assert.equal(record.rows[0].full_name,'Amina Ahmad');
  assert.equal((await db.query("SELECT count(*)::int AS n FROM public.universities WHERE name='Albukhary International University'")).rows[0].n,1);
 });
});
})();
