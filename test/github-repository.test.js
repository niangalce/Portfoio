import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = fs.readFileSync(
  path.join(rootDir, 'src', 'utils', 'github-repository.ts'),
  'utf8'
);
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 }
}).outputText;
const { fetchPublicRepositoryMetadata } = await import(
  `data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`
);

describe('GitHub repository metadata integration', () => {
  test('returns only validated public metadata and sends no credentials or referrer', async (t) => {
    const metadata = {
      description: 'Public repository description',
      stargazers_count: 3,
      updated_at: '2026-10-07T12:00:00Z'
    };
    let request;

    t.mock.method(globalThis, 'fetch', async (url, options) => {
      request = { url, options };
      return { ok: true, json: async () => metadata };
    });

    const result = await fetchPublicRepositoryMetadata('niangalce', 'TerangaDigital.shop');

    assert.equal(result.description, metadata.description);
    assert.equal(result.stars, 3);
    assert.equal(result.updatedAt.toISOString(), new Date(metadata.updated_at).toISOString());
    assert.equal(request.url, 'https://api.github.com/repos/niangalce/TerangaDigital.shop');
    assert.equal(request.options.credentials, 'omit');
    assert.equal(request.options.referrerPolicy, 'no-referrer');
  });

  test('rejects unavailable API responses and malformed metadata for local fallback', async (t) => {
    t.mock.method(globalThis, 'fetch', async () => ({ ok: false, status: 503 }));
    await assert.rejects(
      fetchPublicRepositoryMetadata('niangalce', 'TerangaDigital.shop'),
      /status 503/
    );

    t.mock.restoreAll();
    t.mock.method(globalThis, 'fetch', async () => ({
      ok: true,
      json: async () => ({ description: '<script>', stargazers_count: 'many', updated_at: 'invalid' })
    }));
    await assert.rejects(
      fetchPublicRepositoryMetadata('niangalce', 'TerangaDigital.shop'),
      /unexpected format/
    );
  });

  test('propagates network failures so the interface can keep its local fallback', async (t) => {
    t.mock.method(globalThis, 'fetch', async () => {
      throw new TypeError('Network unavailable.');
    });

    await assert.rejects(
      fetchPublicRepositoryMetadata('niangalce', 'TerangaDigital.shop'),
      /Network unavailable/
    );
  });

  test('rejects invalid repository identifiers before making a request', async (t) => {
    t.mock.method(globalThis, 'fetch', async () => {
      throw new Error('A request should not be made.');
    });

    await assert.rejects(fetchPublicRepositoryMetadata('niangalce/example/path', 'repo'), /Invalid/);
  });
});
