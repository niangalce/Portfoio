import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('🔍 Exécution du linter technique et de cohérence...');

let errorCount = 0;

// 1. Vérification des tokens CSS
const tokensPath = path.join(rootDir, 'styles', 'tokens.css');
if (!fs.existsSync(tokensPath)) {
  console.error('❌ styles/tokens.css introuvable.');
  errorCount++;
} else {
  const css = fs.readFileSync(tokensPath, 'utf8');
  // Vérification de non-utilisation des termes interdits
  const forbiddenTerms = [
    'linear-gradient(to right, #8b5cf6, #3b82f6)',
    'linear-gradient(to right, purple, blue)',
    'Space Grotesk',
    'Instrument Serif'
  ];
  
  for (const term of forbiddenTerms) {
    if (css.includes(term)) {
      console.error(`❌ Terme ou style interdit détecté dans tokens.css : "${term}"`);
      errorCount++;
    }
  }

  // Vérifier la présence des variables essentielles
  const requiredTokens = [
    '--color-canvas-default',
    '--color-text-primary',
    '--color-accent-primary',
    '--color-verified-text',
    '--font-display',
    '--font-body',
    '--font-mono'
  ];

  for (const tok of requiredTokens) {
    if (!css.includes(tok)) {
      console.error(`❌ Token obligatoire manquant : ${tok}`);
      errorCount++;
    }
  }
}

// 2. Vérification des fichiers de configuration
const configFiles = ['astro.config.mjs', 'tsconfig.json', 'package.json', '.gitignore'];
for (const cfg of configFiles) {
  if (!fs.existsSync(path.join(rootDir, cfg))) {
    console.error(`❌ Fichier de configuration manquant : ${cfg}`);
    errorCount++;
  }
}

if (errorCount > 0) {
  console.error(`\n❌ Échec du linting avec ${errorCount} anomalie(s).`);
  process.exit(1);
} else {
  console.log('✅ Linting validé avec succès. Aucune infraction aux règles architecturales.');
}
