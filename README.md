# Artificial Intelligence Disclosure

AID helps authors assess how AI contributed to a software change and record what a person reviewed. The form guides you through category-specific questions and examples, then previews the matching badge. Download the SVG or copy Markdown for a README or pull request.

![AID disclosure example. Design 0, Implementation 4, Testing 0, Comments and Docs 4. Human review Full.](docs/aid-example.svg)

Read the [self-assessment rubric](AI-DISCLOSURE.md) for the scoring rules and badge filename convention.

## Preview the site locally

Use Node.js 20 or newer.

```sh
npm ci
npm run build
npm run verify:site
python3 -m http.server 8000 --directory dist
```

Open `http://localhost:8000/`. The build puts the static HTML, CSS, JavaScript, Bootstrap, Font Awesome icons, and all 5,184 badge SVGs in `dist/`. The form runs in the browser. A local preview produces relative badge paths in copied Markdown. A hosted site produces URLs pointing to its badge catalog.

## Deploy to GitHub Pages

1. Push the project to a GitHub repository.
2. In the repository, open **Settings → Pages** and select **GitHub Actions** as the source.
3. From **Actions**, run **Deploy AID to GitHub Pages** on the default branch. Later pushes to the default branch deploy automatically.

The [Pages workflow](.github/workflows/pages.yml) builds `dist/`, checks that all site assets and badge variants are present, and uploads the static package. The deployed site works at a GitHub Pages project subpath such as `/ai-badge/`.

GitHub Actions generates the badge catalog during the build. To generate a standalone copy locally, run `npm run generate:badges`. Git ignores the resulting `badges/` directory.
