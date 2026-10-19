import type { MetadataRoute } from 'next';
import { getServerSiteUrl } from '@/lib/member/site-url';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/api', '/auth'] },
    sitemap: `${getServerSiteUrl()}/sitemap.xml`,
  };
}
