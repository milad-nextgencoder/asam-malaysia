/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true,
    // Both must stay external. @sparticuz/chromium resolves its bin/ directory
    // from import.meta.url; if webpack bundles it, that becomes a build-time
    // absolute path that does not exist inside a Netlify function, and the
    // bundled module also hides the bin/*.br payload from the file trace.
    // The package throws "The input directory does not exist" in that case.
    serverComponentsExternalPackages: ['puppeteer-core', '@sparticuz/chromium'],
  },
  eslint: {
    // Lint is enforced separately via `npm run lint` in the Netlify build
    // command. Keeping it out of `next build` only meant a broken build could
    // still report success.
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
};

module.exports = nextConfig;
