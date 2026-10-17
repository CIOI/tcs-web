# TCS detail pages implementation plan

Goal: Extend the approved TCS site structure using company-deck evidence, on dev only.
Architecture: Buildless static pages with shared header/footer/styles and JS. Generate HTML at development time with a reproducible Python script; runtime remains plain JavaScript. Use existing client-side language switching, with a centralized dictionary. Vercel production branch remains main; push only dev for preview.

- [x] Map deck images to captions from OOXML object positions; copy web-sized assets with provenance.
- [x] Create shared five-item navigation with desktop dropdowns and mobile disclosure menus.
- [x] Add company overview, representative career, four service pages, cases gallery, equipment and contact pages.
- [x] Add case filters and keyboard-accessible native dialog for image enlargement.
- [x] Preserve email-copy behavior, Google map, Korean/English selection, home partner carousel and production SEO.
- [x] Expand asset/link verification across all pages; verify direct routes, mobile overflow, navigation, translations, filters and dialog.
- [ ] Commit and push dev only; verify Vercel preview is READY and production main/domain remain unchanged.

Content: Use supplied deck. Do not invent detailed production steps, certification, tolerances or performance claims. Service pages label generic design review points as review items rather than claiming an undocumented production workflow. Do not publish financials, workforce figures or customer project linkage. Pictures use source captions; avoid claiming exact design/manufacture scope per photo beyond source caption.
