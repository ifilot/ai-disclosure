export const categories = [
  {
    code: 'D', name: 'Design', title: 'Design', icon: 'pen-ruler',
    prompt: 'Requirements, architecture, algorithms, and implementation plans.',
    question: 'Did you use AI to help decide what to build or how to build it?',
    evidence: 'Check the issue, design notes, diagrams, and planning conversations. Assess decisions and plans that guided this change.',
    examples: [
      'The team chose the API contract and architecture without AI.',
      'AI suggested architectural alternatives. You evaluated them and wrote the plan yourself.',
      'AI drafted one error-handling decision in a design the team otherwise produced.',
      'AI drafted a synchronous design. You specified a durable queue and a rule to prevent duplicate jobs. AI wrote the revised design around those decisions.',
      'AI drafted a synchronous design. You asked AI to address retries and duplicate jobs. AI chose a durable queue and a deduplication rule, which you accepted.',
    ],
  },
  {
    code: 'I', name: 'Implementation', title: 'Implementation', icon: 'code',
    prompt: 'Production code, scripts, configuration, and refactors.',
    question: 'Did you use AI while writing or changing code or configuration?',
    evidence: 'Look at the final diff, accepted editor suggestions, and agent edits. Assess production code and configuration here, and assess tests and documentation in their own categories.',
    examples: [
      'A person wrote the scoped code and configuration without AI assistance.',
      'AI explained a bug. You wrote the fix yourself.',
      'AI wrote a helper function in a feature you otherwise implemented.',
      'AI drafted the feature. You rewrote its main logic and changed how it handles failures.',
      'AI implemented the feature. You reviewed the changes and kept the implementation largely as delivered.',
    ],
  },
  {
    code: 'T', name: 'Testing', title: 'Tests & checks', icon: 'flask',
    prompt: 'Tests, fixtures, code review, and analysis of failures or results.',
    question: 'Did you use AI to plan tests, review changes, or interpret results?',
    evidence: 'Look at test diffs, fixtures, review comments, and failure analysis. A person running or inspecting AI-written tests also records that work under human review.',
    examples: [
      'People wrote the tests and investigated failures without AI.',
      'AI suggested edge cases. You wrote the tests and assertions yourself.',
      'AI wrote a fixture and two edge-case tests for a suite you otherwise authored.',
      'AI drafted the suite. You substantially changed the coverage and rewrote the assertions.',
      'AI produced the suite or review findings used for this change. They were accepted largely as delivered.',
    ],
  },
  {
    code: 'C', name: 'Comments and Docs', title: 'Comments & docs', icon: 'file-lines',
    prompt: 'Inline comments, docstrings, READMEs, and other documentation.',
    question: 'Did you use AI while writing comments, docstrings, or documentation?',
    evidence: 'Check the comments and documentation in the final diff, including docstrings generated together with code.',
    examples: [
      'People wrote the comments and docs without AI, or no comments or docs were in scope and AI was unused here.',
      'AI suggested an outline. You wrote the documentation yourself.',
      'AI authored a few docstrings in documentation you otherwise wrote.',
      'AI drafted the guide. You reorganized it and rewrote the explanations and examples.',
      'AI produced the docstrings or guide. You checked the descriptions against the code and kept them largely as delivered.',
    ],
  },
];

export const scoreLevels = [
  { value: '0', label: 'None', guidance: 'You can confirm that no AI was used in this category.' },
  { value: '1', label: 'Consulted', guidance: 'AI offered advice or drafts you discarded, and a person produced the work.' },
  { value: '2', label: 'Contributed', guidance: 'AI produced discrete pieces of a largely human-produced result.' },
  { value: '3', label: 'Drafted', guidance: 'AI produced a substantial first pass. A person made or specified changes that materially shaped the final result.' },
  { value: '4', label: 'Delegated', guidance: 'AI produced a substantial result that was used largely as delivered, including after AI-led revisions.' },
  { value: '?', label: 'Unknown', guidance: 'You cannot establish how much AI was used in this category.' },
];

export const reviewStatuses = [
  { folder: 'full', label: 'Full', description: 'Full', guidance: 'A person checked every material AI contribution and approved the final result.' },
  { folder: 'partial', label: 'Partial', description: 'Partial', guidance: 'A person checked at least one material AI contribution, but review coverage or final approval is incomplete.' },
  { folder: 'none', label: 'None', description: 'None', guidance: 'No human review took place.' },
  { folder: 'unknown', label: '?', description: 'Undeclared', guidance: 'The review status or coverage is unknown or undeclared.' },
];

