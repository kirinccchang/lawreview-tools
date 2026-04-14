/**
 * fetch-tools.mjs  (prebuild)
 *
 * 1. Fetches the latest index.html from each tool repo.
 * 2. Injects the lawreview.tools suite navbar.
 * 3. Updates canonical / OG URLs to the new lawreview.tools paths.
 * 4. Fixes relative favicon references.
 */

import { writeFileSync } from 'fs';

/* ── Tool manifest ─────────────────────────────────────────── */
const TOOLS = [
  {
    id:          'permadrop',
    repo:        'kirinccchang/permadrop',
    dest:        'public/permadrop/index.html',
    oldBase:     'https://permadrop.kirinchang.com',
    newCanonical:'https://lawreview.tools/permadrop/',
  },
  {
    id:          'supradrop',
    repo:        'kirinccchang/supradrop',
    dest:        'public/supradrop/index.html',
    oldBase:     'https://supradrop.kirinchang.com',
    newCanonical:'https://lawreview.tools/supradrop/',
  },
];

/* ── Suite navbar ──────────────────────────────────────────── */
const NAV_LINKS = [
  { id: 'permadrop', label: 'PermaDrop',    href: '/permadrop/' },
  { id: 'supradrop', label: 'SupraDrop',    href: '/supradrop/' },
  { id: 'zotero',   label: 'Zotero Plugin', href: '/zotero'    },
];

function buildNavbar(currentId) {
  const links = NAV_LINKS.map(t => {
    const isCurrent = t.id === currentId;
    return `<a href="https://lawreview.tools${t.href}" class="lrt-link${isCurrent ? ' lrt-current' : ''}">${t.label}</a>`;
  }).join('\n      ');

  /* Styles use the tool's own CSS variables so dark-mode is automatic.
     Prefixed with #lrt- / .lrt- to avoid clashing with tool CSS. */
  const style = `
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Source+Serif+4:opsz,wght@8..60,400;8..60,600&display=swap" rel="stylesheet">
<style id="lrt-nav-css">
  #lrt-nav {
    position: sticky; top: 0; z-index: 9999;
    height: 54px;
    background: var(--bg, #f4f4f5);
    border-bottom: 1px solid var(--border, #e4e4e7);
    transition: background .2s, border-color .2s;
  }
  #lrt-inner {
    max-width: min(1440px, calc(100vw - 48px));
    margin: 0 auto; padding: 0 24px;
    height: 100%; display: flex; align-items: center;
    justify-content: space-between; gap: 16px;
  }
  #lrt-logo {
    display: flex; align-items: center; gap: 7px;
    font-family: 'Source Serif 4', Georgia, 'Times New Roman', serif;
    font-size: 17px; font-weight: 400;
    color: var(--text, #18181b);
    text-decoration: none; flex-shrink: 0; white-space: nowrap;
    letter-spacing: -0.01em;
  }
  #lrt-logo:hover { opacity: .7; transition: opacity .15s; }
  #lrt-links { display: flex; align-items: center; gap: 2px; }
  .lrt-link {
    font-size: 13px; font-weight: 500;
    color: var(--text-muted, #71717a);
    text-decoration: none;
    padding: 5px 10px; border-radius: 6px;
    transition: background .15s, color .15s; white-space: nowrap;
  }
  .lrt-link:hover {
    background: var(--hover-bg, #f0f0f0);
    color: var(--text, #18181b);
  }
  .lrt-current {
    background: var(--hover-bg, #f0f0f0);
    color: var(--text, #18181b);
    font-weight: 600;
  }
  @media (max-width: 500px) {
    #lrt-logo span.lrt-wordmark { display: none; }
    .lrt-link { font-size: 12px; padding: 4px 7px; }
  }
</style>`.trim();

  const nav = `
<nav id="lrt-nav" aria-label="lawreview.tools">
  <div id="lrt-inner">
    <a href="https://lawreview.tools/" id="lrt-logo">
      <span aria-hidden="true">⚖</span>
      <span class="lrt-wordmark">lawreview.tools</span>
    </a>
    <div id="lrt-links">
      ${links}
    </div>
  </div>
</nav>`.trim();

  return { style, nav };
}

/* ── HTML transformations ──────────────────────────────────── */
function transform(html, tool) {
  const { style, nav } = buildNavbar(tool.id);

  // 1. Update canonical + OG/Twitter URLs
  html = html.replaceAll(tool.oldBase + '/', tool.newCanonical);
  html = html.replaceAll(tool.oldBase,      tool.newCanonical);

  // 2. Replace old favicon tags with unified lawreview.tools favicon
  html = html.replace(
    /<link[^>]*rel="icon"[^>]*>\s*/g, ''
  ).replace(
    /<link[^>]*rel="apple-touch-icon"[^>]*>\s*/g, ''
  ).replace(
    '<meta charset="UTF-8">',
    '<meta charset="UTF-8">\n  <link rel="icon" type="image/svg+xml" href="/favicon.svg">'
  );

  // 3. Inject fonts + navbar CSS into <head>
  html = html.replace('</head>', style + '\n</head>');

  // 4. Inject navbar as first child of <body>
  html = html.replace('<body>', '<body>\n' + nav + '\n');

  return html;
}

/* ── Main ──────────────────────────────────────────────────── */
console.log('\n📦 Fetching and integrating tool builds...\n');

for (const tool of TOOLS) {
  const url = `https://raw.githubusercontent.com/${tool.repo}/main/index.html`;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`  ⚠  ${tool.repo}: HTTP ${res.status} — using committed version`);
      continue;
    }
    let html = await res.text();
    html = transform(html, tool);
    writeFileSync(tool.dest, html, 'utf-8');
    console.log(`  ✓  ${tool.repo} → ${tool.dest}`);
  } catch (err) {
    console.warn(`  ⚠  ${tool.repo}: ${err.message} — using committed version`);
  }
}

console.log('\n✅ Tools integrated.\n');
