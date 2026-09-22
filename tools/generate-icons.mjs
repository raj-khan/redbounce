/**
 * Generate original PWA icons (red ball on dark rounded square).
 * Hand-rolled PNG encoder: zlib deflate + CRC32, zero dependencies.
 *
 * Usage: node tools/generate-icons.mjs
 */
import { deflateSync } from "node:zlib";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

// ---------------------------------------------------------------------
// Minimal PNG writer
// ---------------------------------------------------------------------

const CRC_TABLE = (() => {
  const table = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c;
  }
  return table;
})();

function crc32(buffer) {
  let crc = -1;
  for (const byte of buffer) crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ -1) >>> 0;
}

function chunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const typeBuffer = Buffer.from(type, "ascii");
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 0);
  return Buffer.concat([length, typeBuffer, data, crc]);
}

function encodePng(width, height, rgba) {
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  // Raw scanlines with filter byte 0.
  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0;
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }
  const idat = deflateSync(raw, { level: 9 });
  return Buffer.concat([
    signature,
    chunk("IHDR", ihdr),
    chunk("IDAT", idat),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

// ---------------------------------------------------------------------
// Scene: red ball with rim + shine on a dark rounded square
// ---------------------------------------------------------------------

function mix(a, b, t) {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
  ];
}

function render(size, maskable) {
  const rgba = Buffer.alloc(size * size * 4);
  const center = size / 2;
  const radius = size * (maskable ? 0.34 : 0.38); // smaller for maskable safe zone
  const bg = [26, 28, 44];
  const edge = [239, 125, 87];
  const body = [177, 62, 83];
  const shine = [255, 158, 128];
  const corner = size * 0.22;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let color = bg;
      // Rounded-square background.
      const dx = Math.min(x, size - 1 - x);
      const dy = Math.min(y, size - 1 - y);
      let insideCorner = dx >= corner || dy >= corner;
      if (dx < corner && dy < corner) {
        const dist = Math.hypot(corner - dx, corner - dy);
        if (dist <= corner) insideCorner = true;
      }
      if (insideCorner) color = bg;
      else color = [16, 17, 28];

      // Ball SDF.
      const bx = x - center;
      const by = y - center - size * 0.01;
      const dist = Math.hypot(bx, by);
      if (dist < radius) {
        color = body;
        // Rim light (lower-right).
        const rim = Math.hypot(bx - radius * 0.45, by - radius * 0.45);
        if (rim > radius * 0.72) color = mix(body, edge, 0.8);
        // Shine (upper-left).
        const shineDist = Math.hypot(bx + radius * 0.32, by + radius * 0.38);
        if (shineDist < radius * 0.3) {
          color = mix(body, shine, 1 - shineDist / (radius * 0.3));
        }
      }
      const i = (y * size + x) * 4;
      rgba[i] = color[0];
      rgba[i + 1] = color[1];
      rgba[i + 2] = color[2];
      rgba[i + 3] = 255;
    }
  }
  return rgba;
}

mkdirSync(join(root, "public", "icons"), { recursive: true });
for (const [name, size, maskable] of [
  ["icon-192.png", 192, false],
  ["icon-512.png", 512, false],
  ["icon-maskable-512.png", 512, true],
]) {
  const png = encodePng(size, size, render(size, maskable));
  writeFileSync(join(root, "public", "icons", name), png);
  console.log(`wrote public/icons/${name} (${png.length} bytes)`);
}
