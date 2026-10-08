export function sitePath(path: string): string {
  if (/^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(path) || path.startsWith('#')) {
    return path;
  }

  const base = import.meta.env.BASE_URL.endsWith('/')
    ? import.meta.env.BASE_URL
    : `${import.meta.env.BASE_URL}/`;
  const normalizedPath = path.replace(/^\/+/, '');
  const normalizedBase = base.replace(/^\/+|\/+$/g, '');

  if (
    normalizedBase &&
    (normalizedPath === normalizedBase || normalizedPath.startsWith(`${normalizedBase}/`))
  ) {
    return `/${normalizedPath}`;
  }

  return `${base}${normalizedPath}`;
}

export function getAlternatePath(path: string, lang: 'fr' | 'en'): string {
  const base = import.meta.env.BASE_URL.endsWith('/')
    ? import.meta.env.BASE_URL
    : `${import.meta.env.BASE_URL}/`;
  const normalizedBase = base.replace(/^\/+|\/+$/g, '');
  let localizedRoute = `/${path.replace(/^\/+/, '')}`;
  if (
    normalizedBase &&
    (localizedRoute === `/${normalizedBase}` || localizedRoute.startsWith(`/${normalizedBase}/`))
  ) {
    localizedRoute = localizedRoute.slice(normalizedBase.length + 1) || '/';
  }
  const pathWithoutLocale = localizedRoute.replace(/^\/en(?=\/|$)/, '') || '/';

  return sitePath(
    lang === 'fr'
      ? `/en${pathWithoutLocale === '/' ? '/' : pathWithoutLocale}`
      : pathWithoutLocale
  );
}
