import {
  badgeAlt, badgeFilename, categories, contributionQuestions, humanReviewQuestions, reviewStatuses, scoreLevels,
} from './rubric.js';

const form = document.getElementById('assessment');
const fields = document.getElementById('category-fields');
const scope = document.getElementById('scope');
const notes = document.getElementById('notes');
const guide = document.getElementById('scoring-guide');
const reviews = new Map(reviewStatuses.map(review => [review.folder, review]));

const image = document.getElementById('badge-image');
const progress = document.getElementById('answer-count');
const message = document.getElementById('preview-message');
const copyButton = document.getElementById('copy-markdown');
const download = document.getElementById('download-svg');
const markdown = document.getElementById('markdown');
const markdownDetails = document.getElementById('markdown-details');
const copyFeedback = document.getElementById('copy-feedback');

function cloneTemplate(id) {
  return document.getElementById(id).content.firstElementChild.cloneNode(true);
}

function createQuestion({ question, guidance, choices }, name) {
  const node = cloneTemplate('question-template');
  node.querySelector('legend').textContent = question;
  showDetail(node.querySelector('.question-guidance'), guidance);
  const options = choices.map((choice, index) => {
    const label = cloneTemplate('choice-template');
    const input = label.querySelector('input');
    input.name = name;
    input.value = choice.result ?? 'continue';
    const title = label.querySelector('.choice-title');
    title.id = `${name}-${index}-title`;
    title.textContent = choice.title;
    input.setAttribute('aria-labelledby', title.id);
    const badge = label.querySelector('.choice-result');
    badge.id = `${name}-${index}-result`;
    showDetail(badge, choice.badge);
    const detail = label.querySelector('.choice-guidance');
    detail.id = `${name}-${index}-guidance`;
    showDetail(detail, choice.guidance);
    const example = label.querySelector('.choice-example');
    example.id = `${name}-${index}-example`;
    example.hidden = !choice.example;
    example.querySelector('span').textContent = choice.example ?? '';
    const descriptions = [badge, detail, example].filter(element => !element.hidden).map(element => element.id);
    if (descriptions.length) input.setAttribute('aria-describedby', descriptions.join(' '));
    node.querySelector('.question-choices').append(label);
    return { input, choice };
  });
  return { node, options };
}

function createStep({ code, title, icon, prompt, evidence }, container, questions) {
  const node = cloneTemplate('assessment-template');
  node.id = `assessment-${code}`;
  node.classList.add(`category-${code}`);
  node.querySelector('use').setAttribute('href', `./icons.svg#${icon}`);
  node.querySelector('.step-title').textContent = title;
  node.querySelector('.step-description').textContent = prompt;
  node.querySelector('.step-evidence').textContent = evidence;
  const list = node.querySelector('.step-questions');
  const result = node.querySelector('.step-result');
  const actions = node.querySelector('.step-actions');
  const outcomeMessage = node.querySelector('.step-outcome');
  const next = node.querySelector('.next-step');
  const waitMessage = node.querySelector('.review-wait');
  let entries = [];
  let outcome;

  function update() {
    let show = true;
    outcome = undefined;
    for (const { node: question, options } of entries) {
      question.hidden = !show;
      if (!show) {
        for (const { input } of options) input.checked = false;
        continue;
      }
      const chosen = options.find(({ input }) => input.checked)?.choice;
      if (chosen?.result) outcome = chosen;
      show = Boolean(chosen && !chosen.result);
    }
    result.textContent = outcome?.badge ?? 'Not assessed';
    result.classList.toggle('assessed', Boolean(outcome));
    actions.hidden = !outcome;
    outcomeMessage.textContent = outcome ? `Result · ${outcome.badge}` : '';
  }

  function setQuestions(questions) {
    entries = questions.map((question, index) => createQuestion(question, `${code}-question-${index}`));
    list.replaceChildren(...entries.map(({ node }) => node));
    waitMessage.hidden = entries.length !== 0;
    update();
  }

  node.addEventListener('change', () => {
    update();
    refresh();
  });
  setQuestions(questions);
  container.append(node);
  return { node, next, setQuestions, get value() { return outcome?.result; } };
}

