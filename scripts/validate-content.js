import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const contentDir = path.join(rootDir, 'content');

console.log('🔍 Validation des données de contenu (Content Architecture)...');

const requiredFiles = [
  'profile.json',
  'projects.json',
  'experiences.json',
  'certifications.json',
  'skills.json',
  'skill-evidence.json',
  'services.json',
  'faq.json'
];

let hasErrors = false;

for (const file of requiredFiles) {
  const filePath = path.join(contentDir, file);
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Fichier manquant: content/${file}`);
    hasErrors = true;
    continue;
  }

  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(raw);
    console.log(`✅ content/${file} est un JSON valide.`);
  } catch (err) {
    console.error(`❌ Erreur de syntaxe dans content/${file}:`, err.message);
    hasErrors = true;
  }
}

// Vérification de la présence des fichiers physiques d'attestation et de photos
const certsFile = path.join(contentDir, 'certifications.json');
if (fs.existsSync(certsFile)) {
  const certs = JSON.parse(fs.readFileSync(certsFile, 'utf8'));
  for (const cert of certs) {
    const relativeDocPath = cert.verificationFile.replace(/^\//, '');
    const absoluteDocPath = path.join(rootDir, relativeDocPath);
    const publicDocPath = path.join(rootDir, 'public', relativeDocPath);
    if (!fs.existsSync(absoluteDocPath)) {
      console.error(`❌ Document d'attestation introuvable sur disque pour [${cert.title}]: ${cert.verificationFile}`);
      hasErrors = true;
    } else if (!fs.existsSync(publicDocPath)) {
      console.error(`❌ Copie publique de l'attestation introuvable pour [${cert.title}]: public/${relativeDocPath}`);
      hasErrors = true;
    } else {
      const documentBytes = fs.readFileSync(absoluteDocPath);
      const publicDocumentBytes = fs.readFileSync(publicDocPath);
      if (
        documentBytes.length < 8 ||
        documentBytes.subarray(0, 5).toString('ascii') !== '%PDF-' ||
        !documentBytes.toString('latin1').includes('%%EOF')
      ) {
        console.error(`❌ Fichier de preuve PDF invalide pour [${cert.title}]: ${cert.verificationFile}`);
        hasErrors = true;
        continue;
      }
      if (!documentBytes.equals(publicDocumentBytes)) {
        console.error(`❌ La copie publique diffère du document source pour [${cert.title}]: ${cert.verificationFile}`);
        hasErrors = true;
        continue;
      }
      console.log(`  📄 Preuve vérifiée sur disque : ${relativeDocPath}`);
    }
  }
}

// Vérification des photos de profil
const profileFile = path.join(contentDir, 'profile.json');
if (fs.existsSync(profileFile)) {
  const profile = JSON.parse(fs.readFileSync(profileFile, 'utf8'));
  const heroPhoto = path.join(rootDir, profile.identity.heroPortrait.relativePath.replace(/^\//, ''));
  const aboutPhoto = path.join(rootDir, profile.identity.aboutWorkspacePhoto.relativePath.replace(/^\//, ''));
  
  if (!fs.existsSync(heroPhoto)) {
    console.error(`❌ Photo Hero introuvable: ${profile.identity.heroPortrait.relativePath}`);
    hasErrors = true;
  } else {
    console.log(`  📸 Photo Hero vérifiée : ${profile.identity.heroPortrait.relativePath}`);
  }

  if (!fs.existsSync(aboutPhoto)) {
    console.error(`❌ Photo About introuvable: ${profile.identity.aboutWorkspacePhoto.relativePath}`);
    hasErrors = true;
  } else {
    console.log(`  📸 Photo About vérifiée : ${profile.identity.aboutWorkspacePhoto.relativePath}`);
  }
}

if (hasErrors) {
  console.error('\n❌ Échec de la validation du contenu.');
  process.exit(1);
} else {
  console.log('\n✨ Toutes les données de contenu et preuves physiques sont conformes et validées.');
}
