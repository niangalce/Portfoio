const siteUrl = process.env.SITE_URL;
const basePath = process.env.BASE_PATH || '/';

const fail = (message) => {
  console.error(`Build configuration error: ${message}`);
  process.exit(1);
};

if (!siteUrl) {
  fail('Set SITE_URL to the verified production origin before building.');
}

let site;
try {
  site = new URL(siteUrl);
} catch {
  fail('SITE_URL must be a valid absolute URL.');
}

const isLocalHttp =
  site.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(site.hostname);

if (
  !['https:', 'http:'].includes(site.protocol) ||
  (!isLocalHttp && site.protocol !== 'https:') ||
  site.username ||
  site.password ||
  site.pathname !== '/' ||
  site.search ||
  site.hash
) {
  fail('SITE_URL must be an HTTPS origin (HTTP is allowed only for localhost).');
}

if (!/^\/(?:[A-Za-z0-9._~-]+\/)*$/.test(basePath) || basePath.split('/').includes('..')) {
  fail('BASE_PATH must be / or a safe, slash-delimited path such as /repository/.');
}
