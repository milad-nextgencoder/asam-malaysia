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

/**
 * Normalises a configured origin, returning '' when the value cannot be used as
 * one. Rejecting a malformed value here matters: app/layout.tsx builds
 * `new URL(getServerSiteUrl())` at module load, so a typo such as
 * NEXT_PUBLIC_SITE_URL=https:/asam.org.my would otherwise throw during render
 * and take down every route, not just the certificate pages.
 *
 * The parsed origin is returned rather than the raw string because the WHATWG
 * URL parser silently repairs a missing slash ("https:/asam.org.my"), which
 * would otherwise leak into certificate QR codes as an unopenable URL.
 */
function toSafeOrigin(value: string | null | undefined): string {
  const candidate = normaliseSiteUrl(value);
  if (!candidate) return '';
  try {
    const url = new URL(candidate);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return '';
    return url.origin;
  } catch {
    return '';
  }
}

/** The configured origin, or '' when unset or malformed. */
export function getConfiguredSiteUrl(): string {
  return toSafeOrigin(process.env.NEXT_PUBLIC_SITE_URL);
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

/**
 * Resolves the origin that Supabase auth emails and OAuth redirects must point at.
 *
 * The auth actions previously used `NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'`.
 * NEXT_PUBLIC_SITE_URL is not set in production, so every confirmation link and
 * Google redirect was built from `http://localhost:3000`. Supabase only honours a
 * redirect that is in the project's allow-list, so it silently fell back to the
 * Site URL and dropped the member on the public homepage instead of /member.
 *
 * Resolution order:
 *   1. NEXT_PUBLIC_SITE_URL  - explicit configuration, wins in every environment.
 *   2. requestOrigin         - the host the user actually reached (Vercel preview
 *                              deployments, localhost dev, custom domains).
 *   3. VERCEL_URL            - the deployment's own domain when no origin was passed.
 *   4. http://localhost:3000 - development only, never in production.
 *   5. the production origin - the last resort so production is never localhost.
 */
export function getAuthOrigin(requestOrigin?: string | null): string {
  const configured = getConfiguredSiteUrl();
  if (configured) return configured;

  const fromRequest = toSafeOrigin(requestOrigin);
  if (fromRequest) return fromRequest;

  const fromVercel = toSafeOrigin(
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null
  );
  if (fromVercel) return fromVercel;

  if (process.env.NODE_ENV !== 'production') return 'http://localhost:3000';

  return CERTIFICATE_PRODUCTION_URL;
}

/** Absolute URL for an auth callback, always rooted at {@link getAuthOrigin}. */
export function getAuthCallbackUrl(path: string, requestOrigin?: string | null): string {
  const suffix = path.startsWith('/') ? path : `/${path}`;
  return getAuthOrigin(requestOrigin) + suffix;
}
