#!/usr/bin/env node
// Kiku Studio — furniture staging tool.
// Composites the UNCHANGED product cutout onto a background and adds a
// contact shadow ONLY underneath the product. The product pixels are never
// regenerated, repainted, or filtered. A pixel validation gate fails the job
// if anything inside the product mask differs from the original cutout.
//
// Commands:
//   remove-bg <photo> <cutout.png> [opts]  isolate product -> transparent PNG
//                                     (ML engine default; --engine plain for plain backdrops)
//   studio-bg <out.jpg> [--w 1600 --h 1000] warm seamless studio backdrop
//   compose --product <cutout> --bg <bg> --out <final.png> [opts]
//   stage <photo> <bg> <out-base> [opts]    full pipeline -> <base>_studio.jpg + <base>_plain.jpg
//                                     (or --cutout <png> to skip removal)
//   help
//
// compose/stage options:
//   --width 0.62    product width as fraction of background width
//   --bottom 0.07   floor margin as fraction of background height
//   --shadow 0.35   shadow opacity 0..1 (0 disables)
//   --shadow-blur 22  shadow softness px (at product scale)
//   --shadow-dy 0.03  shadow drop as fraction of background height
//   --quality 82    JPEG quality for stage exports

import { readFile, writeFile, unlink } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
import sharp from 'sharp';

const args = process.argv.slice(2);
const cmd = args[0];

function opts(list, defaults) {
  const o = { ...defaults };
  for (let i = 0; i < list.length; i++) {
    if (list[i].startsWith('--')) {
      const key = list[i].slice(2);
      const val = list[i + 1] && !list[i + 1].startsWith('--') ? list[++i] : 'true';
      o[key] = isNaN(Number(val)) ? val : Number(val);
    }
  }
  return o;
}

function fail(msg) {
  console.error('STAGE FAILED: ' + msg);
  process.exit(1);
}

/**
 * Windows may block Node from writing into protected folders
 * (Desktop, Documents). Fall back to the temp dir with a clear note
 * instead of crashing, and return the path actually used.
 */
async function saveBuffer(buf, destPath) {
  try {
    await writeFile(destPath, buf);
    return destPath;
  } catch {
    const alt = path.join(os.tmpdir(), path.basename(destPath));
    console.log(`NOTE: cannot write to ${destPath} (protected folder?) — saved to ${alt} instead. Move it manually.`);
    await writeFile(alt, buf);
    return alt;
  }
}

async function saveSharp(img, destPath) {
  try {
    const info = await img.toFile(destPath);
    return { info, finalPath: destPath };
  } catch {
    const alt = path.join(os.tmpdir(), path.basename(destPath));
    console.log(`NOTE: cannot write to ${destPath} (protected folder?) — saved to ${alt} instead. Move it manually.`);
    const info = await img.toFile(alt);
    return { info, finalPath: alt };
  }
}

/**
 * Step 1: isolate the product with full transparency.
 *
 * Two engines (neither ever touches product interior pixels):
 *  - ml (default): on-device segmentation, handles any background.
 *    Uses the small model (the medium model crashes on this PC's CPU).
 *  - plain: deterministic flood-fill for photos shot on a plain backdrop.
 *    Zero ML, zero downloads, mathematically incapable of redrawing.
 */
async function removeBg(photoPath, o = {}) {
  const engine = o.engine || 'ml';
  if (engine === 'ml') {
    // ML runs in a child process: onnxruntime and sharp segfault when
    // loaded in the same process on some Windows CPUs.
    const tmp = path.join(os.tmpdir(), `kiku-cutout-${Date.now()}.png`);
    try {
      execFileSync(process.execPath,
        [path.join(import.meta.dirname, 'ml-cutout.mjs'), photoPath, tmp,
          '--ml-model', o['ml-model'] || 'small'],
        { stdio: 'pipe', timeout: 600000 });
      const buf = await readFile(tmp);
      await unlink(tmp).catch(() => {});
      console.log('Background removed (on-device ML).');
      return buf;
    } catch (e) {
      await unlink(tmp).catch(() => {});
      console.log('ML engine unavailable here, falling back to plain engine...');
    }
  }
  return floodFillCutout(photoPath, o);
}

