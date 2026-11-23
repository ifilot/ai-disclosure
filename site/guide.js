// Renders the scoring guide from the same rubric data the self-assessment uses.
import { categories, reviewStatuses, scoreLevels } from './rubric.js';

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function definitionRow(term, detail) {
  const row = element('div');
  row.append(element('dt', '', term), element('dd', '', detail));
  return row;
}

function icon(name) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'icon');
  svg.setAttribute('aria-hidden', 'true');
  const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
  use.setAttribute('href', `./icons.svg#${name}`);
  svg.append(use);
  return svg;
}

document.getElementById('scale-list').append(
  ...scoreLevels.map(({ value, label, guidance }) => definitionRow(`${value} · ${label}`, guidance)),
);

document.getElementById('review-list').append(
  ...reviewStatuses.map(({ folder, label, guidance }) => definitionRow(folder === 'unknown' ? '? · Unknown' : label, guidance)),
);

document.getElementById('category-list').append(...categories.map(category => {
  const card = element('article', `card category-card category-${category.code}`);
  card.id = `category-${category.code}`;

  const header = element('div', 'category-card-header');
  const badge = element('span', 'category-icon');
  badge.append(icon(category.icon));
  const heading = element('div');
  heading.append(element('h3', '', category.title), element('p', 'category-prompt', category.prompt));
  header.append(badge, heading);

  const ask = element('p', 'category-detail');
  ask.append(element('strong', '', 'Ask yourself '), category.question);
  const look = element('p', 'category-detail');
  look.append(element('strong', '', 'What to look at '), category.evidence);

  const examples = element('dl', 'level-examples');
  examples.setAttribute('aria-label', `${category.title} examples by score`);
  for (const { value, label, guidance } of scoreLevels) {
    const example = category.examples[value] ?? guidance;
    const row = element('div');
    row.append(element('dt', 'level-chip', `${value} · ${label}`), element('dd', '', example));
    examples.append(row);
  }

  card.append(header, ask, look, examples);
  return card;
}));
