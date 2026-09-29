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
import { getCertificateVerifyUrl } from '../lib/member/site-url.ts';

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


test('the page is A4 landscape at 96 dpi', () => {
  assert.equal(CERTIFICATE_WIDTH_PX, 1123);
  assert.equal(CERTIFICATE_HEIGHT_PX, 794);
  assert.ok(Math.abs(CERTIFICATE_ASPECT_RATIO - 297 / 210) < 0.005);
});
