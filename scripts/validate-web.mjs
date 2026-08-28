import { readFile, stat } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..', 'game');
const html = await readFile(resolve(root, 'index.html'), 'utf8');
const localReferences = [...html.matchAll(/(?:src|href)="([^"]+)"/g)]
  .map((match) => match[1])
  .filter((value) => !/^(?:https?:|#|data:)/.test(value));

const missing = [];
for (const reference of localReferences) {
  const path = resolve(root, reference.split(/[?#]/, 1)[0]);
  try {
    await stat(path);
  } catch {
    missing.push(reference);
  }
}

const screenIds = [...html.matchAll(/id="screen-([^"]+)"/g)].map((match) => match[1]);
const appSource = await readFile(resolve(root, 'js', 'app.js'), 'utf8');
for (const id of screenIds) {
  if (!appSource.includes(`'${id}'`)) missing.push(`screen registration: ${id}`);
}

if (missing.length) {
  console.error('Web validation failed:');
  missing.forEach((entry) => console.error(`- ${entry}`));
  process.exit(1);
}

console.log(`Validated ${localReferences.length} local references and ${screenIds.length} screens.`);
