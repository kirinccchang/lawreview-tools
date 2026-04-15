/**
 * generate-og.mjs
 * Generates 1200×630 OG preview images for all four lawreview.tools pages.
 * Method: raw SVG strings → @resvg/resvg-js (Rust resvg, system fonts).
 * Run once: node scripts/generate-og.mjs
 */

import { Resvg } from '@resvg/resvg-js';
import { writeFileSync, mkdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const PAGES = [
  {
    out:      'public/og-home.png',
    phase:    'FREE & OPEN SOURCE · BLUEBOOK TOOLS',
    title:    'lawreview.tools',
    subtitle: 'Free Bluebook citation tools for law review\neditors and legal scholars.',
    footer:   'Zotero Plugin · PermaDrop · SupraDrop',
  },
  {
    out:      'public/og-zotero.png',
    phase:    'WRITING PHASE · ZOTERO PLUGIN',
    title:    'Zotero Perma\nArchiver',
    subtitle: 'Auto-archives URLs to perma.cc as you\nbuild your Zotero research library.',
    footer:   'Free · AGPL v3 · Zotero 7 & 8',
  },
  {
    out:      'public/og-permadrop.png',
    phase:    'SUBMISSION PHASE · ARCHIVING',
    title:    'PermaDrop',
    subtitle: 'Batch-archive every URL in your manuscript\nto perma.cc in one click.',
    footer:   'Free · Private · Bluebook Rule 18.2 Compliant',
  },
  {
    out:      'public/og-supradrop.png',
    phase:    'SUBMISSION PHASE · AUDITING',
    title:    'SupraDrop',
    subtitle: 'Audit supra, Id., and signal citations across\nyour footnotes. 24 Bluebook rules.',
    footer:   'Free · Private · Runs entirely in-browser',
  },
];

const W = 1200, H = 630;

// Palette — warm dark, matches site's warm neutral aesthetic inverted
const BG      = '#0C0C0B';
const BG2     = '#131310';
const WHITE   = '#F2F0EB';   // warm off-white
const MUTED   = '#6B6B66';
const DIMMED  = '#2E2E2B';
const LINE    = '#222220';
const SERIF   = "Georgia, 'Times New Roman', serif";
const SANS    = "-apple-system, 'Helvetica Neue', Arial, sans-serif";

// Escape XML special chars
function x(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Render multi-line title text (split on \n)
function titleLines(text, baseY) {
  const lines = text.split('\n');
  const lineH = 90;
  return lines.map((line, i) =>
    `<text x="80" y="${baseY + i * lineH}"
      font-family="${SERIF}" font-size="80" font-weight="400"
      fill="${WHITE}" letter-spacing="-1">${x(line)}</text>`
  ).join('\n  ');
}

// Render multi-line subtitle (split on \n)
function subtitleLines(text, baseY) {
  const lines = text.split('\n');
  const lineH = 40;
  return lines.map((line, i) =>
    `<text x="80" y="${baseY + i * lineH}"
      font-family="${SANS}" font-size="26" font-weight="300"
      fill="${MUTED}">${x(line)}</text>`
  ).join('\n  ');
}

function makeSvg(page) {
  // Compute y positions dynamically based on title line count
  const titleLineCount = (page.title.match(/\n/g) || []).length + 1;
  const titleBaseY = titleLineCount === 1 ? 320 : 270;
  const titleHeight = titleLineCount * 90;
  const subtitleBaseY = titleBaseY + titleHeight + 28;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%"   stop-color="${BG}"/>
      <stop offset="100%" stop-color="${BG2}"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="${W}" height="${H}" fill="url(#bg)"/>

  <!-- Top accent bar (3px) -->
  <rect x="0" y="0" width="${W}" height="3" fill="${WHITE}" opacity="0.07"/>

  <!-- Top-left: ⚖ symbol -->
  <text x="80" y="72"
    font-family="${SERIF}" font-size="30" fill="${DIMMED}">⚖</text>

  <!-- Top-right: lawreview.tools -->
  <text x="${W - 80}" y="68" text-anchor="end"
    font-family="${SANS}" font-size="17" font-weight="400"
    fill="${MUTED}" letter-spacing="0.3">lawreview.tools</text>

  <!-- Phase label -->
  <text x="80" y="152"
    font-family="${SANS}" font-size="12" font-weight="600"
    fill="${DIMMED}" letter-spacing="2.2">${x(page.phase)}</text>

  <!-- Divider line -->
  <rect x="80" y="170" width="${W - 160}" height="1" fill="${LINE}"/>

  <!-- Title -->
  ${titleLines(page.title, titleBaseY)}

  <!-- Subtitle -->
  ${subtitleLines(page.subtitle, subtitleBaseY)}

  <!-- Bottom divider -->
  <rect x="80" y="${H - 80}" width="${W - 160}" height="1" fill="${LINE}"/>

  <!-- Footer text -->
  <text x="80" y="${H - 48}"
    font-family="${SANS}" font-size="14" font-weight="400"
    fill="${DIMMED}" letter-spacing="0.3">${x(page.footer)}</text>
</svg>`;
}

for (const page of PAGES) {
  const svg = makeSvg(page);
  const outPath = path.join(ROOT, page.out);

  const resvg = new Resvg(svg, {
    font: {
      loadSystemFonts: true,
      defaultFontFamily: 'Helvetica',
      serifFamily:       'Georgia',
      sansSerifFamily:   'Helvetica',
    },
    fitTo: { mode: 'original' },
  });

  const pngData = resvg.render();
  writeFileSync(outPath, pngData.asPng());
  console.log(`✓  ${page.out}  (${Math.round(pngData.asPng().length / 1024)} KB)`);
}

console.log('\nDone. All OG images written to public/.');
