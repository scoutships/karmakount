// Pure Node script to generate KarmaKount PNG icons
import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function createPNG(size, bgR, bgG, bgB) {
  const width = size;
  const height = size;

  // Raw RGBA buffer
  const rawData = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) {
    const rowOffset = y * (width * 4 + 1);
    rawData[rowOffset] = 0; // Filter type 0 (None)
    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 4;
      // Draw rounded border effect
      const dx = x - width / 2;
      const dy = y - height / 2;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < width * 0.45) {
        rawData[pixelOffset] = bgR;     // R
        rawData[pixelOffset + 1] = bgG; // G
        rawData[pixelOffset + 2] = bgB; // B
        rawData[pixelOffset + 3] = 255; // A
      } else {
        rawData[pixelOffset] = 2;
        rawData[pixelOffset + 1] = 6;
        rawData[pixelOffset + 2] = 23;
        rawData[pixelOffset + 3] = 255;
      }
    }
  }

  const deflated = zlib.deflateSync(rawData);

  // PNG Header
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // Bit depth
  ihdr[9] = 6; // Color type: RGBA
  ihdr[10] = 0; // Compression method
  ihdr[11] = 0; // Filter method
  ihdr[12] = 0; // Interlace method
  const ihdrChunk = makeChunk('IHDR', ihdr);

  // IDAT chunk
  const idatChunk = makeChunk('IDAT', deflated);

  // IEND chunk
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function makeChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(len + 12);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4);
  data.copy(chunk, 8);
  const crc = crc32(Buffer.concat([Buffer.from(type), data]));
  chunk.writeUInt32BE(crc, len + 8);
  return chunk;
}

// Standard CRC32
function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (-(crc & 1) & 0xedb88320);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

const extDir = path.resolve('extension/icons');
fs.mkdirSync(extDir, { recursive: true });

fs.writeFileSync(path.join(extDir, 'icon16.png'), createPNG(16, 245, 158, 11));
fs.writeFileSync(path.join(extDir, 'icon48.png'), createPNG(48, 245, 158, 11));
fs.writeFileSync(path.join(extDir, 'icon128.png'), createPNG(128, 245, 158, 11));

const publicDir = path.resolve('public/icons');
fs.mkdirSync(publicDir, { recursive: true });
fs.writeFileSync(path.join(publicDir, 'icon-192.png'), createPNG(192, 245, 158, 11));

console.log('Generated PNG icons for Chrome Extension and Desktop!');
