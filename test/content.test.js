import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const contentDir = path.join(rootDir, 'content');

describe('Content Architecture & Data Integrity Tests', () => {
  test('Le profil d\'Alce Niang est complet et bilingue', () => {
    const profile = JSON.parse(fs.readFileSync(path.join(contentDir, 'profile.json'), 'utf8'));
    assert.equal(profile.identity.fullName, 'Alce Niang');
    assert.ok(profile.identity.titles.fr, 'Titre FR manquant');
    assert.ok(profile.identity.titles.en, 'Titre EN manquant');
    assert.equal(profile.identity.contact.email, 'niangalce@gmail.com');
    assert.equal(profile.identity.contact.phone, '+221 78 217 76 59');

    for (const photo of [profile.identity.heroPortrait, profile.identity.aboutWorkspacePhoto]) {
      const relativePath = photo.relativePath.replace(/^\//, '');
      const sourcePath = path.join(rootDir, relativePath);
      const publicPath = path.join(rootDir, 'public', relativePath);

      assert.ok(relativePath.endsWith('.webp'), 'Les portraits servis doivent être optimisés en WebP');
      assert.ok(fs.existsSync(sourcePath), `Photo source optimisée absente : ${relativePath}`);
      assert.ok(fs.existsSync(publicPath), `Photo publiée absente : ${relativePath}`);
      assert.ok(fs.statSync(publicPath).size < 150_000, `Photo trop lourde : ${relativePath}`);
    }
  });

  test('La formation et les langues présentent le parcours universitaire en anglais', () => {
    const profile = JSON.parse(fs.readFileSync(path.join(contentDir, 'profile.json'), 'utf8'));
    const englishDegree = profile.education.find(item => item.id === 'ucad-l2');

    assert.ok(englishDegree, 'La formation universitaire en anglais à l’UCAD doit être visible');
    assert.match(englishDegree.degree.fr, /Anglais/);
    assert.match(englishDegree.degree.en, /English/);
    assert.ok(englishDegree.description.fr);
    assert.ok(englishDegree.description.en);
    assert.deepEqual(
      profile.languages.map(language => language.name),
      ['Français', 'English', 'Wolof']
    );
    assert.ok(profile.languages.every(language => language.level.fr && language.level.en));
  });

  test('Les expériences couvrent les cinq catégories demandées et les preuves de projets existent', () => {
    const experiences = JSON.parse(fs.readFileSync(path.join(contentDir, 'experiences.json'), 'utf8'));
    const projects = JSON.parse(fs.readFileSync(path.join(contentDir, 'projects.json'), 'utf8'));
    const categories = new Set(experiences.flatMap(experience => experience.categories));

    assert.deepEqual(
      [...categories].sort(),
      ['Communication', 'Digital', 'Entrepreneurship', 'Other', 'Tech']
    );
    assert.ok(experiences.every(experience => experience.role.fr && experience.role.en));
    assert.equal(projects.find(project => project.id === 'jef')?.githubUrl, null);
    assert.ok(projects.find(project => project.id === 'terangadigital')?.githubUrl);
  });

  test('Toutes les 6 certifications sont documentées avec des fichiers valides sur disque', () => {
    const certs = JSON.parse(fs.readFileSync(path.join(contentDir, 'certifications.json'), 'utf8'));
    assert.equal(certs.length, 6, 'Il doit y avoir exactement 6 certifications vérifiées');
    
    for (const cert of certs) {
      assert.ok(cert.id, 'ID de certification manquant');
      assert.ok(cert.title, 'Titre de certification manquant');
      assert.ok(cert.issuer, 'Émetteur manquant');
      assert.ok(cert.date, 'Date de certification manquante');
      assert.ok(cert.category, 'Catégorie de certification manquante');
      assert.ok(cert.description.fr && cert.description.en, 'Description bilingue manquante');
      assert.ok(cert.skills.length > 0, 'Compétences de certification manquantes');
      assert.ok(cert.verificationFile, 'Lien de fichier manquant');
      const absPath = path.join(rootDir, cert.verificationFile.replace(/^\//, ''));
      const publicPath = path.join(rootDir, 'public', cert.verificationFile.replace(/^\//, ''));
      assert.ok(fs.existsSync(absPath), `Le fichier certifié ${cert.verificationFile} doit exister sur le disque.`);
      assert.ok(fs.existsSync(publicPath), `Le fichier certifié ${cert.verificationFile} doit être publié.`);
      const file = fs.readFileSync(absPath);
      assert.equal(file.subarray(0, 5).toString('ascii'), '%PDF-', `PDF invalide : ${cert.verificationFile}`);
      assert.ok(file.toString('latin1').includes('%%EOF'), `PDF incomplet : ${cert.verificationFile}`);
      assert.deepEqual(
        fs.readFileSync(publicPath),
        file,
        `Le PDF publié doit être identique au document source : ${cert.verificationFile}`
      );
    }
  });

  test('Le projet JËF respecte la règle de statut "In active development"', () => {
    const projects = JSON.parse(fs.readFileSync(path.join(contentDir, 'projects.json'), 'utf8'));
    const jef = projects.find(p => p.id === 'jef');
    assert.ok(jef, 'Projet JËF manquant');
    assert.equal(jef.status, 'In active development', 'JËF ne doit jamais être présenté comme terminé ou commercialisé');
    assert.equal(jef.role, 'CEO & Lead Developer');
  });

  test('Les études de cas des projets principaux couvrent les rubriques bilingues sans inventer de démo', () => {
    const projects = JSON.parse(fs.readFileSync(path.join(contentDir, 'projects.json'), 'utf8'));
    const requiredSections = [
      'context',
      'problem',
      'objective',
      'role',
      'process',
      'design',
      'development',
      'result',
      'difficulties',
      'learning'
    ];

    for (const id of ['terangadigital', 'jef']) {
      const project = projects.find(item => item.id === id);
      assert.ok(project, `Le projet ${id} doit exister`);
      assert.ok(project.caseStudy, `Étude de cas manquante pour ${id}`);

      for (const section of requiredSections) {
        assert.ok(project.caseStudy[section]?.fr, `${section}.fr manquant pour ${id}`);
        assert.ok(project.caseStudy[section]?.en, `${section}.en manquant pour ${id}`);
      }

      assert.ok(project.stack.length > 0, `Stack manquante pour ${id}`);
      assert.ok(project.caseStudy.currentStatus.fr && project.caseStudy.currentStatus.en);
    }

    const teranga = projects.find(item => item.id === 'terangadigital');
    const jef = projects.find(item => item.id === 'jef');
    const portfolio = projects.find(item => item.id === 'portfolio');
    assert.match(teranga.role, /fondée par Alce Niang/i);
    assert.equal(teranga.liveUrl, null, 'Aucune URL de démonstration inaccessible ne doit être publiée');
    assert.equal(portfolio.githubUrl, null, 'Une page de profil GitHub ne doit pas être étiquetée comme dépôt');
    assert.equal(portfolio.liveUrl, null, 'Une URL de site qui retourne 404 ne doit pas être publiée');
    assert.equal(jef.liveUrl, null, 'Aucune démo publique ne doit être inventée pour JËF');
    assert.equal(jef.githubUrl, null, 'Aucun dépôt JËF non public ne doit être publié comme preuve');
    assert.match(jef.caseStudy.result.fr, /aucun produit final ni démo publique/i);
  });

  test('Les compétences ne contiennent aucun faux pourcentage arbitraire', () => {
    const skills = JSON.parse(fs.readFileSync(path.join(contentDir, 'skills.json'), 'utf8'));
    const validStatuses = ['Comfortable', 'Practicing', 'Building', 'Learning'];
    
    for (const cat of skills.categories) {
      for (const sk of cat.skills) {
        assert.ok(
          validStatuses.includes(sk.status),
          `Le statut de compétence "${sk.status}" pour ${sk.name} doit être qualitatif : ${validStatuses.join(', ')}`
        );
        assert.ok(!sk.status.includes('%'), `Aucun pourcentage n'est autorisé pour ${sk.name}`);
      }
    }
  });

  test('Les compétences sont reliées à des preuves existantes de façon typée', () => {
    const skills = JSON.parse(fs.readFileSync(path.join(contentDir, 'skills.json'), 'utf8'));
    const evidence = JSON.parse(fs.readFileSync(path.join(contentDir, 'skill-evidence.json'), 'utf8'));
    const projects = JSON.parse(fs.readFileSync(path.join(contentDir, 'projects.json'), 'utf8'));
    const experiences = JSON.parse(fs.readFileSync(path.join(contentDir, 'experiences.json'), 'utf8'));
    const certifications = JSON.parse(fs.readFileSync(path.join(contentDir, 'certifications.json'), 'utf8'));
    const profile = JSON.parse(fs.readFileSync(path.join(contentDir, 'profile.json'), 'utf8'));
    const skillNames = new Set(skills.categories.flatMap(category => category.skills.map(skill => skill.name)));
    const validTypes = new Set(['project', 'experience', 'certification', 'training']);
    const seenTypes = new Set();
    const sourceIds = {
      project: new Set(projects.map(project => project.id)),
      experience: new Set(experiences.map(experience => experience.id)),
      certification: new Set(certifications.map(certification => certification.id)),
      training: new Set(profile.education.map(training => training.id))
    };

    for (const [skillName, references] of Object.entries(evidence)) {
      assert.ok(skillNames.has(skillName), `Preuve associée à une compétence inconnue : ${skillName}`);
      assert.ok(Array.isArray(references) && references.length > 0, `Preuve manquante pour ${skillName}`);

      for (const reference of references) {
        assert.ok(validTypes.has(reference.type), `Type de preuve invalide : ${reference.type}`);
        assert.ok(sourceIds[reference.type].has(reference.id), `Source de preuve introuvable : ${reference.id}`);
        seenTypes.add(reference.type);
      }
    }

    assert.deepEqual([...seenTypes].sort(), ['certification', 'experience', 'project', 'training']);
  });

  test('Les quatre statuts Full-Stack proviennent des statuts de compétences autorisés', () => {
    const skills = JSON.parse(fs.readFileSync(path.join(contentDir, 'skills.json'), 'utf8'));
    const statuses = new Set(skills.categories.flatMap(category => category.skills.map(skill => skill.status)));

    assert.deepEqual([...statuses].sort(), ['Building', 'Comfortable', 'Learning', 'Practicing']);
  });

  test('La FAQ couvre les thèmes demandés dans les deux langues', () => {
    const faq = JSON.parse(fs.readFileSync(path.join(contentDir, 'faq.json'), 'utf8'));
    const categories = new Set(faq.map(item => item.category));

    for (const category of ['Recruitment', 'Services', 'Projects', 'Collaboration', 'Availability', 'Contact']) {
      assert.ok(categories.has(category), `Catégorie FAQ manquante : ${category}`);
    }
    assert.ok(faq.every(item => item.question.fr && item.question.en && item.answer.fr && item.answer.en));
  });
});
