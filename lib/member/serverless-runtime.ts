/**
 * Runtime host detection for the certificate PDF renderer.
 *
 * No imports on purpose: this module is loaded by both the Node server runtime
 * and the dependency-free test suite (node:test), so it must stay free of the
 * "@/" path alias, which plain Node cannot resolve.
 */

/**
 * True on AWS Lambda, Netlify Functions and Vercel, where no system browser
 * exists and the bundled @sparticuz/chromium is the only renderer available.
 *
 * VERCEL was previously missing from this check. The application is deployed to
 * Vercel, so this function returned false, @sparticuz/chromium was never loaded,
 * resolveChrome() fell through to the bare name "chrome", puppeteer threw ENOENT,
 * and the certificate endpoint answered with a JSON error body instead of a PDF.
 * VERCEL is set to "1" on every Vercel build and runtime; VERCEL_ENV
 * ("production" / "preview") is set there too and is accepted as an equivalent.
 */
export function isServerlessRuntime(env: NodeJS.ProcessEnv = process.env): boolean {
  return Boolean(
    env.AWS_LAMBDA_FUNCTION_NAME ||
      env.AWS_EXECUTION_ENV ||
      env.NETLIFY ||
      env.VERCEL === '1' ||
      env.VERCEL_ENV
  );
}