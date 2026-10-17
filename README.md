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

## Transparent product photo comparison

Branch `codex/transparent-products` starts from `dev` and uses transparent WebP cutouts for the 31 product/model images. Original JPEGs remain unchanged. Company exterior and workshop photographs retain their surroundings.

Cutouts are produced locally with rembg 2.0.85 and the BiRefNet-general model; masks were reviewed and pale tool faces manually restored where necessary. The site itself has no image-processing runtime dependency. Images keep the original dimensions and are displayed without separate background panels, so transparency shows the containing page's background color. Review this branch through its own Vercel Preview before choosing whether to merge it into `dev`.
