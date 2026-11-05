import fs from 'fs';
import path from 'path';
import UPNG from 'upng-js';

const WIDTH = 1200;
const HEIGHT = 630;
const buffer = new Uint8Array(WIDTH * HEIGHT * 4);

// Fill with background dark blue: #0B132B (r: 11, g: 19, b: 43)
// and subtle gradient to #111E38 (r: 17, g: 30, b: 56)
for (let y = 0; y < HEIGHT; y++) {
  const t = y / HEIGHT;
  const r = Math.round(11 + 6 * t);
  const g = Math.round(19 + 11 * t);
  const b = Math.round(43 + 13 * t);

  for (let x = 0; x < WIDTH; x++) {
    const idx = (y * WIDTH + x) * 4;

    // Draw a subtle radial glow at top-left
    const dx = x - 260;
    const dy = y - 180;
    const dist = Math.sqrt(dx * dx + dy * dy);
    let glow = 0;
    if (dist < 420) {
      glow = Math.max(0, (1 - dist / 420) * 0.28);
    }

    const pr = Math.min(255, Math.round(r + glow * 37));
    const pg = Math.min(255, Math.round(g + glow * 99));
    const pb = Math.min(255, Math.round(b + glow * 235));

    buffer[idx] = pr;
    buffer[idx + 1] = pg;
    buffer[idx + 2] = pb;
    buffer[idx + 3] = 255;
  }
}

// Function to draw filled rectangle
function fillRect(rx, ry, rw, rh, cr, cg, cb, ca = 255) {
  for (let y = Math.max(0, ry); y < Math.min(HEIGHT, ry + rh); y++) {
    for (let x = Math.max(0, rx); x < Math.min(WIDTH, rx + rw); x++) {
      const idx = (y * WIDTH + x) * 4;
      const alpha = ca / 255;
      buffer[idx] = Math.round(buffer[idx] * (1 - alpha) + cr * alpha);
      buffer[idx + 1] = Math.round(buffer[idx + 1] * (1 - alpha) + cg * alpha);
      buffer[idx + 2] = Math.round(buffer[idx + 2] * (1 - alpha) + cb * alpha);
      buffer[idx + 3] = 255;
    }
  }
}

// Draw top decorative accent bar: bright blue to cyan
fillRect(0, 0, WIDTH, 8, 37, 99, 235); // #2563EB
fillRect(0, 8, WIDTH / 2, 4, 56, 189, 248); // #38BDF8

// Draw decorative badge container
fillRect(100, 100, 240, 44, 255, 255, 255, 18);
fillRect(100, 100, 6, 44, 56, 189, 248); // Cyan indicator

// Draw brand icon shape
// Squircle at (100, 190) size 100x100
fillRect(100, 190, 100, 100, 30, 58, 138); // Blue squircle
fillRect(115, 205, 70, 16, 56, 189, 248); // Top T crossbar
fillRect(142, 221, 18, 54, 37, 99, 235); // Vertical T stem

// Encode PNG
const pngBuffer = UPNG.encode([buffer.buffer], WIDTH, HEIGHT, 0);
const outPath = path.resolve('public/og-image.png');
fs.writeFileSync(outPath, Buffer.from(pngBuffer));
console.log('Successfully generated public/og-image.png (' + pngBuffer.byteLength + ' bytes)');
