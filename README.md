# TCS — Total Casting Solution

티시에스 회사 홈페이지 디자인 초안. 정적 HTML/CSS/JavaScript 사이트입니다.

## Local preview

```sh
python3 -m http.server 4173 --directory site/dist
```

## Verification

```sh
node --check site/dist/app.js
python3 scripts/check-site.py
```

## Vercel Git deployment

- Repository: `CIOI/tcs-web`
- Production branch: `main`
- Root Directory: `site/dist`
- Framework: Other
- Build command: `node --check app.js`
- Output directory: `.`
- Install command: empty

GitHub Actions checks JavaScript syntax, local assets and section links on pull requests and pushes to `main`. Vercel Git integration is connected to `ciois-projects/tcs-web`. Production branch is `main`: merging into `main` triggers production deployment; other branches receive preview deployments.

Project dashboard: https://vercel.com/ciois-projects/tcs-web

The GitHub check and Vercel deployment run independently. A required merge check can be enabled in repository branch rules if desired. Private company research is excluded from Git and deployment output.

## Search indexing

Canonical production URL: https://tcscast.com/

The static HTML includes Korean search metadata, social sharing metadata, and
LocalBusiness/WebSite JSON-LD using the public company details on the page.
The language switch is client-side; it does not create separate English URLs.
Only the homepage belongs in the sitemap; section fragments are not separate pages.

After deployment, verify the domain in Google Search Console, submit
`https://tcscast.com/sitemap.xml`, and use URL Inspection to request indexing of
`https://tcscast.com/`. Domain verification requires the owner's Google account
and a DNS TXT record (or the verification file/meta tag supplied by Google).
Do not add a fabricated verification token. Indexing and rankings are determined
by Google, and are not guaranteed by these settings.

## Development preview

New detail pages are developed on `dev`. Push `dev` for a Vercel Preview deployment only. The custom domains stay on production branch `main`; do not merge until the design is approved.

Detail pages: `about.html`, `career.html`, `casting.html`, `patterns.html`, `foam-trimming.html`, `jigs.html`, `projects.html`, `equipment.html`, `contact.html`. New detail pages currently carry `noindex, nofollow` for review; revisit indexability and sitemap before releasing them.

## Mixed image comparison

Branch `codex/mixed-product-images` starts directly from `dev`. Real product/mold photographs fill their card frames with a centered CSS crop; the zoom dialog loads the complete original JPEG without cropping. Twelve CAD images use transparent WebP cutouts from the previous background-removal comparison, with transparent card/hero backgrounds. Company exterior/workshop photographs are unchanged.

## Sanity content management (development only)

The CMS integration lives in `site/dist/cms/`. `content/seed.json` contains only public website content, extracted from the approved static templates. The existing HTML files remain the templates. `npm ci --prefix site/dist` installs the locked editor/build dependencies; `npm --prefix site/dist test` checks gallery ordering/removal, bilingual fields, original images and safe content rendering.

Run `npm --prefix site/dist run build` without cloud configuration for a local seed preview, then serve `site/dist/public`. With `SANITY_STUDIO_PROJECT_ID` and `SANITY_STUDIO_DATASET=development`, builds read published CMS documents and compile the authenticated Studio at `/admin/`. A remote build refuses to use the local seed silently; a preview also refuses the production dataset. Read/write tokens must never use the `SANITY_STUDIO_` prefix.

For initial setup, create a Sanity development dataset, authenticate the CLI, and import once using `SANITY_API_TOKEN` with `npm --prefix site/dist run cms:import`. The importer uploads original public assets and refuses to overwrite existing customer documents. Add the exact preview origins to Sanity CORS with credentials. Configure a Vercel deploy hook for the CMS branch/dev only, then register a Sanity document webhook on the development dataset, excluding drafts, for the five document types. Keep the hook URL secret.

Draft previews render the currently edited document in a same-origin iframe inside the authenticated Studio. No API token is embedded in website HTML or the preview. Publish events rebuild static HTML for search engines, preserving original gallery navigation. This is a form-based CMS with document preview, not click-to-edit overlays on the public website.

Customer guide: [docs/content/sanity-editor-guide.md](docs/content/sanity-editor-guide.md). Main and the purchased domains must not be changed as part of CMS setup.
