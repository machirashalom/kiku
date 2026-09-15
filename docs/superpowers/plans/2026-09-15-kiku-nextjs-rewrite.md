# Kiku Next.js Rewrite Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the 8-page Kiku Studio marketing site as a static-exported Next.js app with the "Straight off the bench" design system.

**Architecture:** App Router with a typed data layer (`src/lib/data.ts`) holding categories, products, testimonials and FAQs; shared chrome (Header, Footer, SpecPlate) as server components; pure CSS/Tailwind motion. No runtime deps beyond React/Next.

**Tech Stack:** Next.js 15 (App Router, TypeScript, `src/` dir, `@/*` alias), Tailwind CSS v4 (CSS-first `@theme` tokens), `next/image` (unoptimized for export).

**Spec:** `docs/superpowers/specs/2026-09-15-kiku-redesign.md`

## Global Constraints

- Static export: `output: 'export'`, `basePath: '/kiku'`, `images.unoptimized: true`.
- Tokens exactly: papyrus `#EFEDE6`, ink `#201913`, upholstery `#2C3F57`, mvule `#C08A4E`, shaving `#D9CFC0`.
- Fonts: Zilla Slab (display, 600/700), Archivo (body, 400/500/600). Google Fonts via `next/font`.
- WhatsApp number `254741205945`; CTAs use context-prefilled wa.me links ported verbatim from the old site.
- Real copy only, ported from `C:\Users\Coast Values\Desktop\kiku\` HTML files. No invented content.
- Old site is read-only reference. All work happens in `C:\Users\Coast Values\Desktop\kiku-next\`.
- Commit after every task. `npm run build` must pass before each commit.

---

### Task 1: Design tokens and fonts

**Files:**
- Modify: `src/app/globals.css`, `src/app/layout.tsx`

**Interfaces:**
- Produces: Tailwind theme utilities `bg-papyrus`, `text-ink`, `bg-ink`, `text-upholstery`, `bg-upholstery`, `border-shaving`, `text-mvule`, `bg-mvule`, font utilities `font-display`, `font-body`; CSS vars `--color-papyrus` etc. All later tasks consume these.

- [ ] **Step 1: Replace `src/app/globals.css` theme block**

```css
@import "tailwindcss";

@theme {
  --color-papyrus: #EFEDE6;
  --color-ink: #201913;
  --color-upholstery: #2C3F57;
  --color-mvule: #C08A4E;
  --color-shaving: #D9CFC0;
  --font-display: var(--font-zilla), Georgia, serif;
  --font-body: var(--font-archivo), system-ui, sans-serif;
}

