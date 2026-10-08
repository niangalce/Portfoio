import { defineConfig } from 'astro/config';

// Détermination dynamique de l'URL du site et du chemin de base pour GitHub Pages ou Vercel/Netlify
const siteUrl = process.env.SITE_URL || 'https://niangalce.github.io';
const basePath = process.env.BASE_PATH || '/Portfoio/';

export default defineConfig({
  site: siteUrl,
  base: basePath,
  output: 'static',
  build: {
    format: 'directory' // Génère /about/index.html pour des URLs propres sans extension .html
  },
  i18n: {
    defaultLocale: 'fr',
    locales: ['fr', 'en'],
    routing: {
      prefixDefaultLocale: false, // La racine / est en français, /en/ en anglais
      redirectToDefaultLocale: false
    }
  },
  compressHTML: true
});
