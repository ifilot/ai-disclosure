import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { badgeFilename, reviewStatuses, scoreLevels } from '../site/rubric.js';

const output = new URL('../dist/', import.meta.url);
const assets = ['index.html', 'app.js', 'rubric.js', 'bootstrap.min.css', 'styles.css', 'icons.svg', 'favicon.svg'];
for (const asset of assets) {
  assert.ok(readFileSync(new URL(asset, output)).length > 0, `${asset} is empty`);
}

const filenames = [];
for (const { value: design } of scoreLevels) {
  for (const { value: implementation } of scoreLevels) {
    for (const { value: testing } of scoreLevels) {
      for (const { value: docs } of scoreLevels) {
        filenames.push(badgeFilename([design, implementation, testing, docs]));
      }
    }
  }
}
filenames.sort();

for (const { folder } of reviewStatuses) {
  const directory = new URL(`badges/${folder}/`, output);
  const items = readdirSync(directory, { withFileTypes: true });
  assert.ok(items.every(item => item.isFile()), `Unexpected entry in badges/${folder}/`);
  assert.deepEqual(items.map(item => item.name).sort(), filenames, `Badge catalog mismatch in ${folder}`);

  const sample = readFileSync(new URL(badgeFilename(['0', '4', '0', '4']), directory), 'utf8');
  assert.match(sample, /^<svg\b[^>]+height="20"/);
  assert.equal(sample.includes('fill="#237342"'), folder === 'full');
}

console.log(`Verified ${assets.length} site assets and ${filenames.length * reviewStatuses.length} badge SVGs in dist/.`);
