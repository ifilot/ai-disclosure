// Explains one badge on its rubric version's page, from the badge named in the link's parameters,
// and renders that page's overview of the standard from the same rubric data as the rest of the site.
import { badgeAlt, badgePath, categories, parseBadgeParameters, reviewContext, reviewStatuses, scoreLevels } from './rubric.js';

// Resolved against this script, so the page works at any depth and under a project subpath.
const siteUrl = path => new URL(path, import.meta.url).href;
const levels = new Map(scoreLevels.map(level => [level.value, level]));
const scaleValues = ['0', '1', '2', '3', '4'];

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function icon(name) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'icon');
  svg.setAttribute('aria-hidden', 'true');
  const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
  use.setAttribute('href', siteUrl(`./icons.svg#${name}`));
  svg.append(use);
  return svg;
}

function definitionRow(term, detail) {
  const row = element('div');
  row.append(element('dt', '', term), element('dd', '', detail));
  return row;
}

const scoreName = value => `${value} · ${levels.get(value).label}`;
const reviewName = review => (review.folder === 'unknown' ? '? · Unknown' : review.label);

// The overview: scale, categories, and review statuses.
document.getElementById('scale-list').append(
  ...scoreLevels.map(({ value, guidance }) => definitionRow(scoreName(value), guidance)),
);
document.getElementById('category-overview').append(...categories.map(({ code, title, icon: name, prompt }) => {
  const row = element('div', `category-${code}`);
  const term = element('dt', 'category-term');
  const mark = element('span', 'category-icon');
  mark.append(icon(name));
  term.append(mark, title);
  row.append(term, element('dd', '', prompt));
  return row;
}));
document.getElementById('review-list').append(
  ...reviewStatuses.map(review => definitionRow(reviewName(review), review.guidance)),
);

// Plain-language summary, one sentence per score that occurs, from the most AI involvement down.
const nouns = {
  D: 'the design',
  I: 'the implementation',
  T: 'the tests & checks',
  C: 'the comments & docs',
};
const sentences = {
  4: list => `AI produced ${list}, and its work was used largely as delivered.`,
  3: list => `AI drafted ${list}, and a person determined the result through material specifications or changes.`,
  2: list => `AI contributed discrete pieces to ${list}, which people otherwise produced.`,
  1: list => `AI was consulted on ${list}, but people produced the work.`,
  0: list => `No AI was used for ${list}.`,
  '?': list => `How much AI contributed to ${list} is unknown.`,
  '–': list => `The change had no work in ${list}.`,
};
const summaryOrder = ['4', '3', '2', '1', '0', '?', '–'];

function joinList(items) {
  if (items.length < 3) return items.join(' and ');
  return `${items.slice(0, -1).join(', ')}, and ${items.at(-1)}`;
}

function summarize(scores) {
  return summaryOrder.flatMap(value => {
    const named = categories.filter((_, index) => scores[index] === value).map(({ code }) => nouns[code]);
    return named.length ? [sentences[value](joinList(named))] : [];
  });
}

function reviewSentence(scores, review) {
  const context = reviewContext(scores);
  // Mirrors humanReviewQuestions: without material AI work, the review is of the final change itself.
  const finalChangeOnly = context === 'human' || context === 'advice';
  if (review.folder === 'full' && finalChangeOnly) return 'A person deliberately checked the final change and approved it.';
  if (review.folder === 'full' && context === 'unknown') return 'A person reviewed all work in scope, including work of unknown origin, and approved the final result.';
  if (review.folder === 'partial' && finalChangeOnly) return 'A person checked part of the final change, or final approval is incomplete.';
  return review.guidance;
}

const flags = {
  full: { icon: 'check', note: 'Green check: the review was complete.' },
  partial: { icon: 'exclamation', note: 'Amber exclamation mark: the review was incomplete. Check what was left out before relying on the change.' },
  none: { icon: 'xmark', note: 'Red cross: nobody checked this work. Treat it as unreviewed, whoever wrote it.' },
  unknown: { icon: 'xmark', note: 'Red cross: the review was not declared, so treat this work as unreviewed.' },
};

function scaleStrip(code, value) {
  const strip = element('ol', 'score-scale');
  strip.setAttribute('aria-hidden', 'true');
  for (const step of scaleValues) {
    const item = element('li', step === value ? `cell-${code} is-current` : '');
    item.append(element('span', 'score-scale-value', step), element('span', 'score-scale-label', levels.get(step).label));
    strip.append(item);
  }
  if (!scaleValues.includes(value)) strip.classList.add('is-off-scale');
  return strip;
}

function categoryCard(category, value) {
  const level = levels.get(value);
  const card = element('article', `card category-card reading-card category-${category.code}`);

  const header = element('div', 'category-card-header');
  const mark = element('span', 'category-icon');
  mark.append(icon(category.icon));
  const heading = element('div', 'reading-card-title');
  heading.append(element('h3', '', category.title), element('p', 'category-prompt', category.prompt));
  const score = element('span', `reading-score cell-${category.code}`, scoreName(value));
  header.append(mark, heading, score);

  const meaning = element('p', 'category-detail');
  meaning.append(element('strong', '', 'What it means '), level.guidance);
  card.append(header, scaleStrip(category.code, value), meaning);

  const example = category.examples[value];
  if (example) {
    const detail = element('p', 'category-detail');
    detail.append(element('strong', '', 'For example '), example);
    card.append(detail);
  }
  return card;
}

function reviewCard(scores, review) {
  const card = document.getElementById('reading-review');
  const flag = flags[review.folder];
  const header = element('div', 'category-card-header');
  const mark = element('span', `flag reading-flag cell-${review.folder === 'unknown' ? 'none' : review.folder}`);
  mark.append(icon(flag.icon));
  const heading = element('div', 'reading-card-title');
  heading.append(element('h3', '', 'Human review'), element('p', 'category-prompt', 'What a person checked and approved.'));
  header.append(mark, heading, element('span', 'reading-score cell-brand', reviewName(review)));

  const meaning = element('p', 'category-detail');
  meaning.append(element('strong', '', 'What it means '), reviewSentence(scores, review));
  const note = element('p', 'category-detail');
  note.append(element('strong', '', 'The flag '), flag.note);
  card.append(header, meaning, note);
}

function showBadge({ scores, review }) {
  const alt = badgeAlt(scores, review);
  const image = document.getElementById('reading-badge');
  image.src = siteUrl(`./${badgePath(scores, review)}`);
  image.alt = alt;

  document.getElementById('page-heading').textContent = 'What this colophon says';
  document.getElementById('page-lead').textContent = 'This badge records how AI contributed to one change, such as a pull request or a release, and whether a person checked the result.';
  document.title = `${categories.map(({ code }, index) => code + scores[index]).join(' ')} · ${reviewName(review)} review · Colophon rubric v1`;

  const summary = document.getElementById('reading-summary');
  summary.append(...[...summarize(scores), reviewSentence(scores, review)].map(sentence => element('p', '', sentence)));

  document.getElementById('reading-categories').append(
    ...categories.map((category, index) => categoryCard(category, scores[index])),
  );
  reviewCard(scores, review);
  document.getElementById('badge-reading').hidden = false;
  document.getElementById('standard-heading').textContent = 'How to read any colophon';
}

if (location.search) {
  const badge = parseBadgeParameters(location.search);
  if (badge) showBadge(badge);
  else document.getElementById('invalid-badge').hidden = false;
}
