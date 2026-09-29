'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin, requireSuperAdmin } from '@/lib/supabase/admin';

const failure = 'The request could not be completed. Check the form and your administrator access, then try again.';

async function actorContext(superOnly = false) {
  if (superOnly) await requireSuperAdmin(); else await requireAdmin();
  const supabase = createClient();
  const { data } = await supabase.auth.getClaims();
  return { supabase, actor: typeof data?.claims?.sub === 'string' ? data.claims.sub : null };
}

async function audit(supabase: any, actor: string | null, action: string, entity: string, id: string | null, metadata: Record<string, unknown> = {}) {
  const { error } = await supabase.from('audit_logs').insert({ actor_user_id: actor, action, entity_type: entity, entity_id: id, metadata });
  return !error;
}

export async function setMessageStatus(id: string, status: string) {
  if (!id || !['new', 'read', 'replied', 'archived'].includes(status)) return { ok: false, message: failure };
  try {
    const { supabase, actor } = await actorContext();
    const { data, error } = await supabase.from('contact_messages').update({ status }).eq('id', id).select('id').maybeSingle();
    if (error || !data) return { ok: false, message: failure };
    const auditSaved = await audit(supabase, actor, `contact_messages.${status}`, 'contact_message', id);
    revalidatePath('/admin/messages');
    return { ok: true, auditSaved };
  } catch { return { ok: false, message: failure }; }
}

export async function deleteMessage(id: string) {
  if (!id) return { ok: false, message: failure };
  try {
    const { supabase, actor } = await actorContext(true);
    const { error } = await supabase.from('contact_messages').delete().eq('id', id);
    if (error) return { ok: false, message: failure };
    const auditSaved = await audit(supabase, actor, 'contact_messages.delete', 'contact_message', id);
    revalidatePath('/admin/messages');
    return { ok: true, auditSaved };
  } catch { return { ok: false, message: failure }; }
}

