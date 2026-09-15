# Kiku Studio — Next.js Rewrite Spec

Source of truth for the kiku-next build. The implementation plan argues from this file.

## Subject

Kiku Studio: handmade Mvule and Mahogany furniture, built to order at a Nairobi
workshop (Getathuru Road), delivered across Kenya. Sales happen on WhatsApp
(+254 741 205 945). Audience: Kenyan homeowners furnishing real rooms, buying
on trust, price confirmed before order.

## Design direction — "Straight off the bench"

The site reads like a well-run workshop's front room. Photography dominates,
chrome stays quiet, and every product carries a spec plate styled like a
workshop job card (Item · Wood · Size · Lead time) — the one bold move,
repeated. Everything else is disciplined.

### Tokens (Tailwind theme, exact values)

| Token | Hex | Role |
|---|---|---|
| papyrus | `#EFEDE6` | page ground (plaster, not beige) |
| ink | `#201913` | text, dark sections (walnut near-black) |
| upholstery | `#2C3F57` | accent — links, tags, primary CTA (from the sofa fabric) |
| mvule | `#C08A4E` | sparing warmth: rules, hovers, active states |
| shaving | `#D9CFC0` | borders, dividers |

### Type

- Display: **Zilla Slab** 600/700 — workshop-signage slab
- UI/body: **Archivo** 400/500/600
- Line length under 80 chars; sentence case everywhere; no ALL-CAPS eyebrows,
  no tracked labels, no `→` suffixes, no middle-dot meta strings.

### Layout

- Home: full-bleed hero photo, headline on a solid ink plate (no gradient
  scrim), job-card strip (wood → your size → we build → delivered), collections
  as alternating editorial rows (photo 60 / text 40, not uniform cards), two
  full-bleed grain panels for Mvule/Mahogany, workshop story, quiet testimonial
  list, FAQ `<details>`, ink CTA block with upholstery WhatsApp button.
- Product family pages: gallery-forward; every product row carries a bordered
  SpecPlate: item · wood · size range · lead time · price note ("confirmed on
  WhatsApp").
- One accent moment per screen. Motion: user-action transitions plus a single
  page-load hero reveal; `prefers-reduced-motion` respected.

## Page inventory (8 + 404)

| Route | Content source (old site, verified on disk) |
|---|---|
| `/` | `kiku/index.html` |
| `/collections` | `kiku/collections.html` (categories: sofas, beds, dining, tv-coffee) |
| `/collections/[cat]` | `kiku/collection.html` + product data |
| `/product/[slug]` | `kiku/product.html` |
| `/custom` | `kiku/custom.html` |
| `/about` | `kiku/about.html` |
| `/showroom` | `kiku/showroom.html` |
| `/contact` | `kiku/contact.html` |
| `not-found` | `kiku/404.html` |

## Global constraints

- Next.js (App Router) + TypeScript + Tailwind, `src/` dir, `@/*` alias.
- **Static export**: `output: 'export'`, `basePath: '/kiku'`,
  `images.unoptimized: true` (GitHub Pages at machirashalom.github.io/kiku).
- Zero runtime dependencies beyond React/Next. No animation library; CSS only.
- Every WhatsApp CTA uses wa.me/254741205945 with a context-specific
  pre-filled message (copy from old site, verbatim).
- Real copy only — ported verbatim from the old site; no invented testimonials
  or claims. Staged photos come from `kiku/images/`.
- JSON-LF FurnitureStore schema, sitemap.xml, robots.txt, OG tags preserved
  (values from old `index.html`).
- Quality floor: mobile responsive, visible keyboard focus, reduced motion,
  WCAG-AA contrast on token pairs.
