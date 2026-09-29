/**
 * Public origin helpers shared by server and client code.
 *
 * The QR code must resolve to the environment the visitor is actually using.
 * NEXT_PUBLIC_SITE_URL is inlined by Next.js at build time, so it works in both
 * runtimes; when it is not configured the browser falls back to its own origin
 * (correct for local testing) and the server falls back to the production origin
 * (never derived from request headers, which would be spoofable).
 *
 * No imports: safe to use from client components.
 */

export const CERTIFICATE_PRODUCTION_URL = 'https://asam.org.my';

export function normaliseSiteUrl(value: string | null | undefined): string {
  return (value || '').trim().replace(/\/+$/, '');
}

/** Empty string when NEXT_PUBLIC_SITE_URL is not configured. */
export function getConfiguredSiteUrl(): string {
  return normaliseSiteUrl(process.env.NEXT_PUBLIC_SITE_URL);
}

export function getServerSiteUrl(): string {
  return getConfiguredSiteUrl() || CERTIFICATE_PRODUCTION_URL;
}

export function getClientSiteUrl(): string {
  const configured = getConfiguredSiteUrl();
  if (configured) return configured;
  if (typeof window !== 'undefined' && window.location && window.location.origin) {
    return normaliseSiteUrl(window.location.origin);
  }
  return CERTIFICATE_PRODUCTION_URL;
}

export function getCertificateVerifyUrl(memberId: string, siteUrl?: string | null): string {
  const base = normaliseSiteUrl(siteUrl) || getServerSiteUrl();
  return base + '/certificate/' + encodeURIComponent(memberId);
}
