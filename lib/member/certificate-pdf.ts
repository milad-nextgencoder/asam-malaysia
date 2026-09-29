import puppeteer from 'puppeteer-core';
import { existsSync } from 'fs';
import { buildCertificateDocument, CERTIFICATE_WIDTH_PX, CERTIFICATE_HEIGHT_PX } from '@/lib/member/certificate-html';
import { getCertificateView, getCertificateLogoDataUrl } from '@/lib/member/certificate';

const PDF_WIDTH_MM = 297;
const PDF_HEIGHT_MM = 210;

/** Error carrying an HTTP status so the API route can answer precisely. */
export class CertificatePdfError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'CertificatePdfError';
    this.status = status;
  }
}

function resolveFromPath(binaryName: string): string | null {
  const isWindows = process.platform === 'win32';
  const extensions = isWindows ? ['.exe', '.cmd', ''] : [''];
  const directories = (process.env.PATH || '').split(isWindows ? ';' : ':').filter(Boolean);

  for (const directory of directories) {
    for (const extension of extensions) {
      const candidate = directory.replace(/[\\/]+$/, '') + '/' + binaryName + extension;
      if (existsSync(candidate)) return candidate;
    }
  }

  return null;
}

/**
 * Resolves a Chrome/Chromium binary for puppeteer-core.
 *
 * Order: explicit environment variables, then platform defaults (Windows, macOS,
 * common Linux locations), then a PATH lookup. Previously only two Windows paths
 * were checked and the fallback was the bare string "chrome", which made PDF
 * generation fail on any Linux host such as a container build image.
 */
export function getChromePath(): string {
  const fromEnvironment = [process.env.CHROME_PATH, process.env.PUPPETEER_EXECUTABLE_PATH]
    .map((value) => (value || '').trim())
    .filter(Boolean);

  const platformDefaults = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/snap/bin/chromium',
  ];

  for (const candidate of fromEnvironment.concat(platformDefaults)) {
    if (existsSync(candidate)) return candidate;
  }

  for (const name of ['google-chrome', 'google-chrome-stable', 'chromium', 'chromium-browser', 'chrome', 'msedge']) {
    const resolved = resolveFromPath(name);
    if (resolved) return resolved;
  }

  return 'chrome';
}

/**
 * Renders the certificate to PDF bytes.
 *
 * Uses the exact same HTML/CSS artifact as the public website preview
 * (lib/member/certificate-html.ts) so both renderers are identical, and reads the
 * certificate once instead of once per renderer.
 */
export async function generateCertificatePDF(memberId: string): Promise<Uint8Array> {
  const result = await getCertificateView(memberId, { logoSrc: getCertificateLogoDataUrl() });
  if (!result) throw new CertificatePdfError('Certificate not found', 404);
  if (!result.record.isApproved) throw new CertificatePdfError('Membership not active', 400);

  const html = buildCertificateDocument(result.view);
  let browser: Awaited<ReturnType<typeof puppeteer.launch>> | undefined;

  try {
    browser = await puppeteer.launch({
      headless: true,
      executablePath: getChromePath(),
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--font-render-hinting=none'],
    });

    const page = await browser.newPage();
    await page.setViewport({
      width: CERTIFICATE_WIDTH_PX,
      height: CERTIFICATE_HEIGHT_PX,
      deviceScaleFactor: 2,
    });
    await page.setContent(html, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready.then(() => true));

    const pdf = await page.pdf({
      width: PDF_WIDTH_MM + 'mm',
      height: PDF_HEIGHT_MM + 'mm',
      printBackground: true,
      pageRanges: '1',
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    });

    return new Uint8Array(pdf);
  } catch (error) {
    if (error instanceof CertificatePdfError) throw error;
    console.error('Certificate PDF rendering failed:', error);
    throw new CertificatePdfError('PDF rendering is unavailable on this server.', 503);
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch {
        // Browser process already gone.
      }
    }
  }
}
