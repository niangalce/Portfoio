import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const publicDir = path.join(rootDir, 'public');
const profile = JSON.parse(fs.readFileSync(path.join(rootDir, 'content', 'profile.json'), 'utf8'));
const profilePhotos = [
  profile.identity.heroPortrait.relativePath,
  profile.identity.aboutWorkspacePhoto.relativePath
].map(relativePath => path.basename(relativePath));

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

const foldersToSync = ['certification', 'CV', 'photo profile'];

for (const folder of foldersToSync) {
  const src = path.join(rootDir, folder);
  const dest = path.join(publicDir, folder);
  if (!fs.existsSync(src)) continue;
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });

  const files = folder === 'photo profile'
    ? profilePhotos
    : fs.readdirSync(src);
  for (const f of files) {
    fs.copyFileSync(path.join(src, f), path.join(dest, f));
    console.log(`✅ Asset synchronisé : public/${folder}/${f}`);
  }
}

console.log('✨ Tous les actifs certifiés et photos sont prêts pour distribution statique.');
