# Furniture staging tool (Kiku Studio)

Creates room/studio setting images from real product photos **without
altering the product itself**. Compositing only: the product PNG is pasted
unchanged, a contact shadow is drawn underneath it, and a pixel gate fails
the job if any product pixel differs from the original cutout.

## Setup

```bash
cd tools/staging
npm install
```

## Background removal: two engines

- **ml (default)** — on-device segmentation that handles any background:
  showroom floors, living rooms, outdoor shots. First run downloads model
  data; everything stays on your PC afterwards. Uses the small model (fast,
  reliable here — the medium model crashes on this PC's CPU).
- **plain (`--engine plain`)** — deterministic flood-fill for photos shot
  on a plain backdrop. No AI, no downloads; mathematically incapable of
  redrawing the product. Tune with `--tolerance` (default 28) and
  `--feather` (default 0.7).

Neither engine touches product interior pixels — removal only ever deletes
background. If ML misreads an edge (thin legs, glass, fringe), either shoot
that piece on a plain backdrop with `--engine plain`, or supply your own
cutout with `--cutout` (phone background-eraser apps and Photoshop both work).

## Usage

```bash
# 1. Full pipeline: photo + background -> staged + plain listing images
node stage.mjs stage <product-photo.jpg> <background.jpg> <output-base> [options]

# 2. Individual steps
node stage.mjs remove-bg <product-photo.jpg> <cutout.png>
node stage.mjs studio-bg <backdrop.jpg> [--w 1600 --h 1000]
node stage.mjs compose --product <cutout.png> --bg <bg.jpg> --out <final.png> [options]
```

Options: `--width 0.62` (product width fraction), `--bottom 0.07`
(floor margin fraction), `--shadow 0.35` (0 disables), `--shadow-blur 22`,
`--shadow-dy 0.03`, `--quality 82`.

## Workflow

1. Photograph each piece straight-on (plus 45° left/right and details).
   Even daylight; fill the frame. Plain backdrops give the cleanest edges,
   but the ML engine handles real rooms too.
2. Generate a studio sweep (`studio-bg`) or supply an empty-room photo
   whose camera angle matches the product photo. Never stretch the product
   to fit a background — pick another background instead.
3. Run `stage`. It writes `<base>_studio.jpg` and `<base>_plain.jpg`.
4. Check `Pixel validation: PASS` in the output. On FAIL the files are
   rejected — do not use them.
5. Review the staged image yourself before publishing: proportions, wood
   tone, and shadow must look honest next to the real piece.

## Rules

- The product cutout is immutable: no repaint, recolour, reshape,
  enhancement, or generative fill inside its mask. Ever.
- Shadows, light, and decoration go on the background layer only.
- Website listings use the `_plain` image; the `_studio` image may be
  captioned "Styled setting — product shown for illustration."
