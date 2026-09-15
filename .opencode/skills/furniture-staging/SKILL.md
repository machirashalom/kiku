---
name: furniture-staging
description: Create staged room or studio images from real furniture photos without altering the product itself. Use when the user supplies a product photograph and wants a lifestyle or studio listing image, or asks to stage furniture photos.
---

# Furniture Staging

Turn real product photographs into staged setting images while keeping the
product pixel-identical. Never regenerate or repaint the product.

## Tooling

All work goes through the project tool — never a generative image edit of
the product:

- Full pipeline: `node tools/staging/stage.mjs stage <photo> <background> <out-base> [options]`
- Steps: `remove-bg`, `studio-bg`, `compose` (see `tools/staging/README.md`)

Run commands from the project root. `npm install` inside `tools/staging`
first if dependencies are missing.

## Immutable rules

1. The supplied product photo (or its background-removed PNG) is immutable.
2. Never regenerate, repaint, inpaint, recolour, reshape, crop into, rotate,
   upscale-enhance, or apply AI filters to pixels inside the product mask.
3. Background removal may only delete the original background. The tool
   defaults to on-device ML segmentation (any background); use
   `--engine plain` for plain-backdrop shots, or `--cutout` with a
   user-supplied PNG. If an edge looks wrong (thin legs, glass, fringe),
   re-shoot that piece on a plain backdrop or hand-fix the cutout — never
   paint over the problem.
4. Compose order is background, then shadow, then product — shadow and light
   effects live on the background layer only and must never cover the product.
5. Do not stretch, squeeze, or warp the product to fit a background. If the
   camera angle or perspective does not match, reject the background and use
   another one (the built-in warm `studio-bg` sweep is the safe default).
6. The pixel validation gate is mandatory. `stage` and `compose` print
   `Pixel validation: PASS/FAIL`. On FAIL, delete the outputs and retry with
   a different background — never publish them.
7. Every job produces two files: `<base>_studio.jpg` (staged) and
   `<base>_plain.jpg` (flat cream listing image). Recommend the plain image
   for product listings; the staged image may carry the caption
   "Styled setting — product shown for illustration."
8. Ask for: the real product photo, the desired background (or use
   `studio-bg`), and the output name. Photograph straight-on plus 45° left
   and right and detail close-ups for best angle matching.
9. Report filenames, dimensions, and the validation result. Remind the user
   to eyeball the final image against the real piece before publishing.

## Separating pieces from a group photo

Use `node tools/staging/stage.mjs separate <photo> <out-base>` when one
photo holds several pieces. The tool writes one transparent PNG plus one
plain listing JPG per detected piece and prints a verdict per piece.

1. Only visible pixels are ever assigned. Hidden parts stay transparent
   holes — never inpainted, never invented.
2. Respect every verdict: `OK` may be used; `OVERLAPS` needs edge
   inspection; `EDGE-CROPPED`, `TINY FRAGMENT`, and severe `SOFT EDGES`
   mean re-shoot that piece solo for its listing.
3. Never present a separated PNG with holes or ragged shared edges as a
   finished product shot. It is a preview until the user approves it.
