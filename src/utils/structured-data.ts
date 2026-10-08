import profileData from '../../content/profile.json';
import { sitePath } from './urls';

export function getPortfolioStructuredData(site: URL, lang: 'fr' | 'en') {
  const identity = profileData.identity;
  const url = new URL(sitePath('/'), site).href;

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        '@id': `${url}#person`,
        name: identity.fullName,
        url,
        image: new URL(sitePath(identity.heroPortrait.relativePath), site).href,
        jobTitle: identity.titles[lang],
        description: identity.strategicPositioning[lang],
        email: `mailto:${identity.contact.email}`,
        address: {
          '@type': 'PostalAddress',
          addressLocality: identity.location.city,
          addressCountry: identity.location.countryCode
        },
        sameAs: Object.values(identity.social)
      },
      {
        '@type': 'WebSite',
        '@id': `${url}#website`,
        url,
        name: 'Alce Niang',
        inLanguage: lang === 'fr' ? 'fr' : 'en',
        publisher: { '@id': `${url}#person` }
      }
    ]
  };
}
