// Isolated ML background-removal worker.
// Runs in its OWN process because onnxruntime and sharp crash when loaded
// together on some Windows CPUs. Usage:
//   node ml-cutout.mjs <photo> <out.png> [--ml-model small]
// Prints CUTOUT_OK on success; exits nonzero on failure.
import { removeBackground } from '@imgly/background-removal-node';
import { readFile, writeFile } from 'node:fs/promises';

const [photo, out, ...rest] = process.argv.slice(2);
let model = 'small';
for (let i = 0; i < rest.length; i++) {
  if (rest[i] === '--ml-model' && rest[i + 1]) model = rest[++i];
}
if (!photo || !out) {
  console.error('usage: ml-cutout.mjs <photo> <out.png> [--ml-model small]');
  process.exit(2);
}
try {
  const bytes = await readFile(photo);
  const ext = photo.toLowerCase();
  const mime = ext.endsWith('.png') ? 'image/png' : ext.endsWith('.webp') ? 'image/webp' : 'image/jpeg';
  const result = await removeBackground(new Blob([bytes], { type: mime }), {
    model, output: { format: 'image/png', quality: 1 }
  });
  await writeFile(out, Buffer.from(await result.arrayBuffer()));
  console.log('CUTOUT_OK');
} catch (e) {
  console.error('ML cutout failed: ' + ((e && e.message) || e));
  process.exit(1);
}
