# Radical Edge Static Ads Creator

A sharp, responsive proof-ad concept generator for Radical Edge. It turns WhatsApp messages, testimonials, analytics, revenue evidence, call notes, and anonymised case studies into complete 1080×1350 Meta ad concepts that are easy to rebuild in Canva.

## What it generates

- Ad angle, main headline, supporting line, and CTA
- A scaled 1080×1350 art-direction preview
- Proof asset requirements and visual layout
- Caption copy, three headline variants, and three CTA variants
- A concise rationale and copy-all output

All templates avoid identical-result promises and include appropriate context language.

## Local development

```bash
npm install
npm run dev
```

## Validation

```bash
npm run build
npm run build:pages
```

`npm run build` validates the hosted Vinext build. `npm run build:pages` creates a static export in `out/` for GitHub Pages.

## GitHub Pages

The included workflow publishes `out/` whenever `main` is updated. In the GitHub repository, set **Settings → Pages → Source** to **GitHub Actions** if it is not selected automatically.