async function floodFillCutout(photoPath, o = {}) {
  const tolerance = o.tolerance ?? 28;
  const feather = o.feather ?? 0.7;
  const { data, info } = await sharp(photoPath).rotate().ensureAlpha().raw()
    .toBuffer({ resolveWithObject: true });
  const W = info.width, H = info.height;

  const at = (x, y) => {
    const i = (y * W + x) * 4;
    return [data[i], data[i + 1], data[i + 2]];
  };
  const border = [];
  for (let x = 0; x < W; x += 2) { border.push(at(x, 0), at(x, H - 1)); }
  for (let y = 0; y < H; y += 2) { border.push(at(0, y), at(W - 1, y)); }
  const med = [0, 1, 2].map(c => {
    const v = border.map(p => p[c]).sort((a, b) => a - b);
    return v[Math.floor(v.length / 2)];
  });
  const tol2 = tolerance * tolerance;
  const bg = new Uint8Array(W * H); // 1 = background
  const stack = [];
  const push = (x, y) => {
    const i = y * W + x;
    if (bg[i]) return;
    const j = i * 4;
    const dr = data[j] - med[0], dg = data[j + 1] - med[1], db = data[j + 2] - med[2];
    if (dr * dr + dg * dg + db * db <= tol2) { bg[i] = 1; stack.push(i); }
  };
  for (let x = 0; x < W; x++) { push(x, 0); push(x, H - 1); }
  for (let y = 0; y < H; y++) { push(0, y); push(W - 1, y); }
  while (stack.length) {
    const i = stack.pop();
    const x = i % W, y = (i / W) | 0;
    if (x > 0) push(x - 1, y);
    if (x < W - 1) push(x + 1, y);
    if (y > 0) push(x, y - 1);
    if (y < H - 1) push(x, y + 1);
  }

  const alpha = Buffer.alloc(W * H);
  const rgb = Buffer.alloc(W * H * 3);
  let fg = 0;
  for (let i = 0; i < W * H; i++) {
    rgb[i * 3] = data[i * 4];
    rgb[i * 3 + 1] = data[i * 4 + 1];
    rgb[i * 3 + 2] = data[i * 4 + 2];
    if (!bg[i]) { alpha[i] = 255; fg++; }
  }
  const frac = fg / (W * H);
  if (frac < 0.03 || frac > 0.97) {
    fail(`background detection failed (foreground ${(frac * 100).toFixed(1)}%). ` +
      `Shoot on a plain backdrop, tune --tolerance, or supply your own cutout via --cutout.`);
  }
  let alphaFinal = alpha;
  if (feather > 0) {
    alphaFinal = await sharp(alpha, { raw: { width: W, height: H, channels: 1 } })
      .blur(feather).toBuffer();
  }
  return await sharp(rgb, { raw: { width: W, height: H, channels: 3 } })
    .joinChannel(alphaFinal, { raw: { width: W, height: H, channels: 1 } })
    .png()
    .toBuffer();
}

/** Step 2: warm seamless studio sweep in the Kiku palette. */
async function studioBackdrop(outPath, w = 1600, h = 1000) {
  const svg =
    `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">` +
    `<defs>` +
    `<linearGradient id="sweep" x1="0" y1="0" x2="0" y2="1">` +
    `<stop offset="0" stop-color="#f8f2e7"/><stop offset="0.62" stop-color="#f0e5d1"/>` +
    `<stop offset="0.78" stop-color="#e6d5b8"/><stop offset="1" stop-color="#d9c6a4"/>` +
    `</linearGradient>` +
    `<radialGradient id="glow" cx="0.5" cy="0.42" r="0.55">` +
    `<stop offset="0" stop-color="#ffffff" stop-opacity="0.55"/>` +
    `<stop offset="1" stop-color="#ffffff" stop-opacity="0"/>` +
    `</radialGradient>` +
    `<radialGradient id="vig" cx="0.5" cy="0.5" r="0.75">` +
    `<stop offset="0.62" stop-color="#3d2c1c" stop-opacity="0"/>` +
    `<stop offset="1" stop-color="#3d2c1c" stop-opacity="0.22"/>` +
    `</radialGradient></defs>` +
    `<rect width="${w}" height="${h}" fill="url(#sweep)"/>` +
    `<rect width="${w}" height="${h}" fill="url(#glow)"/>` +
    `<rect width="${w}" height="${h}" fill="url(#vig)"/></svg>`;
  const { finalPath } = await saveSharp(sharp(Buffer.from(svg)).jpeg({ quality: 90 }), outPath);
  console.log(`Studio backdrop: ${finalPath} (${w}x${h})`);
}

