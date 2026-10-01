/**
 * Certificate regression tests.
 *
 * Dependency-free (node:test only), so they run anywhere without a database, a
 * browser or a network connection. They cover the shared certificate artifact
 * that both the website preview and the PDF renderer use.
 *
 * Run with: npm test
 */
import test from 'node:test';
import assert from 'node:assert/strict';

import {
  CERTIFICATE_ASPECT_RATIO,
  CERTIFICATE_HEIGHT_PX,
  CERTIFICATE_WIDTH_PX,
  buildCertificateDocument,
  buildCertificateInnerHtml,
  certificateNumberFor,
  certificateNumberForApplication,
  escapeHtml,
  formatCertificateDate,
} from '../lib/member/certificate-html.ts';
import { getCertificateVerifyUrl, getConfiguredSiteUrl, getServerSiteUrl, getAuthOrigin, getAuthCallbackUrl } from '../lib/member/site-url.ts';
import { isServerlessRuntime } from '../lib/member/serverless-runtime.ts';

const VIEW = {
  memberId: 'ASAM-2026-000123',
  memberName: 'Mariam Ahmadi',
  certificateNumber: 'ASAM-CERT-2026-000123',
  university: 'Universiti Teknologi Malaysia',
  program: 'BSc Computer Science',
  issueDate: 'March 5, 2026',
  verifyUrl: 'https://asam.org.my/certificate/ASAM-2026-000123',
  logoSrc: 'data:image/png;base64,iVBORw0KGgo=',
  qrSrc: 'data:image/png;base64,iVBORw0KGgo=',
};

test('escapeHtml neutralises every character that could break out of markup', () => {
  assert.equal(
    escapeHtml('<script>alert("x")</script>'),
    '&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;'
  );
  assert.equal(escapeHtml("Mariam & Ahmad's"), 'Mariam &amp; Ahmad&#39;s');
});

test('formatCertificateDate is deterministic and locale independent', () => {
  assert.equal(formatCertificateDate('2026-03-05'), 'March 5, 2026');
  assert.equal(formatCertificateDate('2026-03-05T23:30:00.000Z'), 'March 5, 2026');
  assert.equal(formatCertificateDate(new Date(Date.UTC(2026, 11, 31))), 'December 31, 2026');
  assert.equal(formatCertificateDate(null), '—');
  assert.equal(formatCertificateDate('not a date'), '—');
});

test('certificateNumberFor produces the documented ASAM-CERT-YYYY-NNNNNN format', () => {
  assert.equal(certificateNumberFor('ASAM-2026-000001'), 'ASAM-CERT-2026-000001');
  assert.equal(certificateNumberFor('  ASAM-2026-000001  '), 'ASAM-CERT-2026-000001');
  assert.equal(certificateNumberFor(''), '');
  assert.equal(certificateNumberFor(null), '');
  // An unexpected id stays readable rather than being dropped.
  assert.equal(certificateNumberFor('LEGACY-42'), 'ASAM-CERT-LEGACY-42');
});

test('the member id overrides a stored four-part certificate number', () => {
  assert.equal(
    certificateNumberForApplication({
      member_id: 'ASAM-2026-000001',
      certificate_number: 'ASAM-CERT-2026-000001-000001',
    }),
    'ASAM-CERT-2026-000001'
  );
  assert.equal(
    certificateNumberForApplication({ member_id: 'ASAM-2026-000001' }),
    'ASAM-CERT-2026-000001'
  );
  assert.equal(
    certificateNumberForApplication({
      member_id: 'LEGACY-42',
      certificate_number: 'ASAM-CERT-LEGACY-42',
    }),
    'ASAM-CERT-LEGACY-42'
  );
  assert.equal(certificateNumberForApplication({}), '');
});

test('the verification URL always points at the public certificate page', () => {
  // The QR payload is exactly this value: createQrDataUrl(getCertificateVerifyUrl(id)).
  assert.equal(
    getCertificateVerifyUrl('ASAM-2026-000001', 'https://example.test/'),
    'https://example.test/certificate/ASAM-2026-000001'
  );
  assert.equal(
    getCertificateVerifyUrl('ASAM-2026-000001', 'https://asam.org.my/'),
    'https://asam.org.my/certificate/ASAM-2026-000001'
  );
  assert.match(getCertificateVerifyUrl('a b/c'), /\/certificate\/a%20b%2Fc$/);
  assert.ok(getCertificateVerifyUrl('ASAM-2026-000001').startsWith('https://'));
});

