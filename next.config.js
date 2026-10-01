/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Lint is enforced separately via `npm run lint` in the Netlify build
    // command. Keeping it out of `next build` only meant a broken build could
    // still report success.
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  // The certificate PDF route launches Chromium through puppeteer-core, and
  // @sparticuz/chromium carries its browser as Brotli-compressed blobs that the
  // default file trace does not pick up. netlify.toml declares them for Netlify,
  // but the application is deployed to Vercel, so without this the serverless
  // function ships without a browser and every PDF request fails with a 503 JSON
  // body. The certificate logo is read from disk at render time for the same
  // reason: it lives in public/, which is not in the function bundle.
  experimental: {
    serverActions: true,
    // Both must stay external. @sparticuz/chromium resolves its bin/ directory
    // from import.meta.url; if webpack bundles it, that becomes a build-time
    // absolute path that does not exist inside a serverless function, and the
    // bundled module also hides the bin/*.br payload from the file trace.
    serverComponentsExternalPackages: ['puppeteer-core', '@sparticuz/chromium'],
    outputFileTracingIncludes: {
      '/api/certificate/[member-id]/pdf': [
        './node_modules/@sparticuz/chromium/bin/**',
        './node_modules/@sparticuz/chromium/build/**',
        './public/images/asam-logo-cert.png',
      ],
    },
  },
};

module.exports = nextConfig;
