'use server';

import { z } from 'zod';
import { requireAdmin } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { homepageSectionGroups } from '@/lib/homepage/types';

const textField = z.string().trim().max(5000);
const linkField = z.string().trim().max(2048).refine(
  (value) => !value || value.startsWith('/') || /^https:\/\//i.test(value),
  'Use a site path or secure https link.'
);
const sectionInput = z.object({
  section_key: z.string().regex(/^[a-z0-9_]+$/),
  title: textField.min(1).max(300),
  subtitle: textField,
  description: textField,
  image_url: z.string().trim().max(2048).refine((value) => !value || value.startsWith('/') || /^https:\/\//i.test(value), 'Use a site path or secure https image URL.'),
  button_text: textField,
  button_url: linkField,
  secondary_button_text: textField,
  secondary_button_url: linkField,
  display_order: z.number().int().min(1).max(1000),
  visible: z.boolean(),
  status: z.enum(['draft', 'published', 'archived']),
});

function safeResult(error: unknown) {
  if (error && typeof error === 'object' && 'code' in error && error.code === '42501') {
    return { ok: false as const, message: 'Your admin role cannot complete this action under the current database permissions.' };
  }
  return { ok: false as const, message: 'The change could not be saved. Check your connection and try again.' };
}

async function adminContext() {
  const auth = await requireAdmin();
  const supabase = createClient();
  const { data } = await supabase.auth.getClaims();
  const actorId = typeof data?.claims?.sub === 'string' ? data.claims.sub : null;
  return { auth, supabase, actorId };
}

async function audit(
  supabase: Awaited<ReturnType<typeof createClient>>,
  actorId: string | null,
  action: string,
  entityId: string,
  metadata: Record<string, string | number | boolean>
) {
  const { error } = await supabase.from('audit_logs').insert({
    actor_user_id: actorId,
    action,
    entity_type: 'homepage_section',
    entity_id: entityId,
    metadata,
  });
  return !error;
}

export async function saveHomepageSection(input: unknown) {
  await requireAdmin();
  const parsed = sectionInput.safeParse(input);
  if (!parsed.success) return { ok: false as const, message: 'Some fields are invalid. Check the title, links, image URL, and display order.' };
  const { supabase, actorId } = await adminContext();
  const { data, error } = await supabase
    .from('homepage_sections')
    .update({
      ...parsed.data,
      subtitle: parsed.data.subtitle || null,
      description: parsed.data.description || null,
      image_url: parsed.data.image_url || null,
      button_text: parsed.data.button_text || null,
      button_url: parsed.data.button_url || null,
      secondary_button_text: parsed.data.secondary_button_text || null,
      secondary_button_url: parsed.data.secondary_button_url || null,
    })
    .eq('section_key', parsed.data.section_key)
    .select('id, section_key, title, subtitle, description, image_url, button_text, button_url, secondary_button_text, secondary_button_url, display_order, visible, status, created_at, updated_at')
    .maybeSingle();

  if (error) return safeResult(error);
  if (!data) return { ok: false as const, message: 'This homepage section no longer exists. Refresh the page and try again.' };

  const auditSaved = await audit(supabase, actorId, `homepage.${parsed.data.status}`, data.id, {
    section_key: data.section_key,
    title: data.title,
    visible: data.visible,
  });
  return { ok: true as const, section: data, auditSaved };
}

export async function setHomepageVisibility(sectionKeys: string[], visible: boolean) {
  await requireAdmin();
  if (!sectionKeys.length || sectionKeys.some((key) => !homepageSectionGroups.some((group) => group.keys.includes(key)))) return { ok: false as const, message: 'That homepage section is not available.' };
  const { supabase, actorId } = await adminContext();
  let auditSaved = true;
  for (const sectionKey of sectionKeys) {
    const { data, error } = await supabase.from('homepage_sections').update({ visible }).eq('section_key', sectionKey).select('id').maybeSingle();
    if (error) return safeResult(error);
    if (!data) return { ok: false as const, message: 'This homepage section no longer exists. Refresh the page and try again.' };
    auditSaved = await audit(supabase, actorId, visible ? 'homepage.show' : 'homepage.hide', data.id, { section_key: sectionKey, visible }) && auditSaved;
  }
  return { ok: true as const, auditSaved };
}

export async function reorderHomepageSections(orderedKeys: string[]) {
  await requireAdmin();
  const expected = homepageSectionGroups.map((group) => group.key);
  if (orderedKeys.length !== expected.length || new Set(orderedKeys).size !== expected.length || orderedKeys.some((key) => !expected.includes(key))) {
    return { ok: false as const, message: 'The section order is invalid. Refresh the page and try again.' };
  }
  const { supabase, actorId } = await adminContext();
  const result = await supabase.from('homepage_sections').select('id, section_key').in('section_key', homepageSectionGroups.flatMap((group) => group.keys));
  if (result.error || !result.data) return safeResult(result.error);

  let auditSaved = true;
  let position = 1;
  for (const key of orderedKeys) {
    const group = homepageSectionGroups.find((item) => item.key === key)!;
    for (const memberKey of group.keys) {
      const row = result.data.find((item) => item.section_key === memberKey);
      if (!row) continue;
      const { error } = await supabase.from('homepage_sections').update({ display_order: position }).eq('id', row.id);
      if (error) return safeResult(error);
      auditSaved = await audit(supabase, actorId, 'homepage.reorder', row.id, { section_key: memberKey, display_order: position }) && auditSaved;
      position += 1;
    }
  }
  return { ok: true as const, auditSaved };
}

export async function recordHomepageImageUpload(sectionKey: string, imagePath: string) {
  await requireAdmin();
  if (!homepageSectionGroups.some((group) => group.keys.includes(sectionKey)) || !/^homepage\/[a-z0-9_-]+\.[a-z0-9]+$/i.test(imagePath)) {
    return { ok: false as const, message: 'The uploaded image information is invalid.' };
  }
  const { supabase, actorId } = await adminContext();
  const { data, error } = await supabase.from('homepage_sections').select('id').eq('section_key', sectionKey).maybeSingle();
  if (error || !data) return safeResult(error);
  const auditSaved = await audit(supabase, actorId, 'homepage.image_upload', data.id, { section_key: sectionKey, image_path: imagePath });
  return { ok: true as const, auditSaved };
}
