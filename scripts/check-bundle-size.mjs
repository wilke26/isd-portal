import { readFile } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';

const manifestPath = new URL('../dist/.vite/manifest.json', import.meta.url);
const distDirectory = new URL('../dist/', import.meta.url);
const initialGzipLimit = 90 * 1024;
const routeGzipLimit = 15 * 1024;
const expectedRoutes = [
  'src/pages/LoginPage.tsx',
  'src/pages/TicketsPage.tsx',
  'src/pages/NewTicketPage.tsx',
  'src/pages/TicketDetailPage.tsx',
  'src/pages/KnowledgeBasePage.tsx',
  'src/pages/AssetsPage.tsx',
];

const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
const entries = Object.entries(manifest).filter(([, chunk]) => chunk.isEntry);

if (entries.length !== 1) {
  throw new Error(`Expected one application entry in the Vite manifest, found ${entries.length}.`);
}

const [entryKey] = entries[0];

function collectStaticImports(key, collected = new Set()) {
  if (collected.has(key)) {
    return collected;
  }

  const chunk = manifest[key];

  if (!chunk) {
    throw new Error(`Manifest import ${key} does not exist.`);
  }

  collected.add(key);

  for (const importedKey of chunk.imports ?? []) {
    collectStaticImports(importedKey, collected);
  }

  return collected;
}

async function gzipSize(file) {
  const contents = await readFile(new URL(file, distDirectory));
  return gzipSync(contents).byteLength;
}

function kib(bytes) {
  return `${(bytes / 1024).toFixed(2)} KiB`;
}

const initialChunks = [...collectStaticImports(entryKey)]
  .map((key) => manifest[key])
  .filter((chunk) => chunk.file.endsWith('.js'));
const initialGzipSize = (
  await Promise.all(initialChunks.map((chunk) => gzipSize(chunk.file)))
).reduce((total, size) => total + size, 0);

console.log(`Initial JavaScript: ${kib(initialGzipSize)} / ${kib(initialGzipLimit)}`);

if (initialGzipSize > initialGzipLimit) {
  throw new Error(
    `Initial JavaScript exceeds the compressed budget by ${kib(initialGzipSize - initialGzipLimit)}.`,
  );
}

for (const routeKey of expectedRoutes) {
  const route = manifest[routeKey];

  if (!route?.isDynamicEntry) {
    throw new Error(`${routeKey} must remain a dynamically imported route.`);
  }

  const size = await gzipSize(route.file);
  console.log(`${routeKey}: ${kib(size)} / ${kib(routeGzipLimit)}`);

  if (size > routeGzipLimit) {
    throw new Error(`${routeKey} exceeds the compressed route budget by ${kib(size - routeGzipLimit)}.`);
  }
}

console.log(`Bundle budgets passed for ${expectedRoutes.length} lazy-loaded routes.`);
