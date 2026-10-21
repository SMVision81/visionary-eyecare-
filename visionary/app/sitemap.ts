import type { MetadataRoute } from 'next';
import { siteUrl } from '@/lib/site';

// The four public pages only; /admin is excluded (and disallowed in robots.ts).
export default function sitemap(): MetadataRoute.Sitemap {
  // Build time is the last change: the pages are static and only change with a redeploy.
  const lastModified = new Date();
  return ['', '/services', '/contact', '/about'].map((path) => ({ url: `${siteUrl}${path}`, lastModified }));
}
