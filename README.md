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

## Local proof reading backend

The proof reader is a local/server backend route at `/api/read-proof`. It uses OpenAI to read screenshots, PDFs, or pasted proof text, then returns a review-only proof object. It does not approve proof for ads automatically.

Create `.env.local`:

```bash
OPENAI_API_KEY="your_api_key_here"
OPENAI_PROOF_MODEL="gpt-5-mini"
```

Then restart:

```bash
npm run dev
```

Use the Proof reader panel to upload a PNG, JPG, WEBP, PDF, or paste manual proof text. Review the raw extracted text, public claim, headline options, blur list, and risk notes before adding anything to the proof database.

GitHub Pages is static, so the proof reader backend only works in local/server mode.

## Validation

```bash
npm run build
npm run build:pages
```

`npm run build` validates the hosted Vinext build. `npm run build:pages` creates a static export in `out/` for GitHub Pages.

## GitHub Pages

The included workflow publishes `out/` whenever `main` is updated. In the GitHub repository, set **Settings → Pages → Source** to **GitHub Actions** if it is not selected automatically.
