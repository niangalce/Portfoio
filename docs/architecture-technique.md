# DOCUMENTATION TECHNIQUE — PORTFOLIO D'ALCE NIANG
*Senior Technical Architect & Front-End Engineer*

---

## 1. Choix du Framework & du Langage

### Framework retenu : **Astro 7 (Mode Statique / Jamstack)**
* **Pourquoi Astro et pas Next.js pour ce portfolio ?**
  - Next.js (utilisé par Alce sur le projet SaaS JËF) est idéal pour des applications dynamiques avec sessions et base de données. Cependant, pour un portfolio servi sur GitHub Pages et consulté majoritairement sur smartphone au Sénégal (réseau 3G/4G), Next.js impose un runtime JavaScript d'hydratation de 100 à 250 Ko totalement superflu.
  - Astro génère par défaut du **pur HTML sémantique et du CSS compressé (0 Ko de JavaScript client initial)**. Le temps de chargement est instantané (First Contentful Paint < 1.0s, score Lighthouse 100/100).
  - Astro supporte nativement le bilinguisme (`i18n`), le typage TypeScript strict, les routes statiques imbriquées et la génération de `dist/` sans configuration complexe.
* **Langage : TypeScript 5 (Mode Strict)**
  - Typage exhaustif des modèles de données (`content/*.json`), éliminant tout risque d'erreur d'exécution ou de champ manquant.

---

## 2. Routage & Structure des URLs

Astro est configuré avec `output: 'static'` et `build.format: 'directory'`, produisant des dossiers propres avec `index.html` :
- `https://niangalce.github.io/` $\rightarrow$ Accueil en français
- `https://niangalce.github.io/about/` $\rightarrow$ Page À propos (FR)
- `https://niangalce.github.io/projects/` $\rightarrow$ Réalisations (FR)
- `https://niangalce.github.io/projects/jef/` $\rightarrow$ Case study JËF (FR)
- `https://niangalce.github.io/Portfoio/projects/terangadigital/` $\rightarrow$ Case study TèrangaDigital (FR)
- `https://niangalce.github.io/certifications/` $\rightarrow$ Bibliothèque des 6 attestations (FR)
- `https://niangalce.github.io/contact/` $\rightarrow$ Formulaire et coordonnées (FR)
- `https://niangalce.github.io/en/` $\rightarrow$ Homepage in English
- `https://niangalce.github.io/en/about/` $\rightarrow$ About in English
- `https://niangalce.github.io/en/projects/` $\rightarrow$ Projects in English
- `https://niangalce.github.io/404.html` $\rightarrow$ Page d'erreur personnalisée

---

## 3. Architecture du Contenu (Content Architecture)

Toutes les données textuelles et métadonnées sont isolées dans le dossier `content/` :
- `content/profile.json` (identité, photos, cursus UCAD, langues)
- `content/projects.json` (case studies JËF, TèrangaDigital, Portfolio)
- `content/experiences.json` (5 catégories : UNV, Natural's, Sécurité, Freelance, Tech)
- `content/certifications.json` (6 attestations vérifiées avec chemins PDF)
- `content/skills.json` (compétences qualitatives : Comfortable, Practicing, Building, Learning)
- `content/services.json` (services disponibles vs roadmap)
- `content/faq.json` (6 questions-réponses vérifiées)

**Règle d'or** : Pour modifier un contenu ou ajouter une certification, il suffit de modifier le JSON sans toucher aux composants Astro.

---

## 4. Stratégie i18n & SEO

1. Balises `<link rel="alternate" hreflang="fr" href="..." />` et `<link rel="alternate" hreflang="en" href="..." />` intégrées sur chaque page.
2. Canonical URL dynamique selon la langue active.
3. Données structurées JSON-LD (`Schema.org/Person`, `Schema.org/WebSite`) pour un affichage enrichi dans les résultats Google.
4. OpenGraph et Twitter Cards avec image portrait officielle 1024×1536 px.

---

## 5. Gestion des Styles & Design Tokens

- Tous les styles reposent sur le fichier de tokens officiel [`styles/tokens.css`](file:///c:/Users/user/OneDrive/Desktop/Portfoio/styles/tokens.css).
- Zéro framework CSS lourd injecté dans le bundle client.
- Zéro dégradé violet/bleu. Contrastes WCAG 2.2 AAA (14.8:1 sur texte principal).
- Support natif de `@media (prefers-reduced-motion: reduce)`.

---

## 6. Stratégie de Test & Assurance Qualité

- Utilisation du moteur de test natif de Node.js (`node:test` et `node:assert`) :
  - `test/architecture.test.js` : vérifie la présence des fichiers clés, la configuration d'export statique, le typage et les règles d'interdiction.
  - `test/content.test.js` : vérifie la conformité bilingue, l'existence physique des 6 PDFs certifiés et des 2 photographies sur disque, et l'absence de faux pourcentages.
- Script de validation de données : `npm run validate:content`.
- Script de linting architectural : `npm run lint`.

---

## 7. Déploiement & Portabilité

- **GitHub Pages (Aujourd'hui)** : Le script `npm run build` compile dans le dossier `dist/`. La variable d'environnement `BASE_PATH` permet d'adapter le chemin si le projet est hébergé sous un sous-dossier (`/portfolio`) ou à la racine (`/`).
- **Vercel / Netlify (Demain)** : Aucun changement de code nécessaire. `dist/` est un répertoire statique standard universel.
