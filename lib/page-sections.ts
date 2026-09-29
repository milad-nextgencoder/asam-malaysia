import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';

export type ManagedPageSection = {
  eyebrow?: string | null;
  title?: string | null;
  subtitle?: string | null;
  description?: string | null;
  body?: string | null;
  image_url?: string | null;
  secondary_image_url?: string | null;
  button_text?: string | null;
  button_url?: string | null;
  secondary_button_text?: string | null;
  secondary_button_url?: string | null;
};

export type ManagedPageItem = {
  id: string;
  page_key: string;
  collection_key: string;
  item_type: string;
  title: string;
  description: string | null;
  body: string | null;
  phase: string | null;
  metric: string | null;
  icon: string | null;
  image_url: string | null;
  link_text: string | null;
  link_url: string | null;
  button_text: string | null;
  button_url: string | null;
  display_order: number;
};

const SECTION_COLUMNS =
  'section_key,section_label,eyebrow,title,subtitle,description,body,image_url,secondary_image_url,button_text,button_url,secondary_button_text,secondary_button_url';

function normaliseSectionKey(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

/**
 * Reads one managed section.
 *
 * `titleHint` is only used as a safety net: public pages derive the database
 * `section_key` from their heading text, so renaming a heading in code would
 * otherwise silently fall back to the hard-coded copy. When the exact key finds
 * nothing, the published sections of the same page are matched by their stored
 * section_key, section_label or title. This extra query only runs on that
 * already-degraded path, so healthy pages are unaffected.
 */
export const getPublishedPageSection = cache(
  async (pageKey: string, sectionKey: string, titleHint?: string): Promise<ManagedPageSection | null> => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('page_sections')
        .select(SECTION_COLUMNS)
        .eq('page_key', pageKey)
        .eq('section_key', sectionKey)
        .eq('visible', true)
        .eq('status', 'published')
        .maybeSingle();

      if (error) return null;
      if (data) return data;
      if (!titleHint) return null;

      const hint = normaliseSectionKey(titleHint);
      if (!hint) return null;

      const { data: siblings, error: fallbackError } = await supabase
        .from('page_sections')
        .select(SECTION_COLUMNS)
        .eq('page_key', pageKey)
        .eq('visible', true)
        .eq('status', 'published');

      if (fallbackError || !siblings || siblings.length === 0) return null;

      const match = siblings.find(
        (sibling) =>
          normaliseSectionKey(String(sibling.section_key || '')) === hint ||
          normaliseSectionKey(String(sibling.section_label || '')) === hint ||
          normaliseSectionKey(String(sibling.title || '')) === hint
      );

      return (match as ManagedPageSection) ?? null;
    } catch {
      // Existing public pages keep their current copy until the additive CMS migration is applied.
      return null;
    }
  }
);

export const getPublishedPageItems = cache(async (pageKey: string, collectionKey: string): Promise<ManagedPageItem[] | null> => {
  try {
    const { data, error } = await createClient()
      .from('page_items')
      .select('id,page_key,collection_key,item_type,title,description,body,phase,metric,icon,image_url,link_text,link_url,button_text,button_url,display_order')
      .eq('page_key', pageKey)
      .eq('collection_key', collectionKey)
      .eq('visible', true)
      .eq('status', 'published')
      .order('display_order', { ascending: true });
    return error ? null : (data ?? []) as ManagedPageItem[];
  } catch {
    return null;
  }
});
