/**
 * Single source of truth for the ASAM membership certificate composition.
 *
 * Both renderers use this module:
 *  - the public website preview  -> app/certificate/[member-id]/page.tsx
 *  - the downloadable PDF        -> lib/member/certificate-pdf.ts
 *
 * The layout is one CSS grid with three rows (header / main / footer) inside a
 * fixed 1123 x 794 px page (A4 landscape at 96 dpi). The main row is the only
 * flexible row ("1fr") and its content is centred inside it, so whitespace is
 * distributed evenly above and below the certificate body. Nothing is anchored
 * outside the grid, which is what previously left a large empty band at the
 * bottom of the PDF.
 *
 * This file intentionally has no imports and uses only erasable TypeScript
 * syntax, so it can be unit tested directly with `node --test`.
 */

export const CERTIFICATE_WIDTH_PX = 1123;
export const CERTIFICATE_HEIGHT_PX = 794;
export const CERTIFICATE_ASPECT_RATIO = CERTIFICATE_WIDTH_PX / CERTIFICATE_HEIGHT_PX;

export type CertificateView = {
  memberId: string;
  memberName: string;
  certificateNumber: string;
  university: string;
  program: string;
  issueDate: string;
  verifyUrl: string;
  logoSrc: string;
  qrSrc: string;
};