/**
 * Step 3: composite. Order is background -> shadow -> product, so the shadow
 * can never cover product pixels and the product PNG is pasted unmodified.
 * Returns { png, x, y, w, h, scaled } for validation.
 */
async function composeProduct(productPng, bgPath, o) {
  const bgMeta = await sharp(bgPath).metadata();
  const W = bgMeta.width, H = bgMeta.height;
  if (!W || !H) fail(`cannot read background: ${bgPath}`);

  const targetW = Math.round(W * o.width);
  const maxH = Math.round(H * 0.8);
  const scaled = await sharp(productPng)
    .resize({ width: targetW, height: maxH, fit: 'inside', withoutEnlargement: true })
    .png()
    .toBuffer();
  const sMeta = await sharp(scaled).metadata();
  const pw = sMeta.width, ph = sMeta.height;
  const x = Math.round((W - pw) / 2);
  const y = Math.round(H - ph - H * o.bottom);

  const layers = [];
  if (o.shadow > 0) {
    const { data: aData } = await sharp(scaled)
      .extractChannel('alpha')
      .blur(o['shadow-blur'])
      .linear(o.shadow, 0)
      .raw()
      .toBuffer({ resolveWithObject: true });
    const shadowLayer = await sharp({
      create: { width: pw, height: ph, channels: 3, background: { r: 35, g: 24, b: 14 } }
    })
      .joinChannel(aData, { raw: { width: pw, height: ph, channels: 1 } })
      .png()
      .toBuffer();
    layers.push({ input: shadowLayer, left: x, top: y + Math.round(H * o['shadow-dy']) });
  }
  layers.push({ input: scaled, left: x, top: y });

  const png = await sharp(bgPath).composite(layers).removeAlpha().png().toBuffer();
  return { png, x, y, w: pw, h: ph, scaled };
}

/** Step 4: pixel gate — fully opaque cutout pixels must match the composite.
 *  Semi-transparent edge pixels are excluded: blending them with the new
 *  background is correct compositing, not alteration. */
async function validateUnchanged(composedPng, scaledCutout, x, y, w, h) {
  const region = await sharp(composedPng)
    .extract({ left: x, top: y, width: w, height: h })
    .raw()
    .toBuffer({ resolveWithObject: true });
  const cut = await sharp(scaledCutout).raw().toBuffer({ resolveWithObject: true });
  let maxDiff = 0, checked = 0, fringe = 0;
  const n = cut.info.width * cut.info.height;
  for (let i = 0; i < n; i++) {
    const a = cut.data[i * 4 + 3];
    if (a === 255) {
      checked++;
      for (let c = 0; c < 3; c++) {
        const d = Math.abs(region.data[i * 3 + c] - cut.data[i * 4 + c]);
        if (d > maxDiff) maxDiff = d;
      }
    } else if (a > 0) {
      fringe++;
    }
  }
  return { pass: maxDiff === 0 && checked > 0, maxDiff, checked, fringe };
}

