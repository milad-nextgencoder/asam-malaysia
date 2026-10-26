/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: false },
  images: {
    remotePatterns: process.env.NEXT_PUBLIC_SUPABASE_URL ? [{
      protocol: 'https', hostname: new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname,
      pathname: '/storage/v1/object/public/**',
    }] : [],
  },
  experimental: { serverActions: { bodySizeLimit: '6mb' } },
  serverExternalPackages: ['puppeteer-core', '@sparticuz/chromium'],
  outputFileTracingIncludes: {
    '/api/certificate/*/pdf': [
      './node_modules/@sparticuz/chromium/bin/**',
      './node_modules/@sparticuz/chromium/build/**',
      './public/images/asam-logo-cert.png',
    ],
  },
};
module.exports = nextConfig;
