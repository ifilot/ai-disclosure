# Artificial Intelligence Disclosure

[![Version](https://img.shields.io/github/package-json/v/ifilot/ai-disclosure)](package.json)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)](site/app.js)
[![GitHub Actions](https://github.com/ifilot/ai-disclosure/actions/workflows/pages.yml/badge.svg)](https://github.com/ifilot/ai-disclosure/actions/workflows/pages.yml)
[![CC BY-SA 4.0](https://img.shields.io/badge/License-CC_BY--SA_4.0-lightgrey)](https://creativecommons.org/licenses/by-sa/4.0/)

AID helps software authors disclose how AI contributed to a pull request, release, or other set of changes. Its guided self-assessment produces a compact badge showing four contribution scores and the human review status.

[Open the AID self-assessment](https://ifilot.github.io/ai-disclosure/)

**Project self-assessment**

![AID self-assessment. Design 3, Implementation 4, Testing 4, Comments and Docs 3. Human review Full.](docs/aid-self-assessment.svg)

## Create and use a badge

1. Choose one scope, such as a pull request or release. Enter the scope in the form to include it in your Markdown disclosure.
2. Work through the four contribution categories. The questions and examples help you choose a score based on what AI contributed and how much a person reworked it.
3. Answer the human review questions for the same changes. You can add disclosure notes about which parts AI contributed and what you checked.
4. Select **Copy Markdown** and paste it into your README or pull request. From the hosted form, the copied Markdown points to the SVG on GitHub Pages and includes any scope or notes you entered.

To keep a copy alongside your source, select **Download SVG**, save it as `docs/aid.svg` in your repository, and reference it from your root README.

```markdown
![AI disclosure for this release](docs/aid.svg)
```

## Read the badge

The four icon-and-score cells always appear in this order.

| Code | Category | What it covers |
| --- | --- | --- |
| `D` | Design | Requirements, architecture, and implementation decisions |
| `I` | Implementation | Code, scripts, configuration, and refactors |
| `T` | Tests & checks | Tests, fixtures, code review, and analysis of results |
| `C` | Comments & docs | Inline comments, docstrings, READMEs, and guides |

The contribution scale runs from **0 None** through **1 Consulted**, **2 Contributed**, **3 Drafted**, and **4 Delegated**. Use `?` when the evidence does not establish a score.

The person icon marks human review. **Full** means a person checked every material AI contribution and approved the final result. The green check marks that status, which can appear even when AI scored `4` in all four categories. See the [full self-assessment rubric](AI-DISCLOSURE.md) for the decision rules and examples.

## Preview the site locally

Use Node.js 20 or newer and Python 3. Run these commands from the repository root.

```sh
npm ci
npm run build
npm run verify:site
python3 -m http.server 8000 --directory dist
```

Open `http://localhost:8000/`. The build puts the static site, Bootstrap, Font Awesome icons, and all **5,184 badge SVGs** in `dist/`. The form runs entirely in the browser. A local preview produces relative image paths in copied Markdown.

- [`site/`](site/) contains the form, styles, and browser code. The question text and examples live in [`site/rubric.js`](site/rubric.js).
- [`scripts/`](scripts/) contains the `badge-maker` generator, static build, and deployment checks.

## Deploy to GitHub Pages

1. Push the project to a GitHub repository.
2. In the repository, open **Settings → Pages** and select **GitHub Actions** as the source.
3. If the `github-pages` environment restricts deployment branches, allow your default branch under **Settings → Environments → github-pages**.
4. From **Actions**, run **Deploy AID to GitHub Pages** on the default branch. Later pushes to that branch deploy automatically.

The [Pages workflow](.github/workflows/pages.yml) builds `dist/`, checks that all site assets and badge variants are present, and uploads the static package. The site works at a project subpath such as `/ai-disclosure/`.

GitHub Actions generates the badge catalog during the build. To generate a standalone copy locally, run `npm run generate:badges`. Git ignores the resulting `badges/` directory.