html { scroll-behavior: smooth; }
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  *, *::before, *::after { animation: none !important; transition: none !important; }
}
body { background: var(--color-papyrus); color: var(--color-ink); font-family: var(--font-body); }
```

Delete the default Tailwind starter utilities/demos from the template; keep only the above.

- [ ] **Step 2: Wire fonts in `src/app/layout.tsx`**

```tsx
import { Zilla_Slab, Archivo } from "next/font/google";
const zilla = Zilla_Slab({ subsets: ["latin"], weight: ["600", "700"], variable: "--font-zilla" });
const archivo = Archivo({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-archivo" });
```

Add `zilla.variable` and `archivo.variable` to the `<html className>`. Set `<body>` to `font-body antialiased`.

- [ ] **Step 3: Verify**

Run: `npm run build`
Expected: build succeeds with no missing-variable warnings.

- [ ] **Step 4: Commit** — `git add -A && git commit -m "feat: design tokens and fonts"`

---

### Task 2: Data layer

**Files:**
- Create: `src/lib/data.ts`

**Interfaces:**
- Produces: `export type Category = { slug: "sofas" | "beds" | "dining" | "tv-coffee"; name: string; blurb: string; image: string }`; `export type Product = { slug: string; name: string; category: Category["slug"]; wood: "Mvule" | "Mahogany" | "Mvule & Mahogany"; sizes: string; leadTime: string; image: string; description: string }`; `export const categories: Category[]`, `export const products: Product[]`, `export const testimonials`, `export const faqs`, `export const SITE = { phone: "+254741205945", whatsapp: "https://wa.me/254741205945", email: "machirashalom@gmail.com", address: "Getathuru Road, Nairobi" }`.

- [ ] **Step 1: Write `src/lib/data.ts`** with categories (names/blurbs from `kiku/index.html` category cards, verbatim: "Sofa Sets & L-Seats", "Beds", "Dining Sets", "TV Stands & Coffee Tables"), images from `kiku/images/` (sofa.jpg, bed.jpg, dining.jpg, tvstand.jpg). Port `testimonials` (Amina/James/Faith) and `faqs` (4 items) verbatim from `kiku/index.html` lines 194–244. `products`: read `C:\Users\Coast Values\Desktop\kiku\collections.html` and `collection.html`, port every product name, size note and price note verbatim into `Product` rows; images available: sofa.jpg, sofa-l.jpg, bed.jpg, bed-2.jpg, dining.jpg, dining-2.jpg, coffee.jpg, tvstand.jpg.

- [ ] **Step 2: Verify** — Run: `npx tsc --noEmit`. Expected: no errors.

- [ ] **Step 3: Commit** — `git commit -m "feat: typed data layer"`

---

### Task 3: Shared chrome — Header, Footer, WhatsApp float

**Files:**
- Create: `src/components/Header.tsx`, `src/components/Footer.tsx`, `src/components/WhatsAppFloat.tsx`
- Modify: `src/app/layout.tsx`

**Interfaces:**
- Produces: `<Header />` (nav: Home, Collections, Custom Orders, About, Showroom, Contact + "Chat on WhatsApp" button, mobile menu), `<Footer />` (brand, Explore, Contact, Visit columns — copy verbatim from `kiku/index.html` footer), `<WhatsAppFloat />` (floating button + mobile bottom bar, SVG from `kiku/index.html` line 294).

- [ ] **Step 1: Build the three components.** Header: ink text on papyrus, `font-display` logo "Kiku Studio", underline active route with mvule. Mobile menu as a CSS-only `<details>` or checkbox toggle (no JS state). Footer: ink background, papyrus text. All links use `next/link` with the `/kiku` basePath implicit.

- [ ] **Step 2: Add to layout** — `<Header />` above `{children}`, `<WhatsAppFloat />` and `<Footer />` below.

- [ ] **Step 3: Verify** — `npm run build`, then `npm start` and load `/` — nav renders all 6 links, footer all 4 columns.

- [ ] **Step 4: Commit** — `git commit -m "feat: site chrome"`

---

### Task 4: SpecPlate component

**Files:**
- Create: `src/components/SpecPlate.tsx`

**Interfaces:**
- Produces: `export function SpecPlate({ item, wood, sizes, leadTime }: { item: string; wood: string; sizes: string; leadTime: string })` — a bordered job-card strip: 1px `border-ink`, papyrus ground, four labelled fields (Item / Wood / Size / Lead time) with `font-display` values and small sentence-case labels, plus a right-aligned "Price on WhatsApp" note in upholstery.

- [ ] **Step 1: Implement** as a definition list `<dl>` grid, responsive 2-col on mobile / 4-col on desktop.

- [ ] **Step 2: Verify** — `npx tsc --noEmit` passes; render it temporarily on home to eyeball.

- [ ] **Step 3: Commit** — `git commit -m "feat: spec plate component"`

---

### Task 5: Home page

**Files:**
- Modify: `src/app/page.tsx`
- Create: `src/components/home/*` (Hero, JobStrip, CollectionRow, WoodPanels, Story, Testimonials, Faq, CtaBlock) — one file each, small.

**Interfaces:**
- Consumes: `categories`, `testimonials`, `faqs`, `SITE` from `src/lib/data.ts`; `SpecPlate` pattern (not on home).

- [ ] **Step 1: Hero** — full-bleed `next/image` of `images/hero.jpg` (copy `kiku/images/*.jpg` into `kiku-next/public/images/` first), headline "Handmade Mvule & Mahogany furniture, built to order in Nairobi" on a solid ink plate bottom-left (no scrim gradient), sub-copy and two CTAs (Explore the collections → `/collections`; WhatsApp Us → wa.me link from old site line 77). One page-load reveal animation (CSS keyframe fade/translate, reduced-motion safe).

- [ ] **Step 2: JobStrip** — the order process as four job-card cells: "Choose the wood · Mvule or Mahogany", "Your size · built to your room", "We build · by hand in Nairobi", "Delivered · anywhere in Kenya". Bordered, no icons needed.

- [ ] **Step 3: Collection rows** — `categories.map` rendered as alternating rows (image 60% left/right alternating, text 40%: name, blurb, "View collection" link in upholstery). Copy from old category cards.

- [ ] **Step 4: WoodPanels** — two full-bleed panels (mvule/mahogany grain images, wood-mvule.jpg / wood-mahogany.jpg) with the "Why Mvule and Mahogany?" copy verbatim from old lines 149–172.

- [ ] **Step 5: Story + Testimonials + FAQ + CTA** — workshop.jpg + about copy (old lines 174–186); testimonials as a quiet list (names + towns, no cards); FAQ as `<details>` (old lines 221–245); final CTA ink block with the two buttons from old lines 247–256.

- [ ] **Step 6: Verify** — `npm run build`; `npm start`; check `/` renders all sections, links resolve, images load.

- [ ] **Step 7: Commit** — `git commit -m "feat: home page"`

---

### Task 6: Collections + category + product pages

**Files:**
- Create: `src/app/collections/page.tsx`, `src/app/collections/[cat]/page.tsx`, `src/app/product/[slug]/page.tsx`

**Interfaces:**
- Consumes: `categories`, `products` from data layer; `SpecPlate`.

- [ ] **Step 1: `/collections`** — grid of 4 category links (image + name), copy from `kiku/collections.html`.
- [ ] **Step 2: `/collections/[cat]`** — `generateStaticParams` for the 4 slugs; product list where each entry = image, name, description, `<SpecPlate item={p.name} wood={p.wood} sizes={p.sizes} leadTime={p.leadTime} />`, WhatsApp enquiry link with prefilled message naming the product.
- [ ] **Step 3: `/product/[slug]`** — `generateStaticParams` over products; large image left / copy + SpecPlate + WhatsApp CTA right; "Also in this collection" links.
- [ ] **Step 4: Verify** — build lists all static routes (`/kiku/collections/sofas` etc. in output); click-through works.
- [ ] **Step 5: Commit** — `git commit -m "feat: collections and product routes"`

---

### Task 7: Custom, About, Showroom, Contact, 404

**Files:**
- Create: `src/app/custom/page.tsx`, `src/app/about/page.tsx`, `src/app/showroom/page.tsx`, `src/app/contact/page.tsx`, `src/app/not-found.tsx`

- [ ] **Step 1–5:** Port each page's copy verbatim from its old HTML file (`kiku/custom.html`, `about.html`, `showroom.html`, `contact.html`, `404.html`), styled with the token system: `font-display` headings, spec-plate borders where content is procedural (custom order steps), images from `kiku/images/`. Contact page keeps tel/wa.me/mailto links and the Getathuru Road visit note.
- [ ] **Step 6: Verify** — `npm run build`; each route returns its ported copy.
- [ ] **Step 7: Commit** — `git commit -m "feat: content pages"`

---

### Task 8: SEO, metadata, JSON-LD

**Files:**
- Modify: `src/app/layout.tsx`, `src/app/page.tsx` and each page's `metadata`
- Create: `src/app/sitemap.ts`, `src/app/robots.ts`

- [ ] **Step 1:** Root metadata from old `index.html` head (title "Kiku Studio — Handmade Mvule & Mahogany Furniture, Nairobi", description, OG tags, `metadataBase` to `https://machirashalom.github.io/kiku/`); FurnitureStore JSON-LD script from old lines 22–38 into layout; `sitemap.ts` listing all routes incl. dynamic cat/product pages; `robots.ts` allowing all, sitemap reference.
- [ ] **Step 2: Verify** — build output contains `sitemap.xml` and `robots.txt`; view-source shows JSON-LD.
- [ ] **Step 3: Commit** — `git commit -m "feat: seo metadata and structured data"`

---

### Task 9: Static export + final verification

**Files:**
- Modify: `next.config.ts`

- [ ] **Step 1:** `const nextConfig: Next.Config = { output: "export", basePath: "/kiku", images: { unoptimized: true } };`
- [ ] **Step 2:** Run `npm run build`; confirm `out/` contains `index.html` plus all routes under `collections/`, `product/` etc.
- [ ] **Step 3:** Serve locally: `npx serve out -l 4173` and click through every page at `http://localhost:4173/kiku/` — nav, images, WhatsApp links, 404.
- [ ] **Step 4:** Run `npx eslint src --max-warnings 0`; fix anything.
- [ ] **Step 5: Commit** — `git commit -m "feat: static export configuration"`

---

## Self-review (done)

- Spec coverage: 8 pages + 404 ✓ (Tasks 5–7), tokens ✓ (1), type ✓ (1), spec plates ✓ (4,6), export/deploy ✓ (9), SEO ✓ (8), WhatsApp CTAs ✓ (3,5,6,7), quality floor ✓ (1 reduced-motion, 3 focus, 9 click-through).
- Placeholders: none — every content step names its exact source file and line range in the old repo; data model inlines known copy; product porting instructions specify the verbatim rule and the target type.
- Type consistency: `Category["slug"]` used consistently; `Product.category` matches; `SITE.whatsapp` consumed by Header/FloatingButton/CTAs; `SpecPlate` props identical in definition and Task 6 usage.
