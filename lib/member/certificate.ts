import { readFileSync } from 'fs';
import { join } from 'path';
import { createClient } from '@/lib/supabase/server';
import {
  formatCertificateDate,
  certificateNumberForApplication,
  type CertificateView,
} from './certificate-html';
import {
  CERTIFICATE_PRODUCTION_URL,
  getCertificateVerifyUrl,
  getServerSiteUrl,
} from './site-url';

export { CERTIFICATE_PRODUCTION_URL, getCertificateVerifyUrl, getServerSiteUrl };

export type CertificateRecord = {
  userId: string;
  memberId: string;
  memberName: string;
  certificateNumber: string;
  university: string;
  program: string;
  approvedAt: string | null;
  status: string;
  isApproved: boolean;
};

export type PublicCertificateRow = {
  member_id: string | null;
  certificate_number: string | null;
  status: string | null;
  approved_at: string | null;
  full_name: string | null;
  university_name: string | null;
  program: string | null;
};

export function buildDisplayName(profile: {
  preferred_name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
} | null | undefined): string {
  const preferred = profile?.preferred_name?.trim();
  if (preferred) return preferred;
  const combined = [profile?.first_name, profile?.last_name]
    .map((part) => (part || '').trim())
    .filter(Boolean)
    .join(' ');
  return combined || 'Member';
}

export async function createQrDataUrl(text: string): Promise<string> {
  const QRCode = (await import('qrcode')).default;
  return QRCode.toDataURL(text, {
    width: 240,
    margin: 1,
    errorCorrectionLevel: 'M',
    color: { dark: '#0a1628', light: '#ffffff' },
  });
}

/**
 * Inline logo for the PDF renderer (Puppeteer has no origin, so a URL cannot
 * resolve).
 *
 * The site logo is a 1254x1254 PNG, so inlining it directly would add roughly
 * 1.1 MB of base64 to every certificate document. A small certificate-specific
 * copy is used when it is present, otherwise the original.
 *
 * Returns an empty string when no logo can be read. The certificate then prints
 * the organisation name only: drawing an emblem ASAM has not approved would be
 * worse than omitting it, and the layout is designed to look complete without it.
 */
export function getCertificateLogoDataUrl(): string {
  // Resolved relative to whichever base directory actually exists at runtime.
  // process.cwd() is the repository root under `next dev` / `next start`, but
  // inside a Netlify function it is the bundled function root, where `public/`
  // does not exist. A single cwd()-relative read therefore silently produced a
  // logo-less PDF in production while the website still showed the emblem.
  // The certificate logo is listed in netlify.toml `included_files` so it is
  // present in the function bundle; the extra roots cover the layouts the
  // bundler may use.
  const relativePath = join('images', 'asam-logo-cert.png');
  const baseDirectories = [
    process.cwd(),
    process.env.NETLIFY_LAMBDA_TASK_ROOT || '',
    process.env.LAMBDA_TASK_ROOT || '',
    join(process.cwd(), '..'),
    join(process.cwd(), '..', '..'),
  ].filter(Boolean);

  const seen = new Set();

  for (const base of baseDirectories) {
    for (const candidate of [relativePath, join('public', relativePath), join('logo.png')]) {
      const fullPath = join(base, candidate);
      if (seen.has(fullPath)) continue;
      seen.add(fullPath);

      try {
        const logoBuffer = readFileSync(fullPath);
        if (logoBuffer.length > 0) {
          return `data:image/png;base64,${logoBuffer.toString('base64')}`;
        }
      } catch {
        // Try the next candidate.
      }
    }
  }

  // Surfaced once per cold start rather than swallowed, so a missing logo shows
  // up in function logs instead of only as a visual difference.
  console.warn(
    `[certificate] Logo not found; rendering the PDF without an emblem. Searched: ${Array.from(seen).join(', ')}`
  );

  return '';
}

/**
 * Reads a single certificate.
 *
 * Reads the approved snapshot through the public verification RPC.\n * Database failures never fall back to mutable profile information.
 */
export async function getCertificateRecord(memberId: string): Promise<CertificateRecord | null> {
  const id = (memberId || '').trim();
  if (!id) return null;

  const supabase = await createClient();

  const { data: rpcData, error: rpcError } = await supabase.rpc('get_public_certificate', {
    p_member_id: id,
  });

  if (!rpcError) {
    const row = (Array.isArray(rpcData) ? rpcData[0] : rpcData) as PublicCertificateRow | undefined;
    if (!row || !row.member_id) return null;
    return {
      userId: '',
      memberId: row.member_id,
      memberName: (row.full_name || '').trim() || 'Member',
      certificateNumber: certificateNumberForApplication({
        certificate_number: row.certificate_number,
        member_id: row.member_id,
      }),
      university: (row.university_name || '').trim() || '\u2014',
      program: (row.program || '').trim() || '\u2014',
      approvedAt: row.approved_at,
      status: row.status || 'approved',
      isApproved: (row.status || 'approved') === 'approved',
    };
  }

  console.error('Certificate snapshot lookup failed', { code: rpcError?.code });
  throw new Error('Certificate verification is temporarily unavailable. Please try again.');
}

export function buildCertificateView(
  record: CertificateRecord,
  options: { logoSrc: string; qrSrc: string; siteUrl?: string }
): CertificateView {
  return {
    memberId: record.memberId,
    memberName: record.memberName,
    // certificateNumberForApplication prefers the member id over the stored
    // value, which repairs legacy four-part numbers, so it is used first.
    certificateNumber: certificateNumberForApplication({
      member_id: record.memberId,
      certificate_number: record.certificateNumber,
    }),
    university: record.university,
    program: record.program,
    issueDate: formatCertificateDate(record.approvedAt),
    verifyUrl: getCertificateVerifyUrl(record.memberId, options.siteUrl),
    logoSrc: options.logoSrc,
    qrSrc: options.qrSrc,
  };
}

/**
 * Single entry point used by both the website preview and the PDF route, so the
 * two renderers always receive exactly the same view model.
 */
export async function getCertificateView(
  memberId: string,
  options: { logoSrc: string; siteUrl?: string }
): Promise<{ record: CertificateRecord; view: CertificateView } | null> {
  const record = await getCertificateRecord(memberId);
  if (!record) return null;
  const verifyUrl = getCertificateVerifyUrl(record.memberId, options.siteUrl);
  const qrSrc = await createQrDataUrl(verifyUrl);
  return { record, view: buildCertificateView(record, { ...options, qrSrc }) };
}
