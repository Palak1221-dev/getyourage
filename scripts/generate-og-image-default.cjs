const sharp = require('sharp');
const path = require('path');

const WIDTH = 1200;
const HEIGHT = 630;

function createSvg() {
  return `<svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bg" cx="50%" cy="40%" r="65%">
      <stop offset="0%" stop-color="#1e293b" />
      <stop offset="100%" stop-color="#0f172a" />
    </radialGradient>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#3b82f6" />
      <stop offset="100%" stop-color="#2563eb" />
    </linearGradient>
    <linearGradient id="glow" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.08" />
      <stop offset="100%" stop-color="#1d4ed8" stop-opacity="0.02" />
    </linearGradient>
    <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
      <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#1e293b" stroke-width="1" />
    </pattern>
  </defs>

  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bg)" />
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#grid)" opacity="0.4" />
  <circle cx="1050" cy="315" r="380" fill="url(#glow)" />

  <text x="60" y="72" font-family="system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="20" font-weight="600" fill="#64748b" letter-spacing="1">TOOLTAILS</text>
  <rect x="60" y="92" width="2" height="18" rx="1" fill="#3b82f6" opacity="0.4" />
  <line x1="60" y1="130" x2="170" y2="130" stroke="#334155" stroke-width="1" opacity="0.6" />

  <rect x="60" y="280" width="64" height="4" rx="2" fill="url(#accent)" />

  <text x="60" y="360" font-family="system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="54" font-weight="700" fill="#ffffff">Free Online Tools</text>
  <text x="60" y="430" font-family="system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="54" font-weight="700" fill="#ffffff">Calculators &amp; Productivity</text>

  <text x="60" y="500" font-family="system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="24" font-weight="500" fill="#60a5fa">tooltails.com</text>

  <line x1="60" y1="530" x2="210" y2="530" stroke="#334155" stroke-width="1" opacity="0.6" />
  <text x="60" y="570" font-family="system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="13" font-weight="400" fill="#475569">Age calculators, productivity timers, date tools &amp; more</text>
</svg>`;
}

async function main() {
  const svg = createSvg();
  const outputPath = path.join(__dirname, '..', 'public', 'og-image.png');

  await sharp(Buffer.from(svg))
    .png({ compressionLevel: 9, palette: true })
    .toFile(outputPath);

  const stats = require('fs').statSync(outputPath);
  const sizeKb = (stats.size / 1024).toFixed(1);
  console.log(`Generated ${outputPath}`);
  console.log(`Size: ${sizeKb} KB`);
}

main().catch(err => { console.error('Error:', err.message); process.exit(1); });
