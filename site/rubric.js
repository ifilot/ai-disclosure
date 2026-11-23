// Colophon rubric. Changing what a score means requires a new rubricVersion: published badges link to their version.
export const rubricVersion = '1';

export const categories = [
  {
    code: 'D', name: 'Design', title: 'Design', icon: 'pen-ruler',
    prompt: 'Requirements, architecture, algorithms, and implementation plans.',
    question: 'Did you use AI to help decide what to build or how to build it?',
    evidence: 'Look at the issue, design notes, diagrams, and planning conversations. Assess the decisions and plans that shaped this change. Specifications you wrote yourself count as human work.',
    examples: [
      'You chose the API contract and architecture without AI.',
      'AI suggested architectural alternatives. You evaluated them and wrote the plan yourself.',
      'You wrote a detailed specification. AI filled in the error-handling section, which you kept.',
      'AI drafted a synchronous design. You specified a durable queue and a rule to prevent duplicate jobs. AI then revised the design around those decisions.',
      'AI drafted a synchronous design. You asked it to handle retries and duplicate jobs. AI chose a durable queue and a deduplication rule, and you accepted them.',
    ],
  },
  {
    code: 'I', name: 'Implementation', title: 'Implementation', icon: 'code',
    prompt: 'Production code, scripts, configuration, and refactors.',
    question: 'Did you use AI while writing or changing code or configuration?',
    evidence: 'Look at the final diff, accepted editor completions, and agent edits. Assess production code and configuration here. Tests and documentation have their own categories.',
    examples: [
      'You wrote the code and configuration without AI.',
      'AI explained an unfamiliar API. You wrote the code yourself.',
      'AI wrote a helper function, or editor completions filled in lines of code you were writing.',
      'AI drafted the feature. You rewrote its main logic and changed how it handles failures.',
      'An agent implemented the feature from your specification. You reviewed the changes and kept them largely as delivered.',
    ],
  },
  {
    code: 'T', name: 'Tests & checks', title: 'Tests & checks', icon: 'flask',
    prompt: 'Tests, fixtures, AI code review, and diagnosis of failures or results.',
    question: 'Did you use AI to write tests, review changes, or investigate failures?',
    evidence: 'Look at test diffs, fixtures, AI review comments, and failure analysis. AI code review belongs here. Human review is assessed separately at the end.',
    examples: [
      'You wrote the tests and investigated failures without AI.',
      'AI suggested edge cases or diagnosed a failing test. You wrote the tests and the fix yourself.',
      'AI wrote a fixture and two edge-case tests for a suite you otherwise wrote.',
      'AI drafted the suite. You substantially changed the coverage and rewrote the assertions.',
      'AI wrote the test suite, or an AI reviewer’s findings were applied largely as delivered.',
    ],
  },
  {
    code: 'C', name: 'Comments & docs', title: 'Comments & docs', icon: 'file-lines',
    prompt: 'Inline comments, docstrings, READMEs, commit messages, and other documentation.',
    question: 'Did you use AI while writing comments, docstrings, or documentation?',
    evidence: 'Look at the comments and documentation in the final diff, including docstrings generated along with code, commit messages, and the pull request description.',
    examples: [
      'You wrote the comments and docs without AI.',
      'AI suggested an outline. You wrote the documentation yourself.',
      'AI wrote a few docstrings. You wrote the rest of the documentation.',
      'AI drafted the guide. You reorganized it and rewrote the explanations and examples.',
      'AI wrote the docstrings or guide. You checked them against the code and kept them largely as delivered.',
    ],
  },
];

