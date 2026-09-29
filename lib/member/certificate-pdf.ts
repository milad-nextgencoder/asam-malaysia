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

export type ChromeLaunch = {
  executablePath: string;
  args: string[];
  /** True when the browser came from @sparticuz/chromium (serverless build). */
  serverless: boolean;
};

const BASE_ARGS = ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--font-render-hinting=none'];

/** True on AWS Lambda / Netlify Functions, where no system browser exists. */
function isServerless(): boolean {
  return Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.AWS_EXECUTION_ENV || process.env.NETLIFY);
}

/**
 * Resolves a Chrome/Chromium binary and its launch flags for puppeteer-core.
 *
 * puppeteer-core deliberately ships no browser, so an executable must be found at
 * runtime. Three sources, in order:
 *
 *  1. CHROME_PATH / PUPPETEER_EXECUTABLE_PATH - an explicit override.
 *  2. A locally installed browser (Windows, macOS, Linux paths, then PATH).
 *  3. @sparticuz/chromium, which ships a Brotli-compressed headless Chromium and
 *     extracts it to /tmp on first use. This is the only source that exists inside
 *     a Netlify Function, whose container has no Chrome and no shared writable
 *     filesystem. On AWS Lambda its required flags (--single-process,
 *     --disable-dev-shm-usage, ...) must be passed through verbatim.
 *
 * Returns a fully resolved launch descriptor rather than a bare path so the
 * serverless argument set cannot be silently dropped.
 */
export async function resolveChrome(): Promise<ChromeLaunch> {
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
    if (existsSync(candidate)) return { executablePath: candidate, args: BASE_ARGS, serverless: false };
  }

  for (const name of ['google-chrome', 'google-chrome-stable', 'chromium', 'chromium-browser', 'chrome', 'msedge']) {
    const resolved = resolveFromPath(name);
    if (resolved) return { executablePath: resolved, args: BASE_ARGS, serverless: false };
  }

  if (isServerless()) {
    // Imported lazily so the ~64 MB package is only loaded on serverless hosts.
    const { default: chromium } = await import('@sparticuz/chromium');
    const executablePath = await chromium.executablePath();
    return { executablePath, args: [...BASE_ARGS, ...chromium.args], serverless: true };
  }

  // Last resort: let puppeteer resolve the bare name so the thrown error names
  // the missing browser rather than surfacing as an opaque ENOENT.
  return { executablePath: 'chrome', args: BASE_ARGS, serverless: false };
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
  const chrome = await resolveChrome();
  let browser: Awaited<ReturnType<typeof puppeteer.launch>> | undefined;

  try {
    browser = await puppeteer.launch({
      headless: true,
      executablePath: chrome.executablePath,
      args: chrome.args,
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
