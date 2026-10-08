import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

describe('Architecture Technique & Configuration Tests', () => {
  test('Les fichiers de configuration fondamentaux existent', () => {
    const required = [
      'package.json',
      'astro.config.mjs',
      'tsconfig.json',
      '.gitignore',
      'styles/tokens.css'
    ];

    for (const rel of required) {
      const exists = fs.existsSync(path.join(rootDir, rel));
      assert.ok(exists, `Le fichier ${rel} doit exister à la racine.`);
    }
  });

  test('package.json contient les scripts obligatoires', () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8'));
    assert.ok(pkg.scripts.dev, 'Script dev manquant');
    assert.ok(pkg.scripts.prebuild, 'La configuration de publication doit être validée avant le build');
    assert.ok(pkg.scripts.build, 'Script build manquant');
    assert.ok(pkg.scripts.test, 'Script test manquant');
    assert.ok(pkg.scripts.lint, 'Script lint manquant');
    assert.equal(pkg.type, 'module', 'package.json doit être de type "module"');
  });

  test('Le build refuse une origine ou un chemin de base de publication non configuré', () => {
    const script = path.join(rootDir, 'scripts', 'verify-deployment-config.js');
    const missingOrigin = spawnSync(process.execPath, [script], {
      cwd: rootDir,
      encoding: 'utf8',
      env: { ...process.env, SITE_URL: '', BASE_PATH: '/' }
    });
    assert.notEqual(missingOrigin.status, 0, 'Une origine absente doit bloquer le build');
    assert.match(missingOrigin.stderr, /verified production origin/);

    const invalidBase = spawnSync(process.execPath, [script], {
      cwd: rootDir,
      encoding: 'utf8',
      env: { ...process.env, SITE_URL: 'https://portfolio.example.invalid', BASE_PATH: '/../' }
    });
    assert.notEqual(invalidBase.status, 0, 'Un chemin de base invalide doit bloquer le build');
    assert.match(invalidBase.stderr, /BASE_PATH/);

    const validConfig = spawnSync(process.execPath, [script], {
      cwd: rootDir,
      encoding: 'utf8',
      env: {
        ...process.env,
        SITE_URL: 'https://portfolio.example.invalid',
        BASE_PATH: '/Portfoio/'
      }
    });
    assert.equal(validConfig.status, 0, validConfig.stderr);
  });

  test('astro.config.mjs est configuré pour static export et bilinguisme', () => {
    const configContent = fs.readFileSync(path.join(rootDir, 'astro.config.mjs'), 'utf8');
    assert.match(configContent, /output:\s*['"]static['"]/, 'Astro doit avoir output: "static"');
    assert.match(configContent, /defaultLocale:\s*['"]fr['"]/, 'La locale par défaut doit être "fr"');
    assert.match(configContent, /locales:\s*\[['"]fr['"],\s*['"]en['"]\]/, 'Les locales doivent être ["fr", "en"]');
  });

  test('Les routes Contact, FAQ, Confidentialité et SEO sont générées pour les deux langues', () => {
    const requiredRoutes = [
      'src/pages/contact.astro',
      'src/pages/en/contact.astro',
      'src/pages/faq.astro',
      'src/pages/en/faq.astro',
      'src/pages/privacy.astro',
      'src/pages/en/privacy.astro',
      'src/pages/404.astro',
      'src/pages/robots.txt.ts',
      'src/pages/sitemap.xml.ts'
    ];

    for (const route of requiredRoutes) {
      assert.ok(fs.existsSync(path.join(rootDir, route)), `Route ou ressource manquante : ${route}`);
    }

    const layout = fs.readFileSync(path.join(rootDir, 'src', 'layouts', 'BaseLayout.astro'), 'utf8');
    for (const metadata of [
      'canonical',
      'hreflang',
      'og:image',
      'twitter:card',
      'application/ld+json',
      'Content-Security-Policy',
      "connect-src 'self' https://api.github.com",
      'name="referrer" content="no-referrer"'
    ]) {
      assert.ok(layout.includes(metadata), `Métadonnée SEO manquante : ${metadata}`);
    }
    assert.doesNotMatch(
      layout,
      /form-action/,
      'La CSP livrée comme meta ne doit pas prétendre imposer une directive form-action non prise en charge'
    );

    const urls = fs.readFileSync(path.join(rootDir, 'src', 'utils', 'urls.ts'), 'utf8');
    assert.match(urls, /BASE_URL/, 'Les URLs locales doivent respecter le base path Astro');
  });

  test('Les CTA de contact ouvrent directement la messagerie sans formulaire ni endpoint', () => {
    const panel = fs.readFileSync(path.join(rootDir, 'src', 'components', 'ContactPanel.astro'), 'utf8');
    const contact = fs.readFileSync(path.join(rootDir, 'src', 'utils', 'contact.ts'), 'utf8');
    const contactSurfaces = [
      'src/components/Header.astro',
      'src/components/Footer.astro',
      'src/components/FinalCTA.astro',
      'src/pages/404.astro',
      'src/pages/privacy.astro',
      'src/pages/en/privacy.astro'
    ];

    assert.match(contact, /profileData\.identity\.contact\.email/);
    assert.match(contact, /mailto:\$\{contactEmail\}\?subject=/);
    assert.match(panel, /href=\{contactMailto\(lang\)\}/);
    assert.match(panel, /Ouvrir ma messagerie/);
    assert.match(panel, /Open my email app/);
    assert.match(panel, /data-copy-email/);
    assert.match(panel, /role="status" aria-live="polite"/);
    assert.doesNotMatch(panel, /<form\b|data-contact-form|data-draft-link|honeypot|FormData|fetch\(/i);

    for (const surface of contactSurfaces) {
      const source = fs.readFileSync(path.join(rootDir, surface), 'utf8');
      assert.match(source, /contactMailto/, `${surface} doit utiliser le lien email partagé`);
    }

    for (const route of ['src/pages/contact.astro', 'src/pages/en/contact.astro']) {
      const page = fs.readFileSync(path.join(rootDir, route), 'utf8');
      assert.match(page, /ContactPanel/);
    }
  });

  test('La politique de confidentialité ne présume pas du fournisseur de publication', () => {
    for (const route of ['src/pages/privacy.astro', 'src/pages/en/privacy.astro']) {
      const policy = fs.readFileSync(path.join(rootDir, route), 'utf8');
      assert.doesNotMatch(policy, /published as static files on GitHub Pages|publié sous forme de fichiers statiques sur GitHub Pages/i);
      assert.match(policy, /hosting provider actually used|fournisseur d’hébergement effectivement utilisé/i);
    }
  });

  test('Les tokens CSS respectent les règles d\'interdiction et d\'accessibilité', () => {
    const tokens = fs.readFileSync(path.join(rootDir, 'styles', 'tokens.css'), 'utf8');
    assert.ok(tokens.includes('--color-canvas-default: #FAF8F5'), 'Le canvas doit être lin albâtre');
    assert.ok(tokens.includes('--color-text-primary: #0F141A'), 'Le texte principal doit être noir encre');
    assert.ok(tokens.includes('--color-accent-primary: #BF5516'), 'L\'accent doit être ocre');
    assert.ok(!tokens.includes('Space Grotesk'), 'Space Grotesk est interdit');
    assert.ok(!tokens.includes('Instrument Serif'), 'Instrument Serif est interdit');
  });

  test('GitHub enrichit uniquement le projet éditorial sélectionné et prévoit un fallback local', () => {
    const projectComponent = fs.readFileSync(
      path.join(rootDir, 'src', 'components', 'SelectedProjects.astro'),
      'utf8'
    );
    const metadataComponent = fs.readFileSync(
      path.join(rootDir, 'src', 'components', 'GitHubRepositoryMeta.astro'),
      'utf8'
    );
    const repositoryClient = fs.readFileSync(
      path.join(rootDir, 'src', 'utils', 'github-repository.ts'),
      'utf8'
    );

    assert.match(projectComponent, /GitHubRepositoryMeta owner="niangalce" repository="TerangaDigital\.shop"/);
    assert.match(metadataComponent, /summary\.textContent = fallback\(lang\)/);
    assert.match(metadataComponent, /setTimeout\(\(\) => controller\.abort\(\), 6000\)/);
    assert.match(repositoryClient, /credentials: 'omit'/);
    assert.match(repositoryClient, /referrerPolicy: 'no-referrer'/);
    assert.doesNotMatch(repositoryClient, /authorization|api[_-]?key/i);
  });
});
