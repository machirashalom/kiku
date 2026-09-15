// YOLO instance-segmentation worker (no sharp here: onnxruntime and sharp
// segfault together on some Windows CPUs).
// Usage: node yolo-seg.mjs <photo> <out-dir> [--conf 0.35]
// Writes instances.json + prob-<i>.bin (Float32 160x160) into out-dir.
// Prints SEG_OK <count>.
import * as ort from 'onnxruntime-node';
import { readFile, writeFile, mkdir, access } from 'node:fs/promises';
import path from 'node:path';
import jpeg from 'jpeg-js';
import { PNG } from 'pngjs';

const COCO = ['person','bicycle','car','motorcycle','airplane','bus','train','truck','boat','traffic light','fire hydrant','stop sign','parking meter','bench','bird','cat','dog','horse','sheep','cow','elephant','bear','zebra','giraffe','backpack','umbrella','handbag','tie','suitcase','frisbee','skis','snowboard','sports ball','kite','baseball bat','baseball glove','skateboard','surfboard','tennis racket','bottle','wine glass','cup','fork','knife','spoon','bowl','banana','apple','sandwich','orange','broccoli','carrot','hot dog','pizza','donut','cake','chair','couch','potted plant','bed','dining table','toilet','tv','laptop','mouse','remote','keyboard','cell phone','microwave','oven','toaster','sink','refrigerator','book','clock','vase','scissors','teddy bear','hair drier','toothbrush'];
const FRIENDLY = { chair: 'chair-stool', couch: 'sofa', bed: 'bed', 'dining table': 'table' };

const [photo, outDir, ...rest] = process.argv.slice(2);
let conf = 0.35;
for (let i = 0; i < rest.length; i++) {
  if (rest[i] === '--conf' && rest[i + 1]) conf = Number(rest[++i]);
}
if (!photo || !outDir) {
  console.error('usage: yolo-seg.mjs <photo> <out-dir> [--conf 0.35]');
  process.exit(2);
}

function decode(buf, photoPath) {
  const ext = photoPath.toLowerCase();
  if (ext.endsWith('.png')) {
    const p = PNG.sync.read(Buffer.from(buf));
    return { w: p.width, h: p.height, rgba: true, data: p.data };
  }
  const j = jpeg.decode(buf, { useTArray: true, formatAsRGBA: false });
  return { w: j.width, h: j.height, rgba: false, data: j.data };
}

function sigmoid(x) { return 1 / (1 + Math.exp(-x)); }

function iou(a, b) {
  const x1 = Math.max(a[0], b[0]), y1 = Math.max(a[1], b[1]);
  const x2 = Math.min(a[2], b[2]), y2 = Math.min(a[3], b[3]);
  const inter = Math.max(0, x2 - x1) * Math.max(0, y2 - y1);
  const ua = (a[2] - a[0]) * (a[3] - a[1]) + (b[2] - b[0]) * (b[3] - b[1]) - inter;
  return ua <= 0 ? 0 : inter / ua;
}

