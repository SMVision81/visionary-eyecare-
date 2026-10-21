import type { MetadataRoute } from 'next';
import { siteUrl } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  // Preview deploys: block everything (see SITE_NOINDEX in next.config.mjs).
  if (process.env.SITE_NOINDEX === 'true') return { rules: [{ userAgent: '*', disallow: '/' }] };
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/admin'] }],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