export const scoreLevels = [
  { value: '0', label: 'None', guidance: 'You can confirm that no AI was used in this category.' },
  { value: '1', label: 'Consulted', guidance: 'AI gave advice or ideas, or drafts you discarded. A person produced the work.' },
  { value: '2', label: 'Contributed', guidance: 'AI produced discrete pieces of a largely human-produced result.' },
  { value: '3', label: 'Drafted', guidance: 'AI produced a substantial part of the result, but a person determined it through material specifications or changes.' },
  { value: '4', label: 'Delegated', guidance: 'AI produced a substantial result that was used largely as delivered, including after AI-led revisions.' },
  { value: '?', label: 'Unknown', guidance: 'You cannot establish how much AI was used in this category.' },
  { value: '–', label: 'Not applicable', guidance: 'The scope has no work in this category, for example a change without documentation.' },
];

export const reviewStatuses = [
  { folder: 'full', label: 'Full', description: 'Full', guidance: 'A person checked every material AI contribution against relevant criteria and approved the final result.' },
  { folder: 'partial', label: 'Partial', description: 'Partial', guidance: 'A person checked at least one material AI contribution, but review coverage or final approval is incomplete.' },
  { folder: 'none', label: 'None', description: 'None', guidance: 'No human review took place.' },
  { folder: 'unknown', label: '?', description: 'Unknown', guidance: 'Whether a person reviewed the work, or how much of it, is unknown or undeclared.' },
];

export function contributionQuestions(category) {
  const outcome = (value, title, guidance) => {
    const level = scoreLevels.find(item => item.value === value);
    return { title, result: value, badge: `${value} · ${level.label}`, guidance: guidance ?? level.guidance, example: category.examples[value] };
  };
  // The title says it all; repeating the scale's guidance under every question only lengthens the form.
  const unknown = outcome('?', 'I cannot establish this', '');
  const questions = [
    {
      question: category.question,
      choices: [
        outcome('0', 'No, and I can confirm AI was not used'),
        { title: 'Yes, AI was used', guidance: 'Count every AI use you know of: chat advice, editor completions, agents, and discarded experiments.' },
        outcome('–', 'This change has no work in this category'),
        unknown,
      ],
    },
    {
      question: 'What did AI contribute to the final result?',
      guidance: 'Judge by the role in this scope. If parts of the scope differ, score the highest level that applies to a material part, and name that part in your disclosure.',
      choices: [
        outcome('1', 'Advice, ideas, or drafts that were discarded'),
        outcome('2', 'Discrete pieces of otherwise human-produced work',
          'AI produced discrete pieces, such as a helper function or completions inside work a person was writing. A small piece you kept unchanged is still level 2.'),
        { title: 'A substantial part of the result', guidance: 'AI output makes up a substantial part of the work in this category.' },
        unknown,
      ],
    },
  ];

  if (category.code === 'D') {
    const humanDecision = outcome('3', 'A person supplied a material design change that was adopted',
      'The final design includes a concrete choice a person supplied, such as a change to the data model, service boundaries, or failure behavior. AI may still have written the revised design.');
    const aiDecision = outcome('4', 'AI supplied the substantive design that was adopted',
      'Choose this when the substantive design came from AI and was used largely as delivered. A person may still have flagged issues, set goals, asked for iterations, or picked among AI proposals.');
    return [
      ...questions,
      {
        question: 'What did your input add to the final design?',
        guidance: 'Compare your specification and feedback with the final design. Decide by the role your input played in what was adopted, whether you gave it before or after the first draft.',
        choices: [
          humanDecision,
          aiDecision,
          { title: 'Both contributed, or I’m unsure how material my input was', guidance: 'Answer one more question about the final design.' },
          unknown,
        ],
      },
      {
        question: 'Can you point to a material change in the final design that you supplied?',
        guidance: 'Name the change, find where it appears in the final design, and say why it mattered. Picking an AI-proposed solution as delivered counts as approval, not as a design change.',
        choices: [
          { ...humanDecision, title: 'Yes, I can point to a design decision a person supplied' },
          { ...aiDecision, title: 'No, the substantive choices in the final design came from AI' },
          unknown,
        ],
      },
    ];
  }

  return [
    ...questions,
    {
      question: 'Who determined the final result?',
      guidance: 'Look for human decisions that changed the approach, behavior, test coverage, or meaning, whether given as a specification before the draft or as changes after it. A person may have AI apply those changes. Flagging issues, asking for another iteration, and approving the result are still level 4 when AI devised the substance.',
      choices: [
        outcome('3', 'A person did, through material specifications or changes'),
        outcome('4', 'AI did, and its version was used largely as delivered'),
        unknown,
      ],
    },
  ];
}