async function main() {
  const buf = await readFile(photo);
  const img = decode(new Uint8Array(buf), photo);
  const W = img.w, H = img.h;
  const S = 640;
  const scale = Math.min(S / W, S / H);
  const nw = Math.round(W * scale), nh = Math.round(H * scale);
  const padL = Math.floor((S - nw) / 2), padT = Math.floor((S - nh) / 2);

  // letterboxed RGB float32 NCHW
  const input = new Float32Array(1 * 3 * S * S);
  const chOff = S * S;
  const px = (sx, sy, c) => {
    const X = Math.min(W - 1, Math.max(0, Math.floor(sx))), Y = Math.min(H - 1, Math.max(0, Math.floor(sy)));
    const i = (Y * W + X) * (img.rgba ? 4 : 3) + c;
    return img.data[i] / 255;
  };
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const sx = (x - padL + 0.5) / scale - 0.5, sy = (y - padT + 0.5) / scale - 0.5;
      let r = 114 / 255, g = 114 / 255, b = 114 / 255;
      if (sx >= 0 && sx < W && sy >= 0 && sy < H) { r = px(sx, sy, 0); g = px(sx, sy, 1); b = px(sx, sy, 2); }
      const i = y * S + x;
      input[i] = r; input[chOff + i] = g; input[2 * chOff + i] = b;
    }
  }

  const modelPath = path.join(import.meta.dirname, 'models', 'yolo11n-seg.onnx');
  try {
    await access(modelPath);
  } catch {
    console.log('Downloading piece-detection model (~12MB, one-time)...');
    await mkdir(path.join(import.meta.dirname, 'models'), { recursive: true });
    const res = await fetch('https://github.com/ultralytics/assets/releases/download/v8.4.0/yolo11n-seg.onnx');
    if (!res.ok) throw new Error('model download failed: HTTP ' + res.status);
    await writeFile(modelPath, Buffer.from(await res.arrayBuffer()));
  }
  const session = await ort.InferenceSession.create(modelPath, { logSeverityLevel: 3 });
  let detKey = null, protoKey = null;
  for (const n of session.outputNames) {
    const meta = session.outputMetadata.find(m => m.name === n);
    if (!meta) continue;
    const d = meta.shape;
    if (d.length === 3 && d[1] === 116) detKey = n;
    if (d.length === 4 && d[1] === 32) protoKey = n;
  }
  if (!detKey || !protoKey) throw new Error('unexpected model outputs: ' + session.outputNames.join(','));
  const feeds = {};
  feeds[session.inputNames[0]] = new ort.Tensor('float32', input, [1, 3, S, S]);
  const out = await session.run(feeds);
  const det = out[detKey].data; // [116, 8400] (batch squeezed or [1,116,8400])
  const detArr = det.length === 116 * 8400 ? det : det.slice(0, 116 * 8400);
  const proto = out[protoKey].data; // 32*160*160
  const P = 160, P2 = P * P;

  // decode detections
  const NC = 80, NM = 32, N = 8400;
  const cands = [];
  for (let i = 0; i < N; i++) {
    let best = -1, bestCls = -1;
    for (let c = 0; c < NC; c++) {
      const s = detArr[(4 + c) * N + i];
      if (s > best) { best = s; bestCls = c; }
    }
    if (best < 0.25) continue;
    const cx = detArr[i], cy = detArr[N + i], w = detArr[2 * N + i], h = detArr[3 * N + i];
    cands.push({
      box: [cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2],
      score: best, cls: bestCls,
      coeff: Array.from({ length: NM }, (_, c) => detArr[(4 + NC + c) * N + i])
    });
  }
  cands.sort((a, b) => b.score - a.score);

  // class-aware NMS
  const kept = [];
  for (const c of cands) {
    if (c.score < conf && kept.length > 0) continue;
    let dup = false;
    for (const k of kept) {
      if (k.cls === c.cls && iou(k.box, c.box) > 0.5) { dup = true; break; }
    }
    if (!dup) kept.push(c);
    if (kept.length >= 30) break;
  }
  const final = kept.filter(k => k.score >= conf).slice(0, 12);

  await mkdir(outDir, { recursive: true });
  const instances = [];
  for (let idx = 0; idx < final.length; idx++) {
    const d = final[idx];
    // 160x160 probability grid: sigmoid(coeff . protos)
    const grid = new Float32Array(P2);
    for (let p = 0; p < P2; p++) {
      let s = 0;
      for (let c = 0; c < NM; c++) s += d.coeff[c] * proto[c * P2 + p];
      grid[p] = sigmoid(s);
    }
    await writeFile(path.join(outDir, `prob-${idx}.bin`), Buffer.from(grid.buffer));
    // box in original coords
    const [x1, y1, x2, y2] = d.box;
    const ox1 = Math.max(0, Math.round((x1 - padL) / scale));
    const oy1 = Math.max(0, Math.round((y1 - padT) / scale));
    const ox2 = Math.min(W, Math.round((x2 - padL) / scale));
    const oy2 = Math.min(H, Math.round((y2 - padT) / scale));
    const label = COCO[d.cls] || ('class' + d.cls);
    instances.push({
      id: idx, label, friendly: FRIENDLY[label] || label.replace(/\s+/g, '-'),
      classId: d.cls, score: Math.round(d.score * 1000) / 1000,
      box: [ox1, oy1, Math.max(0, ox2 - ox1), Math.max(0, oy2 - oy1)]
    });
  }
  await writeFile(path.join(outDir, 'instances.json'), JSON.stringify({
    width: W, height: H, scale, padL, padT, letterbox: S, proto: P, instances
  }, null, 1));
  console.log(`SEG_OK ${instances.length} ` + instances.map(i => `${i.friendly}:${i.score}`).join(' '));
}

main().catch(e => { console.error('SEG_FAILED: ' + ((e && e.message) || e)); process.exit(1); });
