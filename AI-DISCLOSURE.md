# Colophon rubric v1

Use this rubric to disclose how generative AI contributed to a specific code change and what a person checked before accepting it. Complete it for a pull request, release, or explicitly named set of changes. Use the same scope for all four scores and for human review.

This is version 1 of the rubric. Badges scored with it live under `badges/v1/` and link to `https://ifilot.github.io/ai-disclosure/v1/`, with parameters that name the badge, such as `?scores=D3-I4-T4-C2&review=full`, so the page can explain that badge. A change to what any score means gets a new version, so a v1 badge never changes meaning. The [scoring guide](https://ifilot.github.io/ai-disclosure/guide.html) and the [self-assessment](https://ifilot.github.io/ai-disclosure/assess.html) present the same rubric.

## 1. Describe the work and any AI use

Record the scope, such as a PR number or release tag. Count every use of generative AI you know of that informed or produced in-scope work, including chats, always-on editor completions, and agents. For team work, ask the contributors or consult available records. Choose `?` where you cannot substantiate a score. Choose `0` only when you can declare that AI was not used in that category, and `–` when the scope has no work in that category.

| Category | Ask yourself |
| --- | --- |
| **Design** | Did AI help define requirements, evaluate alternatives, choose an architecture or algorithm, or write the implementation plan? |
| **Implementation** | Did AI help write or change production code, scripts, configuration, or infrastructure definitions? |
| **Tests & checks** | Did AI help write tests and fixtures, review code, diagnose failures, or interpret verification results? |
| **Comments & docs** | Did AI help write or edit comments, docstrings, README files, guides, commit messages, or pull request descriptions? |

Count a contribution in each category it materially affected. If AI writes a function and its docstring, assess the function under Implementation and the docstring under Comments & docs.

## 2. Score each category

Work through these questions for each category. Check the final diff, planning notes, assistant history, or review records as needed.

1. **Was AI used in this category?** If you can confirm no use, choose `0`. If the scope has no work in this category, choose `–`. If you know AI was used, continue. If you cannot establish the answer, choose `?`.
2. **What did AI contribute to the final result?** Choose `1` for advice, ideas, or drafts that were discarded when a person produced the work. Choose `2` for discrete AI-produced pieces in predominantly human-produced work, even when those pieces were kept unchanged. If AI produced a substantial part of the result, continue.
3. **Who determined the final result?** Choose `3` if a person determined it through material specifications given before the draft or material changes made or specified after it. Choose `4` if an AI-produced version was used largely as delivered, including after AI-led iterations. Choose `?` at either decision if the evidence cannot support a level.

| Score | Label | Decision rule | Implementation example |
| --- | --- | --- | --- |
| `0` | None | No AI was used in this category. | You wrote the code without AI. |
| `1` | Consulted | AI gave advice or ideas, or drafts that were discarded. A person produced the work. | AI explained an unfamiliar API and you wrote the code. |
| `2` | Contributed | AI produced discrete pieces of a largely human-produced result. | AI wrote a helper function, or editor completions filled in lines of code you were writing. |
| `3` | Drafted | AI produced a substantial part of the result, but a person determined it through material specifications or changes. | AI drafted the feature and you rewrote its main logic. |
| `4` | Delegated | AI produced a substantial result that was used largely as delivered, including after AI-led revisions. | An agent implemented the feature from your specification and you approved it after review. |
| `?` | Unknown | Available information cannot establish the category’s score. | A contributor’s use of AI cannot be established. |
| `–` | Not applicable | The scope has no work in this category. | A bug fix with no documentation changes, scored under Comments & docs. |

Judge substantial work by its role in the scoped result. If parts of the scope differ, score the highest level that applies to a material part, and name that part in the disclosure so readers can see what the score covers. A material change alters the approach, behavior, test coverage, or meaning. Formatting, small wording fixes, flagging issues, asking for another iteration, and approval alone leave a substantial AI contribution at `4`.

### Specifications and design decisions

Specifications and instructions you wrote are human work. If your specification fixed the design, AI contributed little to Design even when an agent then wrote all the code, which is usually a `4` under Implementation.

When the design contributions were mixed, compare your specification and feedback with the design you adopted, and try to finish this sentence using the evidence available to you.

> I specified ___, the final design adopted it in ___, and it mattered because ___.

The same test works for the other categories. Choose `3` if your answer identifies a concrete change you supplied that materially shaped the result, whether before or after the first draft. AI can write the revised document or code. Choose `4` if AI supplied the substantive choices that were adopted largely as delivered. Flagging problems, setting goals, requesting more iterations, and selecting an AI-proposed solution can all happen at `4`. If you cannot establish who supplied the substantive choices, choose `?`.

Consider two reviews of the same AI-generated synchronous design. In the first, you specify a durable queue and a rule to prevent duplicate jobs, and AI incorporates both into the revised design. That is `D3`. In the second, you ask AI to handle retries and duplicate jobs. AI chooses the queue and the deduplication rule, and you accept the revised design. That is `D4`. Either design may qualify for `Full` human review when the review criteria are met.

### Examples by category

| Category | `1` · Consulted | `2` · Contributed | `3` · Drafted | `4` · Delegated |
| --- | --- | --- | --- | --- |
| Design | AI suggested architectural alternatives. You wrote the plan. | You wrote a detailed specification. AI filled in the error-handling section, which you kept. | You specified a durable queue and a deduplication rule for the AI draft. AI incorporated them. | You asked AI to handle retries and duplicate jobs. AI chose the design changes, which you accepted. |
| Implementation | AI explained an unfamiliar API. You wrote the code. | AI wrote one helper, or completions filled in lines you were writing. | AI drafted the feature. You rewrote its main logic. | An agent implemented the feature from your specification. You kept it largely as delivered. |
| Tests & checks | AI suggested edge cases or diagnosed a failure. You wrote the tests and the fix. | AI added a fixture and two cases to your suite. | AI drafted the suite. You substantially changed its coverage and assertions. | AI wrote the suite, or an AI reviewer’s findings were applied largely as delivered. |
| Comments & docs | AI suggested an outline. You wrote the guide. | AI wrote a few docstrings in documentation you otherwise wrote. | AI drafted the guide. You rewrote its explanations and examples. | AI wrote the guide. You checked it against the code and made minor edits. |

### Edge cases

| Situation | Where it counts |
| --- | --- |
| Editor completions | Completions inside code you were writing are discrete pieces, usually `2` under Implementation. When they wrote whole functions or most of the logic, treat them as a substantial part of the result. |
| AI code review | Findings from an AI reviewer count under Tests & checks. They never count as human review. |
| Debugging | AI diagnosing a failure counts under Tests & checks. The fix counts under Implementation. |
| Commit messages and PR descriptions | Comments & docs. |
| Translations and UI text | Documentation translations count under Comments & docs. Strings shipped in the product count under Implementation. |
| Generated data | Test fixtures count under Tests & checks. Production data and configuration count under Implementation. |
| Mechanical refactors | Codemods and renames done by AI count under Implementation. A large mechanical change used as delivered is a `4`; say in the disclosure that it was mechanical. |

## 3. Assess human review

Use one review status for the same scope. The author can carry out this review. To declare `Full`, identify each material AI contribution, check it against criteria appropriate to its category, and approve the final result after resolving any material findings. For example, check the design against requirements, read and understand the implementation changes, assess what tests cover and run them, and compare documentation with implemented behavior. Skimming is not a check, and an AI review on its own is not human review. Record the checks you actually ran, and whether the review was the author’s own or independent, so readers can tell inspection from verification.

First ask whether a person deliberately reviewed the work. If no one did, choose `None`. If you cannot establish whether anyone did, choose `?`. If review took place, ask whether it covered all required work and whether a person approved the final result. Use the decision rules below to distinguish `Full`, `Partial`, and `?`.

| Badge status | Decision rule |
| --- | --- |
| `Full` | A person checked every material AI contribution against relevant criteria and approved the final result. The badge shows a green check. |
| `Partial` | A person checked at least one material AI contribution, but review coverage or final approval is incomplete. The badge shows an amber exclamation mark. |
| `None` | No human review took place. The badge shows a red cross. |
| `?` | Whether a person reviewed the work, or how much of it, is unknown or undeclared. The badge shows a red cross, the same as `None`. |

If every score is `0`, `1`, or `–`, assess the human review of the final change, including decisions influenced by AI advice. For a category scored `?`, declare `Full` only if you can establish that the review covered all work in scope, including work whose AI origin is unknown.

Review status and contribution level answer different questions. `D4 I4 T4 C4` with `Full` means AI produced substantial results used largely as delivered and a person checked and approved them. The contribution scores are neutral, but the review marker is not: a red cross flags that nobody checked the work, which matters whoever wrote it, so it appears even when all four scores are `0`.

## 4. Record the result

Keep the scope, four scores, and human review status with a short explanation of any material AI contribution and the human checks performed. Name the parts AI contributed, say what people specified, decided, or rewrote, and report only the checks that were actually performed. If AI did notably well or poorly, say so. The [guide to writing a disclosure](https://ifilot.github.io/ai-disclosure/about.html#write-a-disclosure) has a template and examples, and the self-assessment fills in the template for you.

> **Scope:** PR #42.
>
> **What AI contributed.** AI produced the implementation and docstrings, which were accepted after minor edits. No AI was used for design or testing.
>
> **How it was checked.** The author inspected the diff, ran the existing test suite, and checked the docstrings against the code.

## Commit trailer

The same result can be recorded in a commit message, or the squash-merge message of a pull request, as a git trailer on the last line:

```text
Colophon: v1 D3 I4 T4 C- review=full
```

The trailer names the rubric version, then each category’s letter and score, then the review status. Scores are `0` to `4`, `?` for unknown, and `-` (an ASCII hyphen) for not applicable. The review status is `full`, `partial`, `none`, or `unknown`. The scope is the commit or pull request that carries the trailer.

## Badge catalog

Each badge is a pre-generated SVG for one combination of four scores and one review status. Each visible score sits beside its category icon, and the SVG’s accessible name spells out the rubric version, the categories, and the review status.

Use the path `badges/v1/<review>/D<score>-I<score>-T<score>-C<score>.svg`. The review folder is `full`, `partial`, `none`, or `unknown`. In the filename, encode an unknown score (`?`) as `U` and a not-applicable score (`–`) as `N`. For example, `D0 I4 T0 C4` with `Full` uses `badges/v1/full/D0-I4-T0-C4.svg`. The last cell marks the review status: a green check for `Full`, an amber exclamation mark for `Partial`, and a red cross for `None` and `?`. [Example badge](docs/colophon-example.svg)

GitHub Actions generates all 9,604 SVGs, with 2,401 in each review folder, before publishing the site. To generate a standalone copy locally, run `npm ci` and `npm run generate:badges` from the project root with Node.js 20 or newer.
