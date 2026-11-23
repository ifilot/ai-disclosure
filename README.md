# Colophon

[![Version](https://img.shields.io/github/package-json/v/ifilot/ai-disclosure)](package.json)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)](site/app.js)
[![GitHub Actions](https://github.com/ifilot/ai-disclosure/actions/workflows/pages.yml/badge.svg)](https://github.com/ifilot/ai-disclosure/actions/workflows/pages.yml)
[![CC BY-SA 4.0](https://img.shields.io/badge/License-CC_BY--SA_4.0-lightgrey)](https://creativecommons.org/licenses/by-sa/4.0/)

Colophon is an AI disclosure for code. Its guided self-assessment produces a compact badge and a short written disclosure of how AI contributed to a pull request, release, or other set of changes, and whether a person checked the result.

AI now helps write a great deal of code, but "made with AI" tells the people who read that code very little. AI may have suggested an approach, written one helper, drafted a whole feature, or produced the test suite, and a person may or may not have checked the result. Maintainers, reviewers, students, and other users of the code weigh it differently depending on those answers, yet they rarely get them. A colophon is the note at the end of a book that records how it was made, and Colophon aims to make the same kind of note a normal part of sharing code. Colophon is about disclosure, not judgment: a high score is not a warning and a zero is not a merit, and when AI did remarkable work, the disclosure is a place to say so. The one thing it does flag is missing human review. Read more on the [About page](https://ifilot.github.io/ai-disclosure/about.html).

[![Create your colophon with the guided self-assessment](docs/create-colophon.svg)](https://ifilot.github.io/ai-disclosure/assess.html)

## Create and use a badge

1. Open the [self-assessment](https://ifilot.github.io/ai-disclosure/assess.html) and name one scope, such as a pull request or release.
2. Work through the four contribution categories. The questions and examples help you choose a score based on what AI contributed and who determined the final result.
3. Answer the human review questions for the same scope.
4. Fill in the written disclosure: what AI contributed, what people did, how it was checked, and anything worth noting. Each part is optional, and Markdown is kept as you type it.
5. Select **Copy Markdown** and paste it into your README or pull request. The copied badge links to the rubric version it was scored with. The [guide to writing a disclosure](https://ifilot.github.io/ai-disclosure/about.html#write-a-disclosure) has examples and tips.

To record the disclosure in your history as well, copy the **commit trailer** from the form and add it to the end of the commit message, or the squash-merge message of a pull request:

```text
Colophon: v1 D3 I4 T4 C- review=full
```

To keep a copy alongside your source, select **Download SVG**, save it as `docs/colophon.svg` in your repository, and reference it from your README.

```markdown
[![AI disclosure for this release](docs/colophon.svg)](https://ifilot.github.io/ai-disclosure/v1/)
```

## Read the badge

The four icon-and-score cells always appear in this order.

| Category | What it covers |
| --- | --- |
| Design | Requirements, architecture, algorithms, and implementation plans |
| Implementation | Production code, scripts, configuration, and refactors |
| Tests & checks | Tests, fixtures, AI code review, and diagnosis of failures |
| Comments & docs | Comments, docstrings, READMEs, commit messages, and guides |

The contribution scale runs from **0 None** through **1 Consulted**, **2 Contributed**, **3 Drafted**, and **4 Delegated**. Use `?` when the evidence does not establish a score, and `–` when the scope has no work in that category.

The person icon marks human review, and the last cell flags its status. **Full** gets a green check: a person checked every material AI contribution and approved the final result, whatever the scores. **Partial** gets an amber exclamation mark. **None** and an unknown review (`?`) get a red cross, because unreviewed code is a risk whoever wrote it. The [scoring guide](https://ifilot.github.io/ai-disclosure/guide.html) explains every category with examples, and [AI-DISCLOSURE.md](AI-DISCLOSURE.md) holds the full rubric.

## Rubric versions

The current rubric is **v1**. Badges live under `badges/v1/` and link to `https://ifilot.github.io/ai-disclosure/v1/`. A change to what any score means gets a new version with new badge paths, so a published v1 badge never changes meaning. The version is set by `rubricVersion` in [`site/rubric.js`](site/rubric.js).

## Preview the site locally

Use Node.js 20 or newer and Python 3. Run these commands from the repository root.

```sh
npm ci
npm run build
npm run verify:site
python3 -m http.server 8000 --directory dist
```

Open `http://localhost:8000/`. The site must be served over HTTP; opening the files from disk does not run the form. The build puts the static site, Bootstrap, Font Awesome icons, and all **9,604 badge SVGs** in `dist/`. The form runs entirely in the browser. A local preview produces relative paths in copied Markdown.

- [`site/`](site/) contains the landing page, the self-assessment form, the scoring guide, the About page, styles, and browser code. The question text and examples live in [`site/rubric.js`](site/rubric.js).
- [`scripts/`](scripts/) contains the `badge-maker` generator, the static build, and its verification, which also checks every internal link, anchor, and icon reference. `npm run generate:button` regenerates the README button in `docs/`, with text outlined from the Inter font.

## Deploy to GitHub Pages

1. Push the project to a GitHub repository.
2. In the repository, open **Settings → Pages** and select **GitHub Actions** as the source.
3. If the `github-pages` environment restricts deployment branches, allow your default branch under **Settings → Environments → github-pages**.
4. From **Actions**, run **Build and deploy Colophon** on the default branch. Later pushes to that branch deploy automatically.

The [Pages workflow](.github/workflows/pages.yml) builds and verifies the site on every push and pull request, and deploys only from the default branch. The site works at a project subpath such as `/ai-disclosure/`.

GitHub Actions generates the badge catalog during the build. To generate a standalone copy locally, run `npm run generate:badges`. Git ignores the resulting `badges/` directory.

## AI disclosure for this repository

[![Colophon AI disclosure, rubric v1. Design 3, Implementation 4, Tests & checks 4, Comments & docs 3. Human review Full.](docs/colophon-self-assessment.svg)](https://ifilot.github.io/ai-disclosure/v1/)

**Scope:** this repository, up to the current version.

**What AI contributed.** An AI coding agent (Claude Code) wrote most of the site code, the badge, build, and verification scripts, and drafted much of the documentation, including the About page and this README. Its implementation and checks were used largely as delivered.

**What people did.** The maintainer set the goals and the rubric's design, and made the key decisions, including the category scale, the neutral stance, the review markers, and the name. The maintainer directed every change and edited the documentation.

**How it was checked.** The maintainer reviewed every AI-written change and the rendered site before committing. `npm run verify:site` checks every page, link, icon, and badge on each build.