const categorySteps = categories.map(category => createStep(category, fields, contributionQuestions(category)));
const reviewStep = createStep({
  code: 'review', title: 'Review status', icon: 'user',
  prompt: 'What did a person check and approve?',
  evidence: 'Any contribution level can have full human review. An author can review their own work when they deliberately check it against relevant criteria.',
}, document.getElementById('review-field'), []);
const steps = [...categorySteps, reviewStep];
categorySteps[0].node.open = true;

steps.forEach(({ next }, index) => {
  const following = steps[index + 1];
  next.textContent = following ? (following === reviewStep ? 'Continue to human review' : 'Next category') : 'View badge';
  next.addEventListener('click', () => {
    if (following) {
      following.node.open = true;
      following.node.querySelector('summary').focus();
    } else {
      document.getElementById('preview-heading').focus();
    }
  });
});

let reviewContext = null;

const scoreGuide = document.getElementById('score-guide');
for (const { value, label, guidance } of scoreLevels) {
  const row = document.createElement('div');
  const heading = document.createElement('dt');
  const detail = document.createElement('dd');
  heading.textContent = `${value} · ${label}`;
  detail.textContent = guidance;
  row.append(heading, detail);
  scoreGuide.append(row);
}

function showDetail(element, guidance) {
  element.textContent = guidance ?? '';
  element.hidden = !guidance;
}

function markdownText(value) {
  return value.trim().replace(/[\\`*_{}\[\]()<>#!|~]/g, '\\$&');
}

function badgeUrl(path) {
  const url = new URL(path, document.baseURI);
  const isLocal = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
  return isLocal || url.protocol === 'file:' ? path : url.href;
}

function refresh() {
  const answers = categorySteps.map(step => step.value);
  let context = null;
  if (answers.every(Boolean)) {
    if (answers.includes('?')) context = 'unknown';
    else if (answers.every(score => score === '0')) context = 'human';
    else context = answers.every(score => score === '0' || score === '1') ? 'advice' : 'ai';
  }
  if (reviewContext !== context) {
    reviewContext = context;
    reviewStep.setQuestions(context ? humanReviewQuestions(context) : []);
  }
  const selectedReview = reviews.get(reviewStep.value);

  const count = answers.filter(Boolean).length + Number(Boolean(selectedReview));
  const total = steps.length;
  const complete = count === total;
  const scores = answers.map(score => score ?? '?');
  const review = selectedReview ?? reviews.get('unknown');
  const filename = badgeFilename(scores);
  const path = `badges/${review.folder}/${filename}`;
  const altText = badgeAlt(scores, review);

  if (image.getAttribute('src') !== path) image.setAttribute('src', path);
  image.alt = complete ? altText : `Draft preview. ${altText}`;
  progress.textContent = `${count} of ${total} assessed`;
  const nextMessage = complete ? 'Your badge is ready to download or embed.' : 'Complete the four categories and human review to export your badge.';
  if (message.textContent !== nextMessage) message.textContent = nextMessage;
  copyButton.disabled = !complete;
  download.classList.toggle('disabled', !complete);
  download.setAttribute('aria-disabled', String(!complete));
  markdownDetails.hidden = !complete;
  showDetail(copyFeedback);

  if (complete) {
    download.href = path;
    download.download = `AID-${filename.slice(0, -4)}-${review.folder}.svg`;
    const sections = [`![${altText}](<${badgeUrl(path)}>)`];
    if (scope.value.trim()) sections.push(`**Scope** · ${markdownText(scope.value)}`);
    if (notes.value.trim()) sections.push(`**Disclosure notes**\n\n${markdownText(notes.value)}`);
    markdown.value = sections.join('\n\n');
  } else {
    download.removeAttribute('href');
    download.removeAttribute('download');
    markdown.value = '';
  }
}

form.addEventListener('submit', event => event.preventDefault());
scope.addEventListener('input', refresh);
notes.addEventListener('input', refresh);
window.addEventListener('pageshow', refresh);

document.getElementById('guide-link').addEventListener('click', () => { guide.open = true; });
if (location.hash === '#scoring-guide') guide.open = true;

copyButton.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(markdown.value);
    showDetail(copyFeedback, 'Markdown copied.');
  } catch {
    markdownDetails.open = true;
    markdown.focus();
    markdown.select();
    showDetail(copyFeedback, 'Markdown selected. Use your keyboard’s copy command.');
  }
});

refresh();
