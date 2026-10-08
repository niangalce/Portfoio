import profileData from '../../content/profile.json';

export const contactEmail = profileData.identity.contact.email;

export const contactMailto = (lang: 'fr' | 'en' = 'fr') => {
  const subject = lang === 'fr' ? 'Contact depuis le portfolio' : 'Portfolio contact';
  return `mailto:${contactEmail}?subject=${encodeURIComponent(subject)}`;
};
