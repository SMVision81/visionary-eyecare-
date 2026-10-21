// Extra hosts allowed to call Server Actions (Next.js compares Origin to the
// forwarded host and rejects mismatches as CSRF). Needed only when browsing
// through a tunnel/preview proxy — e.g. ALLOWED_ACTION_ORIGINS=127.0.0.1:52208.
const allowedActionOrigins = (process.env.ALLOWED_ACTION_ORIGINS ?? '')
  .split(',')
  .map((s) => s.trim().replace(/^https?:\/\//, '').replace(/\/.*$/, ''))
  .filter(Boolean);

// Preview deploys (e.g. the Netlify review link) set SITE_NOINDEX=true so search engines never index them.
const noindex = process.env.SITE_NOINDEX === 'true';

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
  ...(noindex ? [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] : []),
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  allowedDevOrigins: ['127.0.0.1'],
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
  experimental: {
    // Default 1 MB body limit (the Google import sends reviews in batches well under it).
    serverActions: { allowedOrigins: allowedActionOrigins },
  },
};
export default nextConfig;