export function reviewContext(scores) {
  if (scores.includes('?')) return 'unknown';
  if (scores.every(score => score === '0' || score === '–')) return 'human';
  if (scores.every(score => score === '0' || score === '1' || score === '–')) return 'advice';
  return 'ai';
}

export function humanReviewQuestions(context) {
  const finalChangeOnly = context === 'human' || context === 'advice';
  const outcome = (folder, title, example) => {
    const status = reviewStatuses.find(item => item.folder === folder);
    const humanOnly = {
      full: 'A person deliberately checked the final change and approved it.',
      partial: 'A person checked part of the final change, or final approval is incomplete.',
    };
    const guidance = (finalChangeOnly ? humanOnly[folder] : undefined) ?? status.guidance;
    return { title, result: folder, badge: folder === 'unknown' ? '? · Unknown' : status.label, guidance, example };
  };
  const unknown = outcome('unknown', 'I cannot establish how complete the review was');
  const depth = 'Skimming is not a check, and an AI review on its own is not human review. The author may do this review.';
  const coverage = {
    human: `All contribution scores are 0 or not applicable, so assess whether a person deliberately reviewed and approved the final change. ${depth}`,
    advice: `AI was only consulted. Assess whether a person checked and approved the final change, including any decisions shaped by AI advice. ${depth}`,
    unknown: `Some AI involvement is unknown, so Full requires a review of all work in scope, including work whose origin is unclear. ${depth}`,
    ai: `Full requires that a person checked every material AI contribution, for example by reading and understanding it and running the tests, and approved the final result. ${depth}`,
  }[context];
  return [
    {
      question: context === 'ai'
        ? 'Did a person deliberately check any material AI contribution in this scope?'
        : 'Did a person deliberately review the work in this scope?',
      choices: [
        outcome('none', 'No human review took place'),
        { title: 'Yes, a person reviewed the work', guidance: 'Base this on notes, review comments, test results, or your own record of what you checked.' },
        outcome('unknown', 'I cannot establish whether anyone reviewed it'),
      ],
    },
    {
      question: 'Was the review complete, and did a person approve the final result?',
      guidance: coverage,
      choices: [
        outcome('full', 'Yes, the review was complete and the result was approved',
          'A person checked the relevant design, implementation, tests, and docs, resolved any material findings, and approved the change.'),
        outcome('partial', 'Part of the work was checked, or approval is still pending', finalChangeOnly
          ? 'You inspected the code and ran the tests, but final approval is still pending.'
          : 'You inspected the code, but the AI-written docs have not been reviewed yet.'),
        unknown,
      ],
    },
  ];
}

const filenameCodes = { '?': 'U', '–': 'N' };

export function badgeFilename(scores) {
  return categories.map(({ code }, index) => {
    const score = scores[index];
    return code + (filenameCodes[score] ?? score);
  }).join('-') + '.svg';
}

export function badgePath(scores, review) {
  return `badges/v${rubricVersion}/${review.folder}/${badgeFilename(scores)}`;
}

export function badgeAlt(scores, review) {
  const spoken = { '?': 'unknown', '–': 'not applicable' };
  const namedScores = categories.map(({ name }, index) => `${name} ${spoken[scores[index]] ?? scores[index]}`);
  return `Colophon AI disclosure, rubric v${rubricVersion}. ${namedScores.join(', ')}. Human review ${review.description}.`;
}
