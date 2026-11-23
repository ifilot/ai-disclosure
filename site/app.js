import {
  badgeAlt, badgeFilename, badgePath, categories, contributionQuestions, humanReviewQuestions, reviewContext,
  reviewStatuses, rubricVersion,
} from './rubric.js';

const form = document.getElementById('assessment');
const fields = document.getElementById('category-fields');
const scope = document.getElementById('scope');
const disclosureParts = [
  ['ai-contributed', 'What AI contributed.'],
  ['people-did', 'What people did.'],
  ['checked', 'How it was checked.'],
  ['worth-noting', 'Worth noting.'],
].map(([id, label]) => ({ input: document.getElementById(id), label }));
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

function showDetail(element, guidance) {
  element.textContent = guidance ?? '';
  element.hidden = !guidance;
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
  return { node, next, setQuestions, update, get value() { return outcome?.result; } };
}

const categorySteps = categories.map(category => createStep(category, fields, contributionQuestions(category)));
const reviewStep = createStep({
  code: 'review', title: 'Human review', icon: 'user',
  prompt: 'What did a person check and approve?',
  evidence: 'Any contribution level can have Full human review. Authors may review their own work, as long as they deliberately check it against relevant criteria.',
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

let currentContext = null;

// Published Markdown needs absolute URLs; a local preview keeps them relative.
function publicUrl(path) {
  const url = new URL(path, document.baseURI);
  const isLocal = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
  return isLocal ? path : url.href;
}

// Text fields are the author's own Markdown, so they are passed through rather than escaped.
function disclosureMarkdown(badge) {
  const blocks = [];
  if (scope.value.trim()) blocks.push(`**Scope:** ${scope.value.trim()}`);
  for (const { input, label } of disclosureParts) {
    if (input.value.trim()) blocks.push(`**${label}** ${input.value.trim()}`);
  }
  return blocks.length ? ['## AI disclosure', badge, ...blocks].join('\n\n') : badge;
}

function refresh() {
  const answers = categorySteps.map(step => step.value);
  const context = answers.every(Boolean) ? reviewContext(answers) : null;
  if (currentContext !== context) {
    currentContext = context;
    reviewStep.setQuestions(context ? humanReviewQuestions(context) : []);
  }
  const selectedReview = reviews.get(reviewStep.value);

  const count = answers.filter(Boolean).length + Number(Boolean(selectedReview));
  const total = steps.length;
  const complete = count === total;
  const scores = answers.map(score => score ?? '?');
  const review = selectedReview ?? reviews.get('unknown');
  const path = badgePath(scores, review);
  const altText = badgeAlt(scores, review);

  if (image.getAttribute('src') !== path) image.setAttribute('src', path);
  image.alt = complete ? altText : `Draft preview. ${altText}`;
  progress.textContent = `${count} of ${total} assessed`;
  const nextMessage = complete ? 'Your badge is ready to copy or download.' : 'Complete the four categories and human review to export your badge.';
  if (message.textContent !== nextMessage) message.textContent = nextMessage;
  copyButton.disabled = !complete;
  download.classList.toggle('disabled', !complete);
  download.setAttribute('aria-disabled', String(!complete));
  markdownDetails.hidden = !complete;
  copyFeedback.textContent = '';

  if (complete) {
    download.href = path;
    download.download = `colophon-v${rubricVersion}-${badgeFilename(scores).slice(0, -4)}-${review.folder}.svg`;
    const badge = `[![${altText}](<${publicUrl(path)}>)](<${publicUrl(`v${rubricVersion}/`)}>)`;
    markdown.value = disclosureMarkdown(badge);
  } else {
    download.removeAttribute('href');
    download.removeAttribute('download');
    markdown.value = '';
  }
}

form.addEventListener('submit', event => event.preventDefault());
form.addEventListener('input', event => {
  if (event.target.matches('input[type="text"], textarea')) refresh();
});
window.addEventListener('pageshow', () => {
  steps.forEach(step => step.update());
  refresh();
});

copyButton.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(markdown.value);
    copyFeedback.textContent = 'Markdown copied.';
  } catch {
    markdownDetails.open = true;
    markdown.focus();
    markdown.select();
    copyFeedback.textContent = 'Markdown selected. Use your keyboard’s copy command.';
  }
});

document.getElementById('js-loading').remove();
refresh();