export function escapeHtml(value: string): string {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Deterministic, locale-independent issue date. */
export function formatCertificateDate(value: string | null | undefined): string {
  if (!value) return '\u2014';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '\u2014';
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  return months[date.getUTCMonth()] + ' ' + date.getUTCDate() + ', ' + date.getUTCFullYear();
}

/**
 * Certificate number in the documented ASAM-CERT-YYYY-NNNNNN format.
 * Mirrors public.certificate_number_for() in the database so the website, the
 * PDF and the database always agree.
 */
export function certificateNumberFor(memberId: string | null | undefined): string {
  if (!memberId) return '';
  const trimmed = String(memberId).trim();
  const match = /^ASAM-(\d{4})-(\d{6})$/.exec(trimmed);
  if (!match) return 'ASAM-CERT-' + trimmed;
  return 'ASAM-CERT-' + match[1] + '-' + match[2];
}

export function certificateNumberForApplication(application: {
  certificate_number?: string | null;
  member_id?: string | null;
}): string {
  const memberId = application.member_id ? String(application.member_id).trim() : '';
  const derived = certificateNumberFor(memberId);

  // The member id is the source of truth, and it is the same input
  // public.certificate_number_for() uses. Preferring it also repairs legacy rows
  // that stored the four-part "ASAM-CERT-YYYY-NNNNNN-NNNNNN" value.
  if (memberId && /^(ASAM)-\d{4}-\d{6}$/i.test(memberId)) return derived;

  const stored = application.certificate_number ? String(application.certificate_number).trim() : '';
  return stored || derived;
}

export const CERTIFICATE_CSS = [
  '.cert {',
  "  --cert-serif: var(--font-playfair, 'Playfair Display'), Georgia, 'Times New Roman', serif;",
  '  position: relative;',
  '  width: ' + CERTIFICATE_WIDTH_PX + 'px;',
  '  height: ' + CERTIFICATE_HEIGHT_PX + 'px;',
  '  overflow: hidden;',
  '  background: linear-gradient(135deg, #0a1628 0%, #101b2b 50%, #0a1628 100%);',
  "  font-family: 'Segoe UI', 'Helvetica Neue', Helvetica, Arial, sans-serif;",
  '  color: #101b2b;',
  '  -webkit-font-smoothing: antialiased;',
  '}',
  '.cert-pattern { position: absolute; inset: 0; opacity: 0.03; background-size: 60px 60px;',
  '  background-image: url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M30 0L60 30L30 60L0 30L30 0Z\' fill=\'none\' stroke=\'%23d6b66c\' stroke-width=\'0.5\'/%3E%3C/svg%3E"); }',
  '.cert-frame-outer { position: absolute; inset: 12px; border: 2px solid rgba(214, 182, 108, 0.32); }',
  '.cert-frame-inner { position: absolute; inset: 16px; border: 1px solid rgba(214, 182, 108, 0.22); }',
  '.cert-corner { position: absolute; width: 32px; height: 32px; color: rgba(214, 182, 108, 0.42); }',
  '.cert-corner-tl { top: 8px; left: 8px; }',
  '.cert-corner-tr { top: 8px; right: 8px; transform: rotate(90deg); }',
  '.cert-corner-br { bottom: 8px; right: 8px; transform: rotate(180deg); }',
  '.cert-corner-bl { bottom: 8px; left: 8px; transform: rotate(-90deg); }',
  '',
  '/* Paper: one grid, three rows. Only the middle row grows. */',
  '.cert-paper {',
  '  position: absolute;',
  '  inset: 24px;',
  '  background: #fffef9;',
  '  padding: 34px 56px 30px;',
  '  display: grid;',
  '  grid-template-rows: auto 1fr auto;',
  '  grid-template-columns: minmax(0, 1fr);',
  '}',
  '',
  '/* Row 1 - header */',
  '.cert-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 28px; }',
  '.cert-brand { display: flex; align-items: center; gap: 14px; min-width: 0; }',
  '.cert-logo { width: 46px; height: 46px; flex: none; border-radius: 50%;',
  '  border: 2px solid rgba(214, 182, 108, 0.45); object-fit: cover; background: #ffffff; }',
  '.cert-org { font-family: var(--cert-serif); font-size: 16.5px; font-weight: 700;',
  '  line-height: 1.3; color: #101b2b; max-width: 460px; }',
  '.cert-number { text-align: right; flex: none; }',
  '.cert-number-label { font-size: 9px; font-weight: 600; text-transform: uppercase;',
  '  letter-spacing: 0.12em; color: #6b7280; }',
  ".cert-number-value { margin-top: 4px; font-family: 'Courier New', Courier, monospace;",
  '  font-size: 13px; font-weight: 700; color: #101b2b; }',
  `
/* Row 2 - body, centred so page whitespace stays balanced */
.cert-main {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  text-align: center; padding: 10px 0;
}
.cert-ornament { display: flex; align-items: center; justify-content: center; gap: 12px; margin-bottom: 10px; }
.cert-ornament-line { width: 48px; height: 1px; background: rgba(214, 182, 108, 0.45); }
.cert-ornament-icon { width: 20px; height: 20px; color: #9a7c36; }
.cert-title {
  font-family: var(--cert-serif); font-size: 34px; font-weight: 700;
  letter-spacing: 0.07em; line-height: 1.2; color: #101b2b; margin: 0;
}
.cert-presented { margin-top: 22px; font-size: 12.5px; font-style: italic; color: #6b7280; }
.cert-name {
  margin-top: 12px; font-family: var(--cert-serif); font-size: 42px; font-weight: 700;
  line-height: 1.16; color: #101b2b; max-width: 900px;
}
.cert-hairline {
  margin: 16px auto 0; width: 190px; height: 1px;
  background: linear-gradient(90deg, rgba(214, 182, 108, 0), rgba(214, 182, 108, 0.6), rgba(214, 182, 108, 0));
}
.cert-statement { margin: 18px auto 0; max-width: 640px; font-size: 12px; line-height: 1.6; color: #4b5563; }

/* Information: typographic only - no boxes, borders or backgrounds */
.cert-info { margin-top: 26px; display: flex; flex-direction: column; gap: 18px; width: 100%; }
.cert-info-row { display: grid; grid-template-columns: minmax(0, 1fr) 1px minmax(0, 1fr); column-gap: 34px; align-items: center; }
.cert-info-cell { display: flex; flex-direction: column; align-items: center; min-width: 0; }
.cert-info-label { font-size: 9.5px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.12em; color: #6b7280; }
.cert-info-value { margin-top: 5px; font-size: 15px; font-weight: 500; color: #101b2b; }
.cert-info-value-mono { font-family: 'Courier New', Courier, monospace; font-size: 17px; font-weight: 700; }
.cert-info-separator { width: 1px; height: 26px; background: #ece7db; justify-self: center; }

/* Row 3 - verification row, inside the grid so it can never be orphaned */
.cert-footer { display: grid; grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr); align-items: end; padding-top: 16px; }
.cert-generated { font-size: 9.5px; color: #9ca3af; align-self: end; }
.cert-qr { grid-column: 2; justify-self: center; text-align: center; }
.cert-qr-label { font-size: 9.5px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: #6b7280; margin-bottom: 8px; }
.cert-qr-img { display: block; width: 86px; height: 86px; padding: 7px; background: #ffffff; border: 1px solid #e8e3d6; border-radius: 8px; box-sizing: content-box; }
.cert-qr-id { margin-top: 7px; font-family: 'Courier New', Courier, monospace; font-size: 9.5px; color: #6b7280; }
`,
].join('\n');

const CORNER_SVG =
  '<svg class="cert-corner" viewBox="0 0 32 32" aria-hidden="true">' +
  '<path d="M0 0 L32 0 L32 4 L4 4 L4 32 L0 32 Z" fill="currentColor"/>' +
  '<circle cx="8" cy="8" r="2" fill="currentColor"/></svg>';

const AWARD_SVG =
  '<svg class="cert-ornament-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
  'stroke-width="2" stroke-linecap="round" aria-hidden="true">' +
  '<circle cx="12" cy="8" r="6"/><path d="M15.5 13.5L17 22L12 19L7 22L8.5 13.5"/></svg>';

function infoCell(label: string, value: string, mono: boolean): string {
  return (
    '<div class="cert-info-cell">' +
    '<div class="cert-info-label">' + escapeHtml(label) + '</div>' +
    '<div class="cert-info-value' + (mono ? ' cert-info-value-mono' : '') + '">' + escapeHtml(value) + '</div>' +
    '</div>'
  );
}

function infoRow(left: string, right: string): string {
  return (
    '<div class="cert-info-row">' + left +
    '<div class="cert-info-separator" aria-hidden="true"></div>' + right +
    '</div>'
  );
}

/**
 * The certificate body. Shared verbatim by the website preview and the PDF.
 * Every dynamic value is HTML-escaped - the PDF renders the same string, so an
 * unescaped member name would be an injection point in both renderers.
 */
export function buildCertificateInnerHtml(view: CertificateView): string {
  return [
    '<div class="cert">',
    '<div class="cert-pattern" aria-hidden="true"></div>',
    '<div class="cert-frame-outer" aria-hidden="true"></div>',
    '<div class="cert-frame-inner" aria-hidden="true"></div>',
    CORNER_SVG.replace('class="cert-corner"', 'class="cert-corner cert-corner-tl"'),
    CORNER_SVG.replace('class="cert-corner"', 'class="cert-corner cert-corner-tr"'),
    CORNER_SVG.replace('class="cert-corner"', 'class="cert-corner cert-corner-br"'),
    CORNER_SVG.replace('class="cert-corner"', 'class="cert-corner cert-corner-bl"'),
    '<div class="cert-paper">',
    '  <div class="cert-header">',
    '    <div class="cert-brand">',
    view.logoSrc
      ? '      <img class="cert-logo" src="' + escapeHtml(view.logoSrc) + '" alt="ASAM logo" />'
      : '',
    '      <div class="cert-org">Afghan Students Association in Malaysia</div>',
    '    </div>',
    '    <div class="cert-number">',
    '      <div class="cert-number-label">Certificate No.</div>',
    '      <div class="cert-number-value">' + escapeHtml(view.certificateNumber) + '</div>',
    '    </div>',
    '  </div>',
    '  <div class="cert-main">',
    '    <div class="cert-ornament"><span class="cert-ornament-line"></span>' + AWARD_SVG +
      '<span class="cert-ornament-line"></span></div>',
    '    <h1 class="cert-title">CERTIFICATE OF MEMBERSHIP</h1>',
    '    <p class="cert-presented">This certificate is proudly presented to</p>',
    '    <div class="cert-name">' + escapeHtml(view.memberName) + '</div>',
    '    <div class="cert-hairline" aria-hidden="true"></div>',
    '    <p class="cert-statement">Issued in recognition of officially registered membership in the ' +
      'Afghan Students Association in Malaysia (ASAM), acknowledging their commitment to the ' +
      'community and its values.</p>',
    '    <div class="cert-info">',
    infoRow(infoCell('Member ID', view.memberId, true), infoCell('University', view.university, false)),
    infoRow(infoCell('Programme', view.program, false), infoCell('Date of Issue', view.issueDate, false)),
    '    </div>',
    '  </div>',
    '  <div class="cert-footer">',
    '    <div class="cert-generated">System Generated</div>',
    '    <div class="cert-qr">',
    '      <div class="cert-qr-label">Scan to verify certificate</div>',
    '      <img class="cert-qr-img" src="' + escapeHtml(view.qrSrc) + '" alt="Certificate verification QR code" />',
    '      <div class="cert-qr-id">' + escapeHtml(view.memberId) + '</div>',
    '    </div>',
    '  </div>',
    '</div>',
    '</div>',
  ].join('\n');
}

/** Standalone document used for PDF rendering (self-contained, no network). */
export function buildCertificateDocument(view: CertificateView): string {
  return [
    '<!DOCTYPE html>',
    '<html lang="en"><head><meta charset="UTF-8">',
    '<title>ASAM Certificate of Membership - ' + escapeHtml(view.memberId) + '</title>',
    '<style>',
    '* { margin: 0; padding: 0; box-sizing: border-box; }',
    'html, body { width: ' + CERTIFICATE_WIDTH_PX + 'px; height: ' + CERTIFICATE_HEIGHT_PX + 'px; }',
    'body { background: #ffffff; }',
    'img { max-width: none; }',
    CERTIFICATE_CSS,
    '</style></head><body>',
    buildCertificateInnerHtml(view),
    '</body></html>',
  ].join('\n');
}


