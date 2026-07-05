// One-off: generate sized icons + an optimized in-page logo from the 512 PNG.
// Run with `node scripts/gen-icons.mjs`. Outputs land in public/ (committed);
// the deploy just copies them — sharp is not needed at build/Docker time.
import sharp from 'sharp';

const SRC = 'public/nmrp_full_512.png';
const targets = [
  ['public/favicon-16.png', 16],
  ['public/favicon-32.png', 32],
  ['public/apple-touch-icon.png', 180],
  ['public/icon-192.png', 192],
  ['public/logo-64.png', 64],
];

for (const [file, size] of targets) {
  await sharp(SRC)
    .resize(size, size, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png({ compressionLevel: 9, palette: true })
    .toFile(file);
  const { size: bytes } = await import('node:fs').then((fs) =>
    fs.promises.stat(file),
  );
  console.log(`✓ ${file}  ${size}px  ${(bytes / 1024).toFixed(1)}KB`);
}
