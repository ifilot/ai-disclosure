import { mkdirSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  faCheck,
  faCode,
  faExclamation,
  faFileLines,
  faFlask,
  faPenRuler,
  faRobot,
  faUser,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { makeBadge } from 'badge-maker';
import { badgeAlt, badgeFilename, categories, reviewStatuses, rubricVersion, scoreLevels } from '../site/rubric.js';

// Dependencies are pinned to exact versions, so the project's own package.json names what rendered the badges.
const { dependencies } = createRequire(import.meta.url)('../package.json');
const fontAwesomeVersion = dependencies['@fortawesome/free-solid-svg-icons'];
const badgeMakerVersion = dependencies['badge-maker'];

const height = 20;
const categoryWidth = 34;
const gray = '#555555';
const scoreValues = scoreLevels.map(({ value }) => value);
const categoryStyles = [
  { fill: '#82495e', icon: faPenRuler },
  { fill: '#704d7a', icon: faCode },
  { fill: '#514f84', icon: faFlask },
  { fill: '#356486', icon: faFileLines },
];

// Every badge ends with a review marker. Missing or undeclared review is flagged the same way, so `?` is no escape from it.
const reviewMarkers = {
  full: { fill: '#237342', icon: faCheck },
  partial: { fill: '#9a6700', icon: faExclamation },
  none: { fill: '#a8322d', icon: faXmark },
  unknown: { fill: '#a8322d', icon: faXmark },
};

// Badge text such as "Tests & checks" must be escaped, or the SVG is malformed XML and browsers refuse to render it.
function escapeXml(text) {
  return text.replace(/[&<>"']/g, character => `&#${character.charCodeAt(0)};`);
}

function renderIcon(definition, center, size) {
  const [width, height, , , pathData] = definition.icon;
  const scale = size / Math.max(width, height);
  const x = center - width * scale / 2;
  const y = 10 - height * scale / 2;
  const paths = [pathData].flat().map(d => `<path d="${d}"/>`).join('');
  return `<g fill="#fff" transform="translate(${x} ${y}) scale(${scale})">${paths}</g>`;
}

// Use badge-maker's flat-style font, glyph widths, and shadow for every label.
function renderText(message) {
  const svg = makeBadge({ message, color: gray, style: 'flat' });
  const bounds = svg.match(/^<svg\b[^>]* width="(\d+)"/);
  const foreground = svg.match(/<g (fill="#fff" text-anchor="middle"[^>]*)>(<text.*)<\/g><\/svg>$/);
  if (!bounds || !foreground) {
    throw new Error(`Unexpected badge-maker output for ${message}`);
  }
  const [, attributes, content] = foreground;
  return {
    width: Number(bounds[1]),
    attributes,
    at: center => content.replaceAll(/\bx="\d+"/g, `x="${center * 10}"`),
  };
}

const brandText = renderText('colophon');
const brandWidth = 25 + brandText.width;
const reviewOffset = brandWidth + categories.length * categoryWidth;
const scoreText = new Map(scoreValues.map(score => [score, renderText(score)]));
const labels = new Map(reviewStatuses.map(status => [status.label, renderText(status.label)]));
const robot = renderIcon(faRobot, 16, 12);
const scoreIcons = categoryStyles.map(({ icon }, index) => renderIcon(icon, brandWidth + index * categoryWidth + 11, 11));
const person = renderIcon(faUser, reviewOffset + 12, 10);

function renderBadge(scores, review) {
  const text = labels.get(review.label);
  const reviewWidth = text.width + 18;
  const reviewEnd = reviewOffset + reviewWidth;
  const marker = reviewMarkers[review.folder];
  const width = reviewEnd + height;
  const title = escapeXml(badgeAlt(scores, review));

  const cells = [
    { start: 0, width: brandWidth, fill: gray },
    ...categoryStyles.map(({ fill }, index) => ({ start: brandWidth + index * categoryWidth, width: categoryWidth, fill })),
    { start: reviewOffset, width: reviewWidth, fill: gray },
    { start: reviewEnd, width: height, fill: marker.fill },
  ];

  const backgrounds = cells.map(cell => `    <rect x="${cell.start}" width="${cell.width}" height="${height}" fill="${cell.fill}"/>`);
  const dividers = cells.slice(1).map(({ start }) => `    <path d="M${start + 0.5} 0v${height}" stroke="#000" stroke-opacity=".22"/>`);
  const categoryLabels = scores.map((score, index) => scoreText.get(score).at(brandWidth + index * categoryWidth + 23));
  const visibleLabels = [brandText.at(22 + brandText.width / 2), ...categoryLabels, text.at(reviewOffset + 18 + text.width / 2)];
  const icons = [robot, ...scoreIcons, person, renderIcon(marker.icon, reviewEnd + 10, 11)];

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" role="img" aria-label="${title}">
  <title>${title}</title>
  <!-- Icons by Font Awesome Free ${fontAwesomeVersion} (https://fontawesome.com), CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/). Recolored and scaled. -->
  <!-- Text rendered with badge-maker ${badgeMakerVersion}, style flat. -->
  <linearGradient id="s" x2="0" y2="100%"><stop offset="0" stop-color="#bbb" stop-opacity=".1"/><stop offset="1" stop-opacity=".1"/></linearGradient>
  <clipPath id="r"><rect width="${width}" height="${height}" rx="3" fill="#fff"/></clipPath>
  <g clip-path="url(#r)" aria-hidden="true">
${backgrounds.join('\n')}
    <rect width="${width}" height="${height}" fill="url(#s)"/>
${dividers.join('\n')}
  </g>
  <g aria-hidden="true" ${brandText.attributes}>
    ${visibleLabels.join('\n    ')}
  </g>
  <g aria-hidden="true">
    ${icons.join('\n    ')}
  </g>
</svg>
`;
}

// The catalog lives under its rubric version, so badges published for one version never change meaning.
const root = process.argv[2] ? resolve(process.argv[2]) : fileURLToPath(new URL('../badges/', import.meta.url));
const output = join(root, `v${rubricVersion}`);
let total = 0;
for (const review of reviewStatuses) {
  const directory = join(output, review.folder);
  mkdirSync(directory, { recursive: true });
  for (const design of scoreValues) {
    for (const implementation of scoreValues) {
      for (const testing of scoreValues) {
        for (const comments of scoreValues) {
          const scores = [design, implementation, testing, comments];
          writeFileSync(join(directory, badgeFilename(scores)), renderBadge(scores, review));
          total++;
        }
      }
    }
  }
}

console.log(`Generated ${total.toLocaleString('en-US')} badge SVGs for rubric v${rubricVersion}.`);
