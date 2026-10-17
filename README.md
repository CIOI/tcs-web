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

GitHub Actions checks JavaScript syntax, local assets and section links on pull requests and pushes to `main`. Once Vercel Git integration is connected, merging into `main` triggers production deployment; other branches receive preview deployments.

The GitHub check and Vercel deployment run independently. A required merge check can be enabled in repository branch rules if desired. Private company research is excluded from Git and deployment output.
