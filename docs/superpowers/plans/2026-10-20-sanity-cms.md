# TCS Sanity CMS Implementation Plan

**Goal:** Let the customer edit bilingual text, product galleries, clients and equipment through Sanity without changing the approved website design.

**Architecture:** Preserve the static site as templates. Extract public content into structured seed documents, render published Sanity content during the Vercel build, and build a same-origin Sanity Studio at `/admin/`. Use a separate development dataset, never write production. Provide authenticated Studio document previews by sending document values to a same-origin preview iframe, never browser read tokens. Publishing triggers only the dev deploy hook until a separate production release is authorized.

- [x] Create structured public content and reversible seed/import tooling.
- [x] Create bilingual Sanity schemas and customer-facing Korean navigation.
- [x] Integrate build-time content rendering, photos, gallery order and client links.
- [x] Add Studio draft preview and dev publishing/rebuild integration.
- [x] Connect account, development project/dataset, assets and Studio CORS.
- [x] Verify content edits, bilingual rendering, image navigation, SEO and production isolation; deploy dev preview.

Production activation, production dataset and main merge remain out of scope.

Verified: 8 renderer tests, Studio schema/build, real authenticated draft preview, original value restored and published, development deploy hook fired, main and production unchanged.
