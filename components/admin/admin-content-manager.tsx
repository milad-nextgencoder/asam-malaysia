'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { contentConfig, pageContentModules, type ContentField, type ContentModule } from '@/lib/admin/content-config';
import { ADMIN_FEEDBACK } from '@/lib/admin/feedback';
import { useAdminFeedback } from '@/lib/admin/use-admin-feedback';
import { changeContentStatus, deleteContent, recordContentImageUpload, reorderContent, saveContent } from '@/app/admin/actions/content';
import { ArrowDown, ArrowUp, Eye, ImagePlus, Pencil, Plus, Search, X } from 'lucide-react';

type RecordRow = Record<string, any> & { id: string; status: string; updated_at?: string; created_at?: string };

const inputClass = 'w-full rounded-lg border border-[#e2e5e9] bg-white px-3 py-2.5 text-sm text-[#172436] outline-none focus:border-[#b6974e] focus:ring-2 focus:ring-[#b6974e]/15';
const labelClass = 'mb-1.5 block text-xs font-semibold text-[#596273]';
const formatTimestamp = (value: string) => new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'medium', timeZone: 'Asia/Kuala_Lumpur' }).format(new Date(value));
const formatDate = (value: string) => new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeZone: 'Asia/Kuala_Lumpur' }).format(new Date(value));