export async function saveSiteSettings(input: Record<string, unknown>) {
  try {
    const { supabase, actor } = await actorContext(true);
    const allowed = ['organization_name', 'tagline', 'contact_email', 'phone', 'social_links', 'footer_text', 'logo_url', 'favicon_url'];
    const values: Record<string, unknown> = {};
    for (const key of allowed) {
      const value = input[key];
      if (typeof value === 'string') {
        const trimmed = value.trim();
        if (trimmed.length > (key === 'footer_text' || key === 'tagline' ? 2000 : 300)) return { ok: false, message: 'A settings field is too long.' };
        values[key] = trimmed || null;
      } else if (key === 'social_links' && value && typeof value === 'object' && !Array.isArray(value)) {
        const social: Record<string, string> = {};
        for (const [name, url] of Object.entries(value as Record<string, unknown>)) {
          if (!['website', 'instagram', 'facebook', 'linkedin', 'youtube', 'twitter'].includes(name) || typeof url !== 'string') continue;
          const clean = url.trim();
          if (clean && !/^https:\/\//i.test(clean)) return { ok: false, message: 'Social links must use secure https URLs.' };
          if (clean) social[name] = clean;
        }
        values.social_links = social;
      }
    }
    if (values.contact_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(values.contact_email))) return { ok: false, message: 'Enter a valid contact email.' };
    for (const key of ['logo_url', 'favicon_url']) if (values[key] && !((String(values[key]).startsWith('/') && !String(values[key]).startsWith('//')) || /^https:\/\//i.test(String(values[key])))) return { ok: false, message: 'Logo and favicon must be a safe site path or HTTPS URL.' };
    const { data: before } = await supabase.from('site_settings').select('id,logo_url,favicon_url').eq('singleton', true).maybeSingle();
    const { data, error } = await supabase.from('site_settings').update({ ...values, updated_at: new Date().toISOString() }).eq('singleton', true).select('id').maybeSingle();
    if (error || !data) return { ok: false, message: failure };
    let auditSaved = await audit(supabase, actor, 'site_settings.update', 'site_settings', data.id);
    if ((values.logo_url && values.logo_url !== before?.logo_url) || (values.favicon_url && values.favicon_url !== before?.favicon_url)) {
      auditSaved = await audit(supabase, actor, 'site_settings.image_upload', 'site_settings', data.id) && auditSaved;
    }
    revalidatePath('/', 'layout'); revalidatePath('/admin/settings');
    return { ok: true, auditSaved };
  } catch { return { ok: false, message: failure }; }
}

export async function saveGalleryAlbum(input: { id?: string; name: string; description: string; category: string; display_order: number; status: string; cover_image_url?: string | null }) {
  if (!input.name.trim() || !['draft', 'published', 'archived'].includes(input.status) || !Number.isFinite(input.display_order)) return { ok: false, message: 'Provide an album name and valid values.' };
  try {
    const { supabase, actor } = await actorContext();
    const values = { name: input.name.trim().slice(0, 200), description: input.description.trim().slice(0, 5000) || null, category: input.category.trim().slice(0, 80) || null, display_order: Math.max(0, Math.min(10000, Math.floor(input.display_order))), status: input.status, cover_image_url: input.cover_image_url || null, updated_at: new Date().toISOString() };
    const result = input.id ? await supabase.from('gallery_albums').update(values).eq('id', input.id).select('id').maybeSingle() : await supabase.from('gallery_albums').insert(values).select('id').single();
    if (result.error || !result.data) return { ok: false, message: 'Could not save album. If Category is unavailable, apply the new additive CMS migration first.' };
    const auditSaved = await audit(supabase, actor, input.id ? 'gallery_album.edit' : 'gallery_album.create', 'gallery_album', result.data.id, { status: input.status });
    revalidatePath('/admin/gallery'); revalidatePath('/gallery');
    return { ok: true, id: result.data.id, auditSaved };
  } catch { return { ok: false, message: failure }; }
}

export async function saveGalleryItem(input: { id?: string; album_id?: string; image_url?: string; title?: string; caption?: string; display_order?: number; status?: string }) {
  if (!input.album_id || !input.image_url || !input.status || !/^https:\/\//i.test(input.image_url) || !['draft', 'published', 'archived'].includes(input.status)) return { ok: false, message: 'Choose an album, a valid uploaded image, and a status.' };
  try {
    const { supabase, actor } = await actorContext();
    const values = { album_id: input.album_id, image_url: input.image_url, title: input.title?.trim().slice(0, 200) || null, caption: input.caption?.trim().slice(0, 2000) || null, display_order: Math.max(0, Math.min(10000, Math.floor(input.display_order || 0))), status: input.status, updated_at: new Date().toISOString() };
    const { data: previous } = input.id ? await supabase.from('gallery_items').select('image_url').eq('id', input.id).maybeSingle() : { data: null };
    const result = input.id ? await supabase.from('gallery_items').update(values).eq('id', input.id).select('id').maybeSingle() : await supabase.from('gallery_items').insert(values).select('id').single();
    if (result.error || !result.data) return { ok: false, message: failure };
    let auditSaved = await audit(supabase, actor, input.id ? 'gallery_item.edit' : 'gallery_item.upload', 'gallery_item', result.data.id, { album_id: input.album_id });
    if (previous?.image_url && previous.image_url !== input.image_url) auditSaved = await audit(supabase, actor, 'gallery_item.replace', 'gallery_item', result.data.id, { album_id: input.album_id }) && auditSaved;
    revalidatePath('/admin/gallery'); revalidatePath('/gallery'); revalidatePath(`/gallery/${input.album_id}`);
    return { ok: true, id: result.data.id, auditSaved };
  } catch { return { ok: false, message: failure }; }
}

export async function setGalleryStatus(table: 'gallery_albums' | 'gallery_items', id: string, status: string) {
  if (!id || !['draft', 'published', 'archived'].includes(status)) return { ok: false, message: failure };
  try {
    const { supabase, actor } = await actorContext();
    const { data, error } = await supabase.from(table).update({ status, updated_at: new Date().toISOString() }).eq('id', id).select('id').maybeSingle();
    if (error || !data) return { ok: false, message: failure };
    const auditSaved = await audit(supabase, actor, `${table}.${status}`, table === 'gallery_items' ? 'gallery_item' : 'gallery_album', id);
    revalidatePath('/admin/gallery'); revalidatePath('/gallery');
    return { ok: true, auditSaved };
  } catch { return { ok: false, message: failure }; }
}

export async function deleteGalleryRecord(table: 'gallery_albums' | 'gallery_items', id: string) {
  if (!id) return { ok: false, message: failure };
  try {
    const { supabase, actor } = await actorContext();
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) return { ok: false, message: 'Could not delete this item. Albums with images must be emptied first. Storage files are retained to avoid deleting reused media.' };
    const auditSaved = await audit(supabase, actor, `${table}.delete`, table === 'gallery_items' ? 'gallery_item' : 'gallery_album', id);
    revalidatePath('/admin/gallery'); revalidatePath('/gallery');
    return { ok: true, auditSaved };
  } catch { return { ok: false, message: failure }; }
}

export async function setAlbumCover(albumId: string, imageUrl: string | null) {
  try {
    const { supabase, actor } = await actorContext();
    if (imageUrl) {
      const { data: item } = await supabase.from('gallery_items').select('id').eq('album_id', albumId).eq('image_url', imageUrl).maybeSingle();
      if (!item) return { ok: false, message: 'The selected image does not belong to this album.' };
    }
    const { error } = await supabase.from('gallery_albums').update({ cover_image_url: imageUrl, updated_at: new Date().toISOString() }).eq('id', albumId);
    if (error) return { ok: false, message: failure };
    const auditSaved = await audit(supabase, actor, 'gallery_album.cover', 'gallery_album', albumId);
    revalidatePath('/admin/gallery'); revalidatePath('/gallery');
    return { ok: true, auditSaved };
  } catch { return { ok: false, message: failure }; }
}

export async function reorderGallery(table: 'gallery_albums' | 'gallery_items', ids: string[]) {
  if (!Array.isArray(ids) || ids.length > 500 || new Set(ids).size !== ids.length) return { ok: false, message: failure };
  try {
    const { supabase, actor } = await actorContext();
    for (let i = 0; i < ids.length; i += 1) {
      const { error } = await supabase.from(table).update({ display_order: i + 1 }).eq('id', ids[i]);
      if (error) return { ok: false, message: failure };
    }
    const auditSaved = await audit(supabase, actor, `${table}.reorder`, table === 'gallery_items' ? 'gallery_item' : 'gallery_album', null, { count: ids.length });
    revalidatePath('/admin/gallery'); revalidatePath('/gallery');
    return { ok: true, auditSaved };
  } catch { return { ok: false, message: failure }; }
}

export async function changeAdminRole(userId: string, role: 'SUPER_ADMIN' | 'EDITOR' | 'REMOVE') {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(userId) || !['SUPER_ADMIN', 'EDITOR', 'REMOVE'].includes(role)) return { ok: false, message: 'Enter a valid existing Supabase Auth user ID.' };
  try {
    const { supabase, actor } = await actorContext(true);
    if (actor === userId) return { ok: false, message: 'For safety, you cannot change or remove your own administrator role here.' };
    if (role === 'REMOVE' || role === 'EDITOR') {
      const { count, error } = await supabase.from('admin_roles').select('user_id', { count: 'exact', head: true }).eq('role', 'SUPER_ADMIN');
      if (error) return { ok: false, message: failure };
      const { data: existing } = await supabase.from('admin_roles').select('role').eq('user_id', userId).maybeSingle();
      if (existing?.role === 'SUPER_ADMIN' && (count ?? 0) <= 1) return { ok: false, message: 'The final SUPER_ADMIN role cannot be removed or demoted.' };
    }
    const result = role === 'REMOVE' ? await supabase.from('admin_roles').delete().eq('user_id', userId) : await supabase.from('admin_roles').upsert({ user_id: userId, role, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });
    if (result.error) return { ok: false, message: 'Could not update that role. Confirm the Auth user exists and is not your own account.' };
    const auditSaved = await audit(supabase, actor, `admin_role.${role.toLowerCase()}`, 'admin_role', userId, { role });
    revalidatePath('/admin/users');
    return { ok: true, auditSaved };
  } catch { return { ok: false, message: failure }; }
}