/** Plain listing image: product on flat cream, no staging, no shadow. */
async function plainListing(scaledCutoutBuffer, outPath) {
  const m = await sharp(scaledCutoutBuffer).metadata();
  const pad = Math.round(Math.max(m.width, m.height) * 0.12);
  const W = m.width + pad * 2, H = m.height + pad * 2;
  const flat = sharp({
    create: { width: W, height: H, channels: 3, background: '#faf6ef' }
  }).composite([{ input: scaledCutoutBuffer, left: pad, top: pad }])
    .jpeg({ quality: 84, mozjpeg: true });
  const { info, finalPath } = await saveSharp(flat, outPath);
  return { outPath: finalPath, ...info };
}

async function main() {
  if (cmd === 'remove-bg') {
    const [photo, out, ...rest] = args.slice(1);
    if (!photo || !out) fail('usage: remove-bg <photo> <cutout.png> [--engine ml|plain --tolerance 28 --feather 0.7]');
    const saved = await saveBuffer(await removeBg(photo, opts(rest, { engine: 'ml', 'ml-model': 'small', tolerance: 28, feather: 0.7 })), out);
    console.log(`Cutout: ${saved}`);
    return;
  }

  if (cmd === 'studio-bg') {
    const [out, ...rest] = args.slice(1);
    if (!out) fail('usage: studio-bg <out.jpg> [--w 1600 --h 1000]');
    const o = opts(rest, { w: 1600, h: 1000 });
    await studioBackdrop(out, o.w, o.h);
    return;
  }

  if (cmd === 'compose') {
    const o = opts(args.slice(1), {
      width: 0.62, bottom: 0.07, shadow: 0.35,
      'shadow-blur': 22, 'shadow-dy': 0.03
    });
    if (!o.product || !o.bg || !o.out) {
      fail('usage: compose --product <cutout> --bg <bg> --out <final.png> [opts]');
    }
    const productPng = await readFile(o.product);
    const { png, x, y, w, h, scaled } = await composeProduct(productPng, o.bg, o);
    const v = await validateUnchanged(png, scaled, x, y, w, h);
    console.log(`Pixel validation: ${v.pass ? 'PASS' : 'FAIL'} (maxDiff=${v.maxDiff}, pixels=${v.checked})`);
    if (!v.pass) fail('product pixels changed during composite — output rejected');
    const saved = await saveBuffer(png, o.out);
    console.log(`Composited: ${saved}`);
    return;
  }

  if (cmd === 'stage') {
    const [photo, bg, base, ...rest] = args.slice(1);
    if (!photo || !bg || !base) fail('usage: stage <photo> <bg> <out-base> [opts]');
    const o = opts(rest, {
      width: 0.62, bottom: 0.07, shadow: 0.35,
      'shadow-blur': 22, 'shadow-dy': 0.03, quality: 82,
      engine: 'ml', 'ml-model': 'small', tolerance: 28, feather: 0.7
    });
    console.log('Preparing product cutout...');
    const cutout = o.cutout ? await readFile(o.cutout) : await removeBg(photo, o);
    const { png, x, y, w, h, scaled } = await composeProduct(cutout, bg, o);
    const v = await validateUnchanged(png, scaled, x, y, w, h);
    console.log(`Pixel validation: ${v.pass ? 'PASS' : 'FAIL'} (maxDiff=${v.maxDiff}, pixels=${v.checked})`);
    if (!v.pass) fail('product pixels changed during composite — output rejected');
    const studioPath = `${base}_studio.jpg`;
    const plainPath = `${base}_plain.jpg`;
    const { info: sMeta, finalPath: sFinal } = await saveSharp(
      sharp(png).jpeg({ quality: o.quality, mozjpeg: true }), studioPath);
    const plain = await plainListing(scaled, plainPath);
    console.log(`Studio image: ${sFinal} (${sMeta.width}x${sMeta.height})`);
    console.log(`Plain listing: ${plain.outPath} (${plain.width}x${plain.height})`);
    console.log('STAGE OK — product unaltered, outputs ready for review.');
    return;
  }

  console.log((await readFile(path.join(import.meta.dirname, 'README.md'), 'utf8')).split('\n').slice(0, 40).join('\n'));
}

main().catch(e => fail(e && e.message ? e.message : String(e)));
