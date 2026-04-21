import { siteTools } from '../src/data/tools.js';

export const W = 1200;
export const H = 630;

export const PAGES = [
  {
    out: 'public/og-home.png',
    phase: 'FREE & OPEN SOURCE · BLUEBOOK TOOLS',
    title: 'lawreview.tools',
    subtitle: 'Free Bluebook citation tools for law review\neditors and legal scholars.',
    footer: 'Zotero Plugin · PermaDrop · SupraDrop · Redline Cleaner',
  },
  ...siteTools.map(tool => ({
    out: tool.og.out,
    phase: tool.phase,
    title: tool.og.title,
    subtitle: tool.og.subtitle,
    footer: tool.og.footer,
  })),
];

const BG = '#0C0C0B';
const BG2 = '#131310';
const WHITE = '#F2F0EB';
const MUTED = '#6B6B66';
const DIMMED = '#2E2E2B';
const LINE = '#222220';
const SERIF = "Georgia, 'Times New Roman', serif";
const SANS = "-apple-system, 'Helvetica Neue', Arial, sans-serif";

function x(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function titleLines(text, baseY) {
  const lines = text.split('\n');
  const lineHeight = 90;
  return lines.map((line, index) =>
    `<text x="80" y="${baseY + index * lineHeight}"
      font-family="${SERIF}" font-size="80" font-weight="400"
      fill="${WHITE}" letter-spacing="-1">${x(line)}</text>`
  ).join('\n  ');
}

function subtitleLines(text, baseY) {
  const lines = text.split('\n');
  const lineHeight = 40;
  return lines.map((line, index) =>
    `<text x="80" y="${baseY + index * lineHeight}"
      font-family="${SANS}" font-size="26" font-weight="300"
      fill="${MUTED}">${x(line)}</text>`
  ).join('\n  ');
}

export function makeSvg(page) {
  const titleLineCount = (page.title.match(/\n/g) || []).length + 1;
  const titleBaseY = titleLineCount === 1 ? 320 : 270;
  const titleHeight = titleLineCount * 90;
  const subtitleBaseY = titleBaseY + titleHeight + 28;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${BG}"/>
      <stop offset="100%" stop-color="${BG2}"/>
    </linearGradient>
  </defs>

  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect x="0" y="0" width="${W}" height="3" fill="${WHITE}" opacity="0.07"/>

  <text x="80" y="72"
    font-family="${SERIF}" font-size="30" fill="${DIMMED}">⚖</text>

  <text x="${W - 80}" y="68" text-anchor="end"
    font-family="${SANS}" font-size="17" font-weight="400"
    fill="${MUTED}" letter-spacing="0.3">lawreview.tools</text>

  <text x="80" y="152"
    font-family="${SANS}" font-size="12" font-weight="600"
    fill="${DIMMED}" letter-spacing="2.2">${x(page.phase)}</text>

  <rect x="80" y="170" width="${W - 160}" height="1" fill="${LINE}"/>

  ${titleLines(page.title, titleBaseY)}
  ${subtitleLines(page.subtitle, subtitleBaseY)}

  <rect x="80" y="${H - 80}" width="${W - 160}" height="1" fill="${LINE}"/>

  <text x="80" y="${H - 48}"
    font-family="${SANS}" font-size="14" font-weight="400"
    fill="${DIMMED}" letter-spacing="0.3">${x(page.footer)}</text>
</svg>`;
}