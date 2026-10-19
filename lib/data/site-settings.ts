import { unstable_cache } from 'next/cache';
import { createPublicClient } from '@/lib/supabase/server';

/**
 * Cache tag for the singleton `site_settings` row. Admin saves call
 * `revalidateTag(SITE_SETTINGS_TAG)` (see app/admin/actions/remaining-cms.ts)
 * so the cached value is refreshed immediately after an edit.
 */
export const SITE_SETTINGS_TAG = 'site-settings';

const SITE_SETTINGS_COLUMNS =
  'organization_name,tagline,favicon_url,logo_url,contact_email,phone,social_links,footer_text';

const DEFAULT_LOGO_URL = '/logo-512.png';

async function fetchSiteSettings() {
  // Cookieless anonymous read: keeps the root layout static-friendly.
  // Errors are thrown (not returned) so failed reads are never cached.
  const { data, error } = await createPublicClient()
    .from('site_settings')
    .select(SITE_SETTINGS_COLUMNS)
    .eq('singleton', true)
    .maybeSingle();

  if (error) throw error;
  return data;
}

/**
 * Cached public site settings. Shared by the root layout (metadata, header
 * logo) and the footer. Revalidates on tag and, as a backstop, every 5 minutes.
 */
export const getSiteSettings = unstable_cache(fetchSiteSettings, ['site-settings'], {
  tags: [SITE_SETTINGS_TAG],
  revalidate: 300,
});

/** Accepts only absolute http(s) URLs or the bundled default logo. */
export function resolveLogoUrl(value: string | null | undefined): string {
  return value && /^https?:\/\//i.test(value) ? value : DEFAULT_LOGO_URL;
}
