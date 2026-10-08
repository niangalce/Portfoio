import { sitePath } from '../utils/urls';

export const prerender = true;

export function GET({ site }: { site: URL | undefined }): Response {
  if (!site) {
    throw new Error('Astro.site must be configured to generate robots.txt.');
  }

  const sitemapUrl = new URL(sitePath('/sitemap.xml'), site).href;
  return new Response(
    `User-agent: *\nAllow: ${sitePath('/')}\n\nSitemap: ${sitemapUrl}\n`,
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } }
  );
}
