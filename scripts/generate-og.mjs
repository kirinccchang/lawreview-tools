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

import { makeSvg, PAGES } from './og-source.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

for (const page of PAGES) {
  const svg = makeSvg(page);
  const outPath = path.join(ROOT, page.out);
  const svgPath = outPath.replace(/\.png$/i, '.svg');
  mkdirSync(path.dirname(outPath), { recursive: true });
  writeFileSync(svgPath, svg, 'utf-8');

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
  console.log(`   ${path.relative(ROOT, svgPath)}`);
}

console.log('\nDone. All OG SVG and PNG assets written to public/.');
