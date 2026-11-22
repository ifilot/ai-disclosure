# AID self-assessment rubric

Use this rubric to disclose how generative AI contributed to a specific software change and what a person checked before accepting it. Complete it for a pull request, release, or explicitly named set of changes. Use the same scope for all four scores and for human review.

## 1. Describe the work and any AI use

Record the scope, such as a PR number or release tag. Include intentional use of generative AI in chats, editor suggestions, and agents when it informed or produced in-scope work. For team work, ask the contributors or consult available records. Choose `?` where you cannot substantiate a score. Choose `0` only when you can declare that AI was unused in that category.

| Category | Ask yourself |
| --- | --- |
| **D · Design** | Did AI help define requirements, evaluate alternatives, choose an architecture or algorithm, or write the implementation plan? |
| **I · Implementation** | Did AI help write or change production code, scripts, configuration, or infrastructure definitions? |
| **T · Testing** | Did AI help plan or write tests and fixtures, investigate failures, review code, or interpret verification results? |
| **C · Comments & Docs** | Did AI help write or edit inline comments, docstrings, README files, guides, or other documentation? |

Count a contribution in each category it materially affected. If AI writes a function and its docstring, assess the function under Implementation and the docstring under Comments & Docs. If a category has no in-scope work and you can confirm no AI use there, score it `0`.

## 2. Score each category

Work through these questions for each category. Check the final diff, planning notes, assistant history, or review records as needed.

1. **Was AI used in this category?** If you can confirm no use, choose `0`. If you know it was used, continue. If you cannot establish the answer, choose `?`.
2. **What did AI contribute to the result you used?** Choose `1` for advice, ideas, or a draft you discarded when a person produced the work. Choose `2` for discrete AI-produced pieces in predominantly human-produced work, even when those pieces were kept unchanged. If AI produced a substantial draft or result, continue.
3. **Did a person make or specify material changes after the first draft?** Choose `3` if a person made or specified changes that materially shaped the final result. Choose `4` if an AI-produced version was used largely as delivered, including after AI-led iterations. Choose `?` at either decision if the evidence cannot support a level.

| Score | Label | Decision rule | Implementation example |
| --- | --- | --- | --- |
| `0` | None | No AI was used in this category. | A person wrote the change without AI assistance. |
| `1` | Consulted | AI offered advice or ideas. A person produced the work. | AI explained a bug and a person wrote the fix. |
| `2` | Contributed | AI produced discrete pieces of a largely human-produced result. | AI wrote a helper function that a person integrated into the change. |
| `3` | Drafted | AI produced a substantial first pass. A person made or specified changes that materially shaped the final result. | AI drafted the feature and a person rewrote significant parts. |
| `4` | Delegated | AI produced a substantial result that was used largely as delivered, including after AI-led revisions. | AI implemented the feature and a person approved it after review. |
| `?` | Unknown | Available information cannot establish the category’s score. | A contributor’s use of AI cannot be established. |

Judge substantial work by its role in the scoped result. If AI work covers only one part of a category, name that part in the disclosure so readers can see what the score covers. Look at what changed during human review. A substantive rewrite changes the approach, behavior, test coverage, or meaning. Formatting, small wording fixes, and approval alone leave a substantial AI contribution at `4`.

### Design feedback and AI revisions

Compare the first draft, your feedback, and the design you adopted. If the contributions were mixed, try to finish this sentence using the evidence available to you.

> I specified ___, the final design adopted it in ___, and it mattered because ___.

Choose `D3` if your answer identifies a concrete design change you supplied that materially shaped the final design. AI can write the revised document. Choose `D4` if AI supplied the substantive design choices that you adopted largely as delivered. Flagging problems, setting goals, requesting more iterations, and selecting an AI-proposed solution can all happen at `D4`. If you cannot establish who supplied the substantive changes, choose `D?`.

