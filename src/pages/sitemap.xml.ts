import projectsData from '../../content/projects.json';
import { sitePath } from '../utils/urls';

export const prerender = true;

const staticRoutes = [
  { fr: '/', en: '/en/' },
  { fr: '/contact/', en: '/en/contact/' },
  { fr: '/faq/', en: '/en/faq/' },
  { fr: '/privacy/', en: '/en/privacy/' },
  ...projectsData
    .filter((project) => project.id === 'jef' || project.id === 'terangadigital')
    .map((project) => ({
      fr: `/projects/${project.slug}/`,
      en: `/en/projects/${project.slug}/`
    }))
];

const escapeXml = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function GET({ site }: { site: URL | undefined }): Response {
  if (!site) {
    throw new Error('Astro.site must be configured to generate the sitemap.');
  }

  const entries = staticRoutes
    .map(({ fr, en }) => {
      const frenchUrl = new URL(sitePath(fr), site).href;
      const englishUrl = new URL(sitePath(en), site).href;

      return [frenchUrl, englishUrl]
        .map((location) => `
  <url>
    <loc>${escapeXml(location)}</loc>
    <xhtml:link rel="alternate" hreflang="fr" href="${escapeXml(frenchUrl)}" />
    <xhtml:link rel="alternate" hreflang="en" href="${escapeXml(englishUrl)}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(frenchUrl)}" />
  </url>`)
        .join('');
    })
    .join('');

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${entries}\n</urlset>`,
    { headers: { 'Content-Type': 'application/xml; charset=utf-8' } }
  );
}
