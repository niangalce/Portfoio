# Portfolio Professionnel — Alce Niang

> Développeur Web Front-End Junior · Étudiant en Anglais (UCAD) · Créateur Digital & Entrepreneur  
> Dakar, Sénégal — Contact : [niangalce@gmail.com](mailto:niangalce@gmail.com)

---

## 🚀 Présentation de la Plateforme

Ce projet est la plateforme personnelle et professionnelle d'**Alce Niang**.  
Elle a été pensée pour répondre à des exigences élevées :
- **Architecture statique moderne (Jamstack)** basée sur **Astro 7 & TypeScript**
- **Déploiement statique** sur **GitHub Pages** (avec portabilité native Vercel / Netlify)
- **Bilinguisme natif (FR / EN)** sans dépendance lourde
- **Progressive enhancement** : données de projets conservées localement, enrichissement GitHub non bloquant
- **Accessibilité** : HTML sémantique, focus visible et prise en compte de la réduction des animations
- **Séparation étanche entre les données et la présentation** via des schémas JSON typés

---

## 📂 Structure du Répertoire

```

Node.js `22.12.0` ou plus récent est requis par Astro 7.
Portfoio/
├── content/              # Données bilingues, compétences et associations de preuves
├── src/
│   ├── components/       # Composants d'interface (Hero, Nav, Cards, Modales)
│   ├── layouts/          # Gabarits de page (BaseLayout, ProjectLayout)
│   ├── pages/            # Pages statiques FR/EN et études de cas /projects/[slug]/
│   └── utils/            # Fonctions utilitaires (URLs, métadonnées GitHub, animations)
├── styles/
│   └── tokens.css        # Design tokens officiels (couleurs, typo, espacements)
├── public/               # Actifs statiques servis directement (PDFs, images)
├── scripts/              # Scripts de maintenance (lint, validate-content, synchronisation des assets)
├── test/                 # Tests unitaires et d'intégrité (node:test)
├── astro.config.mjs      # Configuration d'export statique et i18n
├── tsconfig.json         # Typage TypeScript strict
└── package.json
```

Les études de cas principales sont accessibles en français sous `/projects/jef/` et
`/projects/terangadigital/`, et en anglais sous `/en/projects/` avec les mêmes slugs.

---

## 🛠️ Commandes Disponibles

```bash
# Installation des dépendances
npm install

# Lancement de l'environnement de développement local (port 3000)
npm run dev

# Construction statique de production (génère dans dist/)
npm run build

# Prévisualisation du livrable de production en local
npm run preview

# Lancement des tests automatisés (architecture et intégrité des données)
npm test

# Validation du contenu et des pièces jointes certifiées
npm run validate:content

# Linting et conformité des règles techniques
npm run lint
```

Les certifications sont filtrables par catégorie et renvoient vers les PDF conservés
dans `public/certification/`. `content/skill-evidence.json` associe les compétences
aux projets, expériences, certifications ou formations documentés ; toute référence
doit correspondre à une entrée existante. Les statuts de progression sont
`Comfortable`, `Practicing`, `Building` et `Learning`, sans pourcentage.

## Contact, confidentialité et référencement

Les routes françaises sont à la racine (`/`) et les routes anglaises sous
`/en/`. Contact, FAQ, Confidentialité et les études de cas sont bilingues.
Les liens de contact ouvrent directement l’application de messagerie avec
`niangalce@gmail.com` et un objet prérempli. La page Contact affiche aussi l’adresse
et permet de la copier. Le portfolio n’a ni formulaire d’envoi, ni backend, ni service
email et ne confirme jamais l’envoi d’un message.

Les projets restent une sélection éditoriale locale. La page d’accueil et l’étude
de cas TèrangaDigital enrichissent uniquement le dépôt public vérifié avec ses
métadonnées GitHub ; si l’API échoue, le contenu local et le lien vers le dépôt
restent disponibles. Le portfolio n’intègre pas d’analytics.

Les balises canonical, Open Graph, Twitter Card, hreflang, le sitemap et
`robots.txt` utilisent `SITE_URL` et `BASE_PATH`. La configuration cible le site GitHub
Pages du portefeuille Alce Niang :

- `SITE_URL=https://niangalce.github.io`
- `BASE_PATH=/Portfoio/`

Le build refuse une origine manquante ou un chemin invalide. En local, il est possible
de surcharger ces valeurs si nécessaire, mais la configuration de production par défaut
correspond au dépôt public vérifié associé au site.

Exemple de build local PowerShell :

```powershell
$env:SITE_URL = "https://niangalce.github.io"
$env:BASE_PATH = "/Portfoio/"
npm run build
```

Le dépôt GitHub réel utilisé pour ce portfolio est `niangalce/Portfoio`, publié en
site de projet GitHub Pages. Le workflow GitHub Actions ajoutée dans
`.github/workflows/deploy-pages.yml` publie le site sur `https://niangalce.github.io/Portfoio/`.
Le rollback manuel le plus simple reste de redéployer depuis GitHub Actions le commit
précédent dont le build a réussi ; aucun rollback automatique n’est configuré.

GitHub Pages ne permet pas de définir ici des en-têtes de réponse comme HSTS ou
`X-Frame-Options`. La CSP et `Referrer-Policy` fournies en balises meta sont des
protections partielles : `unsafe-inline` reste requis par les scripts statiques
générés, et la CSP meta ne fournit pas `frame-ancestors`. Un hébergeur ou proxy
permettant de configurer des en-têtes reste nécessaire pour ces protections.

La politique de confidentialité décrit les demandes techniques de l’hébergement,
le chargement des polices Google Fonts, la requête optionnelle à l’API publique de
GitHub et le comportement des liens email. Le site n’intègre pas d’analytics ni de
suivi publicitaire. Le lien LinkedIn fourni reste présent, mais son état n’a pas pu
être confirmé automatiquement (réponse anti-robot HTTP 999).

## Contenu et assets

Les informations bilingues éditoriales sont maintenues dans `content/*.json`.
Les images de projet optimisées résident dans `public/project-assets/` ; les
portraits sources sont conservés dans `photo profile/` et les WebP publiés dans
`public/photo profile/`. Les CV et attestations PDF sont synchronisés vers `public/`
par `node scripts/sync-public.js`. Après modification, lancer `npm run
validate:content` et les tests.

---

## 📜 Licence
Code sous licence MIT — Contenus, photographies et attestations d'Alce Niang protégés par le droit d'auteur.
