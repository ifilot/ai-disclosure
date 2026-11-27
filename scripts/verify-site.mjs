import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, posix } from 'node:path';
import { fileURLToPath } from 'node:url';
import { badgeFilename, badgePagePath, parseBadgeParameters, reviewStatuses, rubricVersion, scoreLevels } from '../site/rubric.js';
import { pages, scripts, styles } from './site-files.mjs';

const output = fileURLToPath(new URL('../dist/', import.meta.url));
const read = path => readFileSync(join(output, path), 'utf8');

// 1. Every asset exists and is non-empty.
const assets = [...pages, ...scripts, ...styles, 'bootstrap.min.css', 'icons.svg', 'favicon.svg'];
for (const asset of assets) {
  assert.ok(existsSync(join(output, asset)) && read(asset).length > 0, `${asset} is missing or empty`);
}

// 2. Browser scripts at least parse as modules.
const scratch = mkdtempSync(join(tmpdir(), 'colophon-verify-'));
try {
  for (const script of scripts) {
    const copy = join(scratch, script.replace(/\.js$/, '.mjs'));
    copyFileSync(join(output, script), copy);
    execFileSync(process.execPath, ['--check', copy]);
  }
} finally {
  rmSync(scratch, { recursive: true, force: true });
}

// 3. Internal links, image sources, anchors, and icon references resolve.
const iconIds = new Set([...read('icons.svg').matchAll(/<symbol id="([^"]+)"/g)].map(match => match[1]));
const idsIn = path => new Set([...read(path).matchAll(/\sid="([^"]+)"/g)].map(match => match[1]));
const problems = [];
for (const page of pages) {
  const html = read(page);
  for (const [, attribute, value] of html.matchAll(/\s(href|src)="([^"]*)"/g)) {
    if (/^(https?:|mailto:|data:)/.test(value)) continue;
    const [pathPart, fragment] = value.split('#');
    let target = pathPart ? posix.normalize(posix.join(posix.dirname(page), pathPart)) : page;
    if (target === '.' || target.endsWith('/')) target = posix.join(target, 'index.html').replace(/^\.\//, '');
    if (!existsSync(join(output, target))) {
      problems.push(`${page}: ${attribute}="${value}" points to a missing file`);
      continue;
    }
    if (!fragment) continue;
    if (target === 'icons.svg') {
      if (!iconIds.has(fragment)) problems.push(`${page}: unknown icon #${fragment}`);
    } else if (target.endsWith('.html') && !idsIn(target).has(fragment)) {
      problems.push(`${page}: ${value} has no matching id`);
    }
  }
  for (const [, version] of html.matchAll(/rubric v(\d+)/g)) {
    if (version !== rubricVersion) problems.push(`${page}: mentions rubric v${version}, but the rubric is v${rubricVersion}`);
  }
}
for (const { icon } of (await import('../site/rubric.js')).categories) {
  if (!iconIds.has(icon)) problems.push(`rubric.js: unknown icon ${icon}`);
}
assert.deepEqual(problems, [], `Broken references:\n${problems.join('\n')}`);

// 4. The badge catalog for this rubric version is complete and carries the right review markers.
const values = scoreLevels.map(({ value }) => value);
const filenames = [];
for (const design of values) {
  for (const implementation of values) {
    for (const testing of values) {
      for (const docs of values) filenames.push(badgeFilename([design, implementation, testing, docs]));
    }
  }
}
filenames.sort();

const markers = { full: '#237342', partial: '#9a6700', none: '#a8322d', unknown: '#a8322d' };
for (const { folder } of reviewStatuses) {
  const directory = join(output, `badges/v${rubricVersion}`, folder);
  const items = readdirSync(directory, { withFileTypes: true });
  assert.ok(items.every(item => item.isFile()), `Unexpected entry in ${directory}`);
  assert.deepEqual(items.map(item => item.name).sort(), filenames, `Badge catalog mismatch in ${folder}`);
  for (const { name } of items) {
    const svg = readFileSync(join(directory, name), 'utf8');
    assert.ok(!/&(?!(amp|lt|gt|quot|apos|#\d+);)/.test(svg), `Unescaped & in ${folder}/${name}: the SVG is malformed XML`);
  }
  const sample = readFileSync(join(directory, badgeFilename(['0', '4', '–', '?'])), 'utf8');
  assert.match(sample, /^<svg\b[^>]+height="20"/);
  assert.ok(sample.includes(`fill="${markers[folder]}"`), `Missing review marker in ${folder}`);
}

// 5. Every badge's page link points at the version page and reads back as the same badge; broken links show no badge.
assert.ok(pages.includes(`v${rubricVersion}/index.html`), `The rubric v${rubricVersion} page is missing from site-files.mjs`);
for (const review of reviewStatuses) {
  for (const design of values) {
    for (const implementation of values) {
      for (const testing of values) {
        for (const docs of values) {
          const scores = [design, implementation, testing, docs];
          const [path, search] = badgePagePath(scores, review).split('?');
          assert.equal(path, `v${rubricVersion}/`);
          assert.deepEqual(parseBadgeParameters(search), { scores, review }, `Badge page link does not round-trip: ${search}`);
        }
      }
    }
  }
}
for (const search of ['', 'scores=D3-I4-T4&review=full', 'scores=D3-I4-T4-C9&review=full', 'scores=I4-D3-T4-C2&review=full', 'scores=D3-I4-T4-C2&review=maybe', 'scores=D3-I4-T4-C2-X1&review=full']) {
  assert.equal(parseBadgeParameters(search), null, `Invalid badge parameters accepted: ${search}`);
}

console.log(`Verified ${assets.length} site assets, their links, and ${filenames.length * reviewStatuses.length} badge SVGs and their page links for rubric v${rubricVersion}.`);