export function AdminContentManager({ module, initialRecords, departments = [] }: { module: ContentModule; initialRecords: RecordRow[]; departments?: { id: string; name: string; number: string }[] }) {
  const config = contentConfig[module];
  const router = useRouter();
  const [records, setRecords] = useState(initialRecords);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editing, setEditing] = useState<RecordRow | null | undefined>(undefined);
  const { run: runWithFeedback, notice, error, pending, setNotice, setError } = useAdminFeedback();
  const [preview, setPreview] = useState<RecordRow | null>(null);
  useEffect(() => setRecords(initialRecords), [initialRecords]);
  const visibleRecords = useMemo(() => records.filter((record) => (statusFilter === 'all' || record.status === statusFilter) && JSON.stringify(record).toLowerCase().includes(query.toLowerCase())), [records, query, statusFilter]);
  const published = records.filter((r) => ['published', 'active', 'coming_soon'].includes(r.status)).length;
  const drafts = records.filter((r) => r.status === 'draft' || r.status === 'inactive').length;
  const hidden = records.filter((r) => r.status === 'archived').length;

  /**
   * Replaces the previous startTransition wrapper, which had no re-entry guard
   * (a double tap fired the action twice) and no visible "Saving..." state.
   * The shared hook also raises a toast, so confirmation is visible even when the
   * inline banner is scrolled out of view in a long list.
   */
  function run(action: () => Promise<any>, success: string) {
    void runWithFeedback(action, { success, onSuccess: () => router.refresh() });
  }

  function move(index: number, delta: number) {
    const current = visibleRecords[index];
    if (!current) return;
    const group = visibleRecords.filter((row) => !config.pageItems || row.collection_key === current.collection_key);
    const groupIndex = group.findIndex((row) => row.id === current.id);
    const target = groupIndex + delta;
    if (target < 0 || target >= group.length) return;
    [group[groupIndex], group[target]] = [group[target], group[groupIndex]];
    const nextGroup = new Map(group.map((row, order) => [row.id, { ...row, display_order: order + 1 }]));
    const nextRecords = records.map((row) => nextGroup.get(row.id) || row);
    setRecords(nextRecords);
    run(() => reorderContent(module, group.map((row) => row.id)), ADMIN_FEEDBACK.saved);
  }

  /**
   * Save from the editor. Publish uses the distinct "Published successfully"
   * wording; a draft save reports "Saved successfully".
   */
  async function submit(values: Record<string, unknown>, status: string, id?: string) {
    const isPublish = !(status === 'draft' || status === 'inactive');
    return runWithFeedback(
      () => saveContent({ module, id, values, status }),
      {
        success: isPublish ? ADMIN_FEEDBACK.published : ADMIN_FEEDBACK.saved,
        // The editor closes and the list re-reads only once the write succeeded.
        onSuccess: () => {
          setEditing(undefined);
          router.refresh();
        },
      }
    );
  }

  async function setStatus(record: RecordRow, status: string) {
    const isPublish = status === 'published' || status === 'active' || status === 'coming_soon';
    const success = isPublish
      ? ADMIN_FEEDBACK.published
      : status === 'archived'
        ? ADMIN_FEEDBACK.saved
        : ADMIN_FEEDBACK.saved;
    run(() => changeContentStatus(module, record.id, status), success);
  }

  const statusLabel = (status: string) => status.replaceAll('_', ' ').replace(/^./, (c) => c.toUpperCase());

  return <div className="mx-auto max-w-7xl space-y-6">
    <header className="rounded-xl border border-[#e4e5e8] bg-white p-5 shadow-sm sm:p-7">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><p className="text-[9px] font-bold uppercase tracking-[.18em] text-[#a08343]">ASAM Content Studio</p><h2 className="mt-2 font-display text-2xl font-semibold text-[#172436]">{config.title} Management</h2><p className="mt-2 max-w-2xl text-sm text-[#6c7480]">Manage published {config.title.toLowerCase()} content shown on the existing public website.</p></div>
        <button onClick={() => { setError(''); setEditing(null); }} className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#142238] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#243750]"><Plus className="h-4 w-4" /> {pageContentModules.includes(module as any) ? 'Add Section' : `Add ${module === 'leadership' ? 'Leader' : config.title.replace(/s$/, '')}`}</button>
      </div>
      <div className="mt-6 grid grid-cols-3 gap-3">
        {[['Published', published], ['Drafts', drafts], ['Hidden / archived', hidden]].map(([label, count]) => <div key={label} className="rounded-lg border border-[#eceef1] bg-[#fafaf9] px-3 py-3"><div className="text-[9px] font-bold uppercase tracking-wider text-[#858b95]">{label}</div><div className="mt-1 text-xl font-semibold text-[#172436]">{count}</div></div>)}
      </div>
      <p className="mt-4 text-[9px] uppercase tracking-wider text-[#8a8f98]">Last updated <span className="font-semibold text-[#586273]">{records.map((r) => r.updated_at).filter(Boolean).sort().at(-1) ? formatTimestamp(records.map((r) => r.updated_at).filter(Boolean).sort().at(-1)!) : 'No database records'}</span></p>
    </header>
    {notice && <p role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{notice}</p>}{error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}
    <div className="grid gap-3 sm:grid-cols-[1fr_190px]"><div className="relative"><Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9aa0aa]"/><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={`Search ${config.title.toLowerCase()}...`} className={`${inputClass} pl-10`}/></div><select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={inputClass}><option value="all">All statuses</option>{(module === 'chapters' ? ['active','coming_soon','inactive'] : ['draft','published','archived']).map((status) => <option key={status} value={status}>{statusLabel(status)}</option>)}</select></div>
    {!records.length ? <div className="rounded-xl border border-dashed border-[#d9dce1] bg-white px-5 py-16 text-center"><p className="font-display text-xl font-semibold text-[#172436]">No {config.title.toLowerCase()} yet</p><p className="mt-2 text-sm text-[#727986]">Create a record to manage it here. No sample content has been added.</p></div> : <div className="space-y-3">
      {visibleRecords.map((record, index) => <article key={record.id} className="rounded-xl border border-[#e4e5e8] bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="truncate font-semibold text-[#172436]">{record.section_label || record.name || record.title || 'Untitled'}</h3><span className={`rounded-full px-2.5 py-1 text-[9px] font-bold uppercase ${['published','active','coming_soon'].includes(record.status) ? 'bg-emerald-50 text-emerald-700' : record.status === 'archived' ? 'bg-gray-100 text-gray-600' : 'bg-amber-50 text-amber-700'}`}>{statusLabel(record.status)}</span></div><p className="mt-1 text-xs text-[#737b87]">{record.section_key || record.collection_key || record.position || record.category || record.state || record.number || record.slug || ''}{record.item_type ? ` · ${record.item_type.replaceAll('_',' ')}` : ''}{record.display_order !== undefined ? ` · Order ${record.display_order}` : ''}{record.updated_at ? ` · Updated ${formatDate(record.updated_at)}` : ''}</p></div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setPreview(record)} className="rounded-md border border-[#e1e4e8] px-2.5 py-2 text-xs font-semibold text-[#455064] hover:bg-gray-50"><Eye className="mr-1 inline h-3.5 w-3.5"/>Preview</button>
            <button onClick={() => { setError(''); setEditing(record); }} className="rounded-md border border-[#e1e4e8] px-2.5 py-2 text-xs font-semibold text-[#455064] hover:bg-gray-50"><Pencil className="mr-1 inline h-3.5 w-3.5"/>Edit</button>
            {module === 'events' && <button onClick={() => { setError(''); setEditing({ ...record, id: undefined, title: `${record.title} (Copy)`, slug: '', status: 'draft' } as unknown as RecordRow); }} className="rounded-md border border-[#e1e4e8] px-2.5 py-2 text-xs font-semibold text-[#455064]">Duplicate</button>}
            {config.ordered && <><button title="Move up" disabled={index === 0} onClick={() => move(index, -1)} className="rounded-md border border-[#e1e4e8] px-2.5 py-2 text-xs disabled:opacity-40"><ArrowUp className="h-3.5 w-3.5"/></button><button title="Move down" disabled={index === visibleRecords.length - 1} onClick={() => move(index, 1)} className="rounded-md border border-[#e1e4e8] px-2.5 py-2 text-xs disabled:opacity-40"><ArrowDown className="h-3.5 w-3.5"/></button></>}
            <button disabled={pending} onClick={() => { const hiding = record.status === 'published' || record.status === 'active' || record.status === 'coming_soon'; if (!hiding || window.confirm('Unpublish or hide this item from the public website?')) setStatus(record, hiding ? (module === 'chapters' ? 'inactive' : 'draft') : (module === 'chapters' ? 'active' : 'published')); }} className="rounded-md bg-[#f5f1e7] px-2.5 py-2 text-xs font-semibold text-[#79612a] disabled:opacity-50">{record.status === 'published' || record.status === 'active' || record.status === 'coming_soon' ? 'Unpublish / Hide' : 'Publish / Show'}</button>
            {module !== 'chapters' && <button disabled={pending} onClick={() => { if (window.confirm(`Archive “${record.name || record.title}”?`)) setStatus(record, 'archived'); }} className="rounded-md border border-[#e1e4e8] px-2.5 py-2 text-xs font-semibold text-[#596273] disabled:opacity-50">Archive</button>}
            <button disabled={pending} onClick={() => { if (window.confirm(`Permanently delete “${record.name || record.title}”? This cannot be undone.`)) run(() => deleteContent(module, record.id), ADMIN_FEEDBACK.deleted); }} className="rounded-md border border-red-200 px-2.5 py-2 text-xs font-semibold text-red-700 disabled:opacity-50">Delete</button>
          </div>
        </div>
      </article>)}
    </div>}
    {editing !== undefined && <Editor key={editing?.id || 'new'} module={module} initial={editing} departments={departments} busy={pending} onClose={() => setEditing(undefined)} onSubmit={submit} />}
    {preview && <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#101b2b]/50 p-4" onMouseDown={(e) => e.target === e.currentTarget && setPreview(null)}><div className="max-h-[85vh] w-full max-w-xl overflow-auto rounded-xl bg-white p-6 shadow-xl"><div className="flex justify-between"><h3 className="font-display text-xl font-semibold">Preview: {preview.name || preview.title || preview.organization || preview.question}</h3><button onClick={() => setPreview(null)} aria-label="Close preview"><X className="h-5 w-5"/></button></div><div className="mt-4 space-y-3">{config.fields.map((field) => preview[field.name] ? <div key={field.name}><div className="text-[9px] font-bold uppercase text-[#8a8f98]">{field.label}</div>{field.type === 'image' ? <img src={preview[field.name]} alt="Preview" className="mt-1 max-h-48 rounded-lg object-contain"/> : field.type === 'file' ? <a href={preview[field.name]} target="_blank" rel="noreferrer" className="mt-1 inline-block text-sm text-[#79612a] underline">Open document</a> : <p className="mt-1 whitespace-pre-wrap text-sm text-[#374151]">{typeof preview[field.name] === 'object' ? JSON.stringify(preview[field.name], null, 2) : String(preview[field.name])}</p>}</div> : null)}</div></div></div>}
  </div>;
}

function Editor({ module, initial, departments, busy, onClose, onSubmit }: { module: ContentModule; initial: RecordRow | null; departments: { id: string; name: string; number: string }[]; busy: boolean; onClose: () => void; onSubmit: (values: Record<string, unknown>, status: string, id?: string) => Promise<boolean> }) {
  const config = contentConfig[module];
  const [values, setValues] = useState<Record<string, any>>(() => Object.fromEntries(config.fields.map((f) => [f.name, initial?.[f.name] ?? (f.name === 'social_links' ? '{}' : f.name === 'display_order' ? (initial?.display_order ?? 1) : '')])));
  const [status, setStatus] = useState(initial?.status ?? (module === 'chapters' ? 'inactive' : 'draft'));
  const [uploading, setUploading] = useState('');
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  function set(name: string, value: unknown) { setValues((current) => ({ ...current, [name]: value })); }
  async function upload(field: ContentField, file?: File) {
    if (!file) return;
    const allowedType = field.type === 'file' ? file.type === 'application/pdf' : ['image/jpeg','image/png','image/webp'].includes(file.type);
    if (!allowedType || file.size > 20 * 1024 * 1024) { setFormError(field.type === 'file' ? 'Choose a PDF smaller than 20 MB.' : 'Choose a JPG, PNG, or WEBP image smaller than 20 MB.'); return; }
    setFormError(''); setUploading(field.name);
    try {
      const extension = field.type === 'file' ? 'pdf' : (file.name.split('.').pop()?.toLowerCase() || 'jpg');
      const path = `${module}/${crypto.randomUUID()}.${extension}`;
      const client = createClient();
      const { error } = await client.storage.from('asam-public-media').upload(path, file, { contentType: file.type, upsert: false });
      if (error) throw new Error('The image upload failed. Check your admin permissions and try again.');
      const { data } = client.storage.from('asam-public-media').getPublicUrl(path);
      const audit = await recordContentImageUpload(module, path);
      set(field.name, data.publicUrl);
      if (!audit.ok) setFormError('Image uploaded, but its audit entry could not be recorded.');
    } catch (error) { setFormError(error instanceof Error ? error.message : 'The image upload failed.'); }
    finally { setUploading(''); }
  }
  async function save(asStatus: string) { setSaving(true); setFormError(''); const ok = await onSubmit(values, asStatus, initial?.id); setSaving(false); }
  const chapterOptions = ['active','coming_soon','inactive'];
  return <div className="fixed inset-0 z-[60] overflow-y-auto bg-[#101b2b]/50 p-3 sm:p-6"><div className="mx-auto my-4 w-full max-w-3xl rounded-xl bg-white shadow-xl">
    <div className="flex items-center justify-between border-b border-[#e9eaec] px-5 py-4 sm:px-7"><div><p className="text-[9px] font-bold uppercase tracking-widest text-[#a08343]">{initial ? 'Edit record' : pageContentModules.includes(module as any) ? 'New page section' : 'New record'}</p><h3 className="mt-1 font-display text-xl font-semibold text-[#172436]">{initial?.section_label || initial?.name || initial?.title || (pageContentModules.includes(module as any) ? 'Add Page Section' : `Add ${config.title.replace(/s$/, '')}`)}</h3></div><button onClick={onClose} aria-label="Close editor"><X className="h-5 w-5 text-[#677080]"/></button></div>
      <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-7">{config.fields.map((field) => <div key={field.name} className={field.type === 'textarea' || field.type === 'image' || field.type === 'file' || field.name === 'social_links' ? 'sm:col-span-2' : ''}><label className={labelClass}>{field.label}</label>{field.name === 'department_id' ? <select className={inputClass} value={values[field.name] || ''} onChange={(e) => set(field.name, e.target.value || null)}><option value="">No department selected</option>{departments.map((d) => <option key={d.id} value={d.id}>{d.number} · {d.name}</option>)}</select> : field.name === 'social_links' ? <div className="grid gap-3 sm:grid-cols-2">{['website','instagram','facebook','linkedin'].map((network) => <div key={network}><label className="mb-1 block text-[9px] font-semibold uppercase text-[#858b95]">{network}</label><input className={inputClass} value={(values.social_links && typeof values.social_links === 'object' ? values.social_links[network] : '') || ''} onChange={(e) => set('social_links', { ...(values.social_links && typeof values.social_links === 'object' ? values.social_links : {}), [network]: e.target.value })} placeholder="https://"/></div>)}</div> : field.type === 'select' ? <select className={inputClass} value={values[field.name] || ''} onChange={(e) => set(field.name, e.target.value)}><option value="">Select…</option>{field.options?.map((option) => <option key={option} value={option}>{option.replaceAll('_',' ')}</option>)}</select> : field.type === 'image' || field.type === 'file' ? <div className="space-y-2"><div className="flex gap-2"><input className={inputClass} value={values[field.name] || ''} onChange={(e) => set(field.name, e.target.value)} placeholder={field.type === 'file' ? 'Public file URL' : 'Image URL or upload below'}/><label className="inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-lg border border-[#e1e4e8] px-3 text-xs font-semibold text-[#455064]"><ImagePlus className="h-4 w-4"/>{uploading === field.name ? 'Uploading…' : 'Upload'}<input className="hidden" type="file" accept={field.type === 'file' ? 'application/pdf,.pdf' : 'image/jpeg,image/png,image/webp'} disabled={!!uploading} onChange={(e) => upload(field, e.target.files?.[0])}/></label></div>{values[field.name] && (field.type === 'file' ? <a href={values[field.name]} target="_blank" rel="noreferrer" className="text-sm font-semibold text-[#79612a] underline">Open uploaded PDF</a> : <img src={values[field.name]} alt="Selected image preview" className="max-h-48 rounded-lg border border-[#e5e7eb] object-contain"/>)}</div> : field.type === 'textarea' ? <textarea rows={field.name === 'content' || field.name === 'bio' ? 6 : 3} className={inputClass} value={typeof values[field.name] === 'object' ? JSON.stringify(values[field.name], null, 2) : values[field.name] || ''} onChange={(e) => set(field.name, e.target.value)} /> : <input className={inputClass} type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : field.type === 'time' ? 'time' : 'text'} value={values[field.name] ?? ''} onChange={(e) => set(field.name, e.target.value)} required={field.required}/>}</div>)}
      <div className="sm:col-span-2"><label className={labelClass}>Status</label><select className={inputClass} value={status} onChange={(e) => setStatus(e.target.value)}>{(module === 'chapters' ? chapterOptions : ['draft','published','archived']).map((option) => <option key={option} value={option}>{option.replaceAll('_',' ').toUpperCase()}</option>)}</select>{module === 'chapters' && <p className="mt-1 text-[9px] text-[#777f8c]">This existing table stores chapter state as Active, Coming Soon, or Inactive. Inactive chapters are hidden publicly.</p>}</div>
      {formError && <p role="alert" className="sm:col-span-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</p>}
    </div>
    {/*
      The action bar is sticky at the bottom of the scrolling editor so Save
      Draft / Publish are always reachable on a phone. The editor body scrolls
      inside this container, so a sticky bar does not fight the page scroll.
    */}
    <div className="sticky bottom-0 z-10 flex flex-wrap justify-end gap-2 border-t border-[#e9eaec] bg-white/95 px-5 py-4 backdrop-blur sm:px-7"><button onClick={onClose} disabled={saving} className="rounded-lg border border-[#e1e4e8] px-4 py-2.5 text-sm font-semibold text-[#455064] disabled:opacity-50">Cancel</button><button disabled={busy || saving || !!uploading} onClick={() => save(module === 'chapters' ? 'inactive' : 'draft')} className="rounded-lg border border-[#d9dce1] px-4 py-2.5 text-sm font-semibold text-[#455064] disabled:opacity-50">{saving ? ADMIN_FEEDBACK.saving : 'Save Draft'}</button><button disabled={busy || saving || !!uploading} onClick={() => save(status === 'archived' ? 'archived' : module === 'chapters' ? status === 'inactive' ? 'active' : status : 'published')} className="inline-flex items-center gap-2 rounded-lg bg-[#142238] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{saving ? ADMIN_FEEDBACK.saving : status === 'archived' ? 'Save Archived' : 'Publish'}</button></div>
  </div></div>;
}