test('the certificate prints every required field', () => {
  const html = buildCertificateInnerHtml(VIEW);
  for (const value of [
    VIEW.memberName,
    VIEW.certificateNumber,
    VIEW.university,
    VIEW.program,
    VIEW.issueDate,
    VIEW.memberId,
  ]) {
    assert.ok(html.includes(value), 'missing value: ' + value);
  }
  assert.ok(html.includes('CERTIFICATE OF MEMBERSHIP'));
  assert.ok(html.includes('Certificate No.'));
  assert.ok(html.includes('Scan to verify certificate'));
  assert.ok(html.includes('System Generated'));
});

test('no signature lines and no fill-in field boxes', () => {
  const html = buildCertificateInnerHtml(VIEW);
  assert.ok(!/signature/i.test(html), 'signature wording found');
  assert.ok(!/<input|<textarea|contenteditable/i.test(html), 'editable field found');
  assert.ok(!/cert-signature/.test(html));
});

test('the QR block carries the member id', () => {
  const html = buildCertificateInnerHtml(VIEW);
  assert.ok(html.includes('src="' + VIEW.qrSrc + '"'));
  assert.ok(html.includes('<div class="cert-qr-id">ASAM-2026-000123</div>'));
});

test('the PDF document is self-contained and shares the website markup', () => {
  const document = buildCertificateDocument(VIEW);
  assert.ok(document.startsWith('<!DOCTYPE html>'));
  assert.ok(document.includes('width: 1123px'));
  assert.ok(document.includes('height: 794px'));
  // Puppeteer renders from a blank page with no origin, so no remote resource may
  // be referenced or the PDF would silently drop it.
  assert.ok(!/<(link|script)\b/i.test(document), 'document pulls in an external resource');
  assert.ok(!/src="(https?:)?\/\//i.test(document), 'document references a remote image');
  // The website preview and the PDF must render the same body.
  assert.ok(document.includes(buildCertificateInnerHtml(VIEW)));
});

test('an unavailable logo omits the image instead of inventing an emblem', () => {
  const html = buildCertificateInnerHtml({ ...VIEW, logoSrc: '' });
  assert.ok(!html.includes('<img class="cert-logo"'));
  assert.ok(html.includes('Afghan Students Association in Malaysia'));
});

test('member supplied text cannot inject markup into either renderer', () => {
  const html = buildCertificateInnerHtml({
    ...VIEW,
    memberName: '<img src=x onerror=alert(1)>',
    university: '"><script>bad()</script>',
  });
  // The payloads are present but inert: no unescaped tag reaches the markup.
  assert.ok(!html.includes('<script>'));
  assert.ok(!html.includes('<img src=x'));
  assert.ok(html.includes('&lt;img src=x onerror=alert(1)&gt;'));
  assert.ok(html.includes('&quot;&gt;&lt;script&gt;bad()&lt;/script&gt;'));
});


test('a malformed NEXT_PUBLIC_SITE_URL cannot break the app', () => {
  // app/layout.tsx builds new URL(getServerSiteUrl()) at module load, so a bad
  // value must be rejected here rather than thrown during render.
  const original = process.env.NEXT_PUBLIC_SITE_URL;

  for (const bad of [
    'not a url',
    'javascript:alert(1)',
    'ftp://asam.org.my',
    '   ',
    '',
  ]) {
    process.env.NEXT_PUBLIC_SITE_URL = bad;
    assert.equal(getConfiguredSiteUrl(), '', 'should reject: ' + JSON.stringify(bad));
    assert.equal(
      getServerSiteUrl(),
      'https://asam.org.my',
      'should fall back to production for: ' + JSON.stringify(bad)
    );
  }

  // A missing slash is repaired by the URL parser rather than rejected, and the
  // repaired origin is what ends up in the QR code.
  process.env.NEXT_PUBLIC_SITE_URL = 'https:/asam.org.my';
  assert.equal(getConfiguredSiteUrl(), 'https://asam.org.my');
  assert.equal(
    getCertificateVerifyUrl('ASAM-2026-000001'),
    'https://asam.org.my/certificate/ASAM-2026-000001'
  );

  process.env.NEXT_PUBLIC_SITE_URL = 'https://staging.asam.org.my/';
  assert.equal(getConfiguredSiteUrl(), 'https://staging.asam.org.my');
  assert.equal(getCertificateVerifyUrl('ASAM-2026-000001'), 'https://staging.asam.org.my/certificate/ASAM-2026-000001');

  if (original === undefined) delete process.env.NEXT_PUBLIC_SITE_URL;
  else process.env.NEXT_PUBLIC_SITE_URL = original;
});

test('the page is A4 landscape at 96 dpi', () => {
  assert.equal(CERTIFICATE_WIDTH_PX, 1123);
  assert.equal(CERTIFICATE_HEIGHT_PX, 794);
  assert.ok(Math.abs(CERTIFICATE_ASPECT_RATIO - 297 / 210) < 0.005);
});


/* ------------------------------------------------------------------ *
 * Issue 3 - member authentication callback
 * ------------------------------------------------------------------ */

test('the auth callback origin is never localhost in production', () => {
  const originalUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const originalVercel = process.env.VERCEL_URL;
  const originalEnv = process.env.NODE_ENV;

  delete process.env.NEXT_PUBLIC_SITE_URL;
  delete process.env.VERCEL_URL;

  // Production with no configuration must fall back to the production origin.
  // Previously the auth actions used `NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'`,
  // so Supabase received a localhost redirect that is not in the allow-list and
  // silently fell back to the public homepage.
  process.env.NODE_ENV = 'production';
  assert.equal(getAuthOrigin(), 'https://asam.org.my');
  assert.equal(
    getAuthCallbackUrl('/auth/member-callback'),
    'https://asam.org.my/auth/member-callback'
  );
  assert.doesNotMatch(
    getAuthCallbackUrl('/auth/member-callback'),
    /localhost/,
    'production must never build a localhost auth redirect'
  );

  // A request origin (Vercel preview, custom domain) is honoured in production.
  assert.equal(
    getAuthOrigin('https://asam-git-main.vercel.app'),
    'https://asam-git-main.vercel.app'
  );

  // The reset-password destination is preserved through the helper.
  assert.equal(
    getAuthCallbackUrl('/auth/member-callback?next=/member/reset-password'),
    'https://asam.org.my/auth/member-callback?next=/member/reset-password'
  );

  // VERCEL_URL is used when no request origin is passed through.
  process.env.VERCEL_URL = 'asam-git-main.vercel.app';
  assert.equal(getAuthOrigin(), 'https://asam-git-main.vercel.app');

  // Localhost is only reachable in development.
  process.env.NODE_ENV = 'development';
  delete process.env.VERCEL_URL;
  assert.equal(getAuthOrigin(), 'http://localhost:3000');

  // Explicit configuration always wins.
  process.env.NODE_ENV = 'production';
  process.env.NEXT_PUBLIC_SITE_URL = 'https://staging.asam.org.my';
  assert.equal(getAuthOrigin(), 'https://staging.asam.org.my');
  assert.equal(
    getAuthCallbackUrl('/auth/member-callback'),
    'https://staging.asam.org.my/auth/member-callback'
  );

  if (originalUrl === undefined) delete process.env.NEXT_PUBLIC_SITE_URL;
  else process.env.NEXT_PUBLIC_SITE_URL = originalUrl;
  if (originalVercel === undefined) delete process.env.VERCEL_URL;
  else process.env.VERCEL_URL = originalVercel;
  process.env.NODE_ENV = originalEnv;
});

test('a malformed request origin cannot poison the auth redirect', () => {
  const originalUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const originalVercel = process.env.VERCEL_URL;
  const originalEnv = process.env.NODE_ENV;

  delete process.env.NEXT_PUBLIC_SITE_URL;
  delete process.env.VERCEL_URL;
  process.env.NODE_ENV = 'production';

  for (const bad of ['not a url', 'javascript:alert(1)', 'ftp://x.test', '']) {
    assert.equal(getAuthOrigin(bad), 'https://asam.org.my', 'rejected: ' + bad);
  }

  if (originalUrl === undefined) delete process.env.NEXT_PUBLIC_SITE_URL;
  else process.env.NEXT_PUBLIC_SITE_URL = originalUrl;
  if (originalVercel === undefined) delete process.env.VERCEL_URL;
  else process.env.VERCEL_URL = originalVercel;
  process.env.NODE_ENV = originalEnv;
});

/* ------------------------------------------------------------------ *
 * Issue 4 - certificate PDF response contract
 * ------------------------------------------------------------------ */

test('Vercel is detected as a serverless runtime', () => {
  // The regression: VERCEL was not in the isServerless() check, so on Vercel the
  // @sparticuz/chromium browser was never loaded and the endpoint answered with a
  // JSON error body instead of a PDF.
  assert.equal(isServerlessRuntime({ VERCEL: '1' }), true, 'VERCEL=1');
  assert.equal(isServerlessRuntime({ VERCEL_ENV: 'production' }), true, 'VERCEL_ENV');
  assert.equal(isServerlessRuntime({ VERCEL_ENV: 'preview' }), true, 'preview');
  assert.equal(isServerlessRuntime({ NETLIFY: 'true' }), true, 'Netlify');
  assert.equal(isServerlessRuntime({ AWS_LAMBDA_FUNCTION_NAME: 'fn' }), true, 'Lambda');
  assert.equal(isServerlessRuntime({ AWS_EXECUTION_ENV: 'AWS' }), true, 'Lambda env');
  // A plain local machine is not serverless, so a system Chrome is preferred.
  assert.equal(isServerlessRuntime({}), false, 'local dev');
  assert.equal(isServerlessRuntime({ VERCEL: '0' }), false, 'VERCEL explicitly 0');
});