Consider two reviews of the same AI-generated synchronous design. In the first, you specify a durable queue and a rule to prevent duplicate jobs, and AI incorporates both into the revised design. That is `D3`. In the second, you ask AI to handle retries and duplicate jobs. AI chooses the queue and the deduplication rule, and you accept the revised design. That is `D4`. Either design may qualify for `Full` human review when the review criteria are met.

### Examples by category

| Category | `1` · Consulted | `2` · Contributed | `3` · Drafted | `4` · Delegated |
| --- | --- | --- | --- | --- |
| Design | AI suggested architectural alternatives. You wrote the plan. | AI drafted one error-handling decision in a larger human-authored design. | You specified a durable queue and a deduplication rule for the AI draft. AI incorporated them. | You asked AI to handle retries and duplicate jobs. AI chose the design changes, which you accepted. |
| Implementation | AI explained a bug. You wrote the fix. | AI wrote one helper in a feature you implemented. | AI drafted the feature. You rewrote its main logic. | AI produced the feature. You reviewed it and kept it largely as delivered. |
| Tests & checks | AI suggested edge cases. You wrote the assertions. | AI added a fixture and two cases to your suite. | AI drafted the suite. You substantially changed its coverage and assertions. | AI produced the suite or review findings used largely as delivered. |
| Comments & docs | AI suggested an outline. You wrote the guide. | AI authored a few docstrings in documentation you otherwise wrote. | AI drafted the guide. You rewrote its explanations and examples. | AI produced the guide. You checked it against the code and made minor edits. |

## 3. Assess human review

Use one review status for the same scope. The author can carry out this review. To declare `Full`, identify each material AI contribution, check it against criteria appropriate to its category, and approve the final result after resolving any material findings. For example, check the design against requirements, inspect implementation changes, assess what tests cover and how they ran, and compare documentation with implemented behavior. Record any checks you actually ran so readers can distinguish inspection from independent verification.

First ask whether a person deliberately reviewed the work. If no one did, choose `None`. If you cannot establish whether anyone did, choose `?`. If review took place, ask whether it covered all required work and whether a person approved the final result. Use the decision rules below to distinguish `Full`, `Partial`, and `?`.

| Badge status | Decision rule |
| --- | --- |
| `Full` | A person checked every material AI contribution and approved the final result. The badge adds a green check. |
| `Partial` | A person checked at least one material AI contribution, but review coverage or final approval is incomplete. |
| `None` | No human review took place. |
| `?` | Human review or its coverage is unknown or undeclared. |

If the scores are all `0` or `1`, assess the human review of the final change, including decisions influenced by AI advice. For a category scored `?`, declare `Full` only if you can establish that the review covered all work in scope, including work whose AI origin is unknown.

Review status and contribution level answer different questions. `D4 I4 T4 C4` with `Full` means AI produced substantial results used largely as delivered and a person checked and approved them. A green check communicates the author's declaration of completed review.

## 4. Record the result

Keep the scope, four scores, and human review status with a short explanation of any material AI contribution and the human checks performed.

> PR #42 · `D0 I4 T0 C4` · Review `Full`. AI produced the implementation and docstrings, which were accepted after minor edits. The author inspected the diff, ran the existing test suite, and checked the docstrings against the code. No AI was used for design or testing.

## Badge catalog

The compact Dusk badge has one pre-generated SVG for every combination of four scores and one review status. Each visible score sits beside its category icon. The SVG's accessible name spells out the categories and review status.

Use the path `badges/<review>/D<score>-I<score>-T<score>-C<score>.svg`. The review folder is `full`, `partial`, `none`, or `unknown`. Encode an unknown score as `U` in the filename. It appears as `?` on the badge. For example, `D0 I4 T0 C4` with `Full` uses `badges/full/D0-I4-T0-C4.svg`. Only `Full` badges have a green check. [Example badge](docs/aid-example.svg)

GitHub Actions generates all 5,184 SVGs, with 1,296 in each review folder, before publishing the site. To generate a standalone copy locally, run `npm ci` and `npm run generate:badges` from the project root with Node.js 20 or newer.