export function contributionQuestions(category) {
  const outcome = (value, title, guidance) => {
    const level = scoreLevels.find(item => item.value === value);
    return { title, result: value, badge: `${value} · ${level.label}`, guidance: guidance ?? level.guidance, example: category.examples[value] };
  };
  const unknown = outcome('?', 'I cannot establish the answer');
  const questions = [
    {
      question: category.question,
      choices: [
        outcome('0', 'No, I can confirm there was no AI use'),
        { title: 'Yes, AI was used', guidance: 'Include advice, experiments you discarded, and AI output you used.' },
        unknown,
      ],
    },
    {
      question: 'What did AI contribute to the result you used?',
      guidance: 'Judge the role of the contribution in this scope. A small piece can be level 2 even if you kept it unchanged.',
      choices: [
        outcome('1', 'Advice, ideas, or a draft we discarded'),
        outcome('2', 'Discrete pieces of mostly human-produced work'),
        { title: 'A substantial draft or result', guidance: 'The AI output formed a substantial part of the work in this category.' },
        unknown,
      ],
    },
  ];

  if (category.code === 'D') {
    const humanDecision = outcome('3', 'A person supplied a material design change that we adopted',
      'The final design incorporates a concrete choice the person supplied, such as changing the data model, service boundaries, or failure behavior. AI can write the revision.');
    const aiDecision = outcome('4', 'AI supplied the substantive design we adopted',
      'A person may flag issues, set goals, request iterations, or approve an AI-proposed solution. Choose this when the substantive design came from AI and was used largely as delivered.');
    return [
      ...questions,
      {
        question: 'What did your feedback add to the final design?',
        guidance: 'Compare the first draft, your feedback, and the final design. Use the role your feedback played in the adopted design to decide.',
        choices: [
          humanDecision,
          aiDecision,
          { title: 'Both contributed, or I’m unsure how material my feedback was', guidance: 'Work through one more check using the final design.' },
          unknown,
        ],
      },
      {
        question: 'Can you point to a consequential change in the final design that you supplied?',
        guidance: 'Name the concrete design change, find where it appears in the final draft, and explain what it changed in the scoped design. Selecting an AI-proposed solution as delivered counts as approval.',
        choices: [
          { ...humanDecision, title: 'Yes, I can link a human design decision to a material change we adopted' },
          { ...aiDecision, title: 'I can establish that the final design used AI’s substantive choices' },
          unknown,
        ],
      },
    ];
  }

  return [
    ...questions,
    {
      question: 'Did a person make or specify material changes after the first draft?',
      guidance: 'Look for changes to the approach, behavior, test coverage, or meaning. A person can specify those changes and ask AI to apply them. Flagging issues, requesting another iteration, and approving the result can still be level 4 if AI devised the substantive revisions.',
      choices: [
        outcome('3', 'A person made or specified material changes'),
        outcome('4', 'We used an AI-produced version largely as delivered'),
        unknown,
      ],
    },
  ];
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
    return { title, result: folder, badge: folder === 'unknown' ? '? · Undeclared' : status.label, guidance, example };
  };
  const unknown = outcome('unknown', 'I cannot establish the coverage');
  const coverage = {
    human: 'Check whether a person deliberately reviewed and approved the final change. All four contribution scores are 0.',
    advice: 'AI use was limited to consultation. Assess whether a person checked and approved the final change, including decisions influenced by AI advice.',
    unknown: 'Because some AI involvement is unknown, Full requires review of all work in scope, including work whose AI origin is unclear.',
    ai: 'Look for a check of every material AI contribution and a person’s approval of the final result. The author can perform this review.',
  }[context];
  return [
    {
      question: context === 'ai'
        ? 'Did a person deliberately check any material AI contribution in this scope?'
        : 'Did a person deliberately review the work in this scope?',
      choices: [
        outcome('none', 'No human review took place'),
        { title: 'Yes, a person reviewed the work', guidance: 'Use available notes, review comments, test results, or your own record of what you checked.' },
        outcome('unknown', 'I cannot establish whether anyone reviewed it'),
      ],
    },
    {
      question: 'Was the review complete, and did a person approve the final result?',
      guidance: coverage,
      choices: [
        outcome('full', 'Yes, the review was complete and the result was approved',
          'A person checked the applicable design, implementation, tests, and docs, resolved material findings, and approved the change.'),
        outcome('partial', 'Some work was checked, or approval is still incomplete', finalChangeOnly
          ? 'You inspected the code and ran the tests, but final approval is still pending.'
          : 'You inspected the code, but AI-generated docs still need review or the final review is still open.'),
        unknown,
      ],
    },
  ];
}

export function badgeFilename(scores) {
  return categories.map(({ code }, index) => {
    const score = scores[index];
    return code + (score === '?' ? 'U' : score);
  }).join('-') + '.svg';
}

export function badgeAlt(scores, review) {
  const namedScores = categories.map(({ name }, index) => {
    const score = scores[index];
    return `${name} ${score === '?' ? 'Unknown' : score}`;
  });
  return `AID, Artificial Intelligence Disclosure. ${namedScores.join(', ')}. Human review ${review.description}.`;
}
