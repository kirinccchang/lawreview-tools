/**
 * fetch-tools.mjs  (prebuild)
 *
 * Fetches the latest index.html from each tool repo, then:
 *  1. Injects the lawreview.tools suite navbar (hardcoded colors, dark-mode aware)
 *  2. Injects a CSS override layer so all pages share the same design language
 *  3. Fixes canonical / OG / Twitter / JSON-LD URLs to lawreview.tools paths
 *  4. Replaces old favicon refs with the unified /favicon.svg
 */

import { writeFileSync } from 'fs';

/* ── Tool manifest ─────────────────────────────────────────── */
const TOOLS = [
  {
    id:           'permadrop',
    repo:         'kirinccchang/permadrop',
    dest:         'public/permadrop/index.html',
    oldBase:      'https://permadrop.kirinchang.com',
    newCanonical: 'https://lawreview.tools/permadrop/',
  },
  {
    id:           'supradrop',
    repo:         'kirinccchang/supradrop',
    dest:         'public/supradrop/index.html',
    oldBase:      'https://supradrop.kirinchang.com',
    newCanonical: 'https://lawreview.tools/supradrop/',
  },
];

const TOOL_LINKS = [
  { id: 'permadrop', label: 'PermaDrop',    href: '/permadrop/' },
  { id: 'supradrop', label: 'SupraDrop',    href: '/supradrop/' },
  { id: 'zotero',   label: 'Zotero Plugin', href: '/zotero'     },
];

/* ── SVG icons (same as main site) ────────────────────────── */
const ICON_MOON = `<svg class="lrt-icon-moon" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
const ICON_SUN  = `<svg class="lrt-icon-sun"  width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`;

/* ── Build injected head content ───────────────────────────── */
function buildHead() {
  return `
<!-- ══ lawreview.tools suite: fonts ════════════════════════ -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Source+Serif+4:opsz,wght@8..60,400;8..60,600&family=IBM+Plex+Sans:wght@300;400;500;600&display=swap" rel="stylesheet">

<!-- ══ lawreview.tools suite: shared design layer ══════════ -->
<style id="lrt-design">

  /* ── Navbar shell ─────────────────────────────────────── */
  #lrt-nav {
    position: sticky; top: 0; z-index: 9999;
    height: 60px;
    /* hardcoded to match lawreview.tools exactly */
    background: #FFFFFF;
    border-bottom: 1px solid #D0CEC9;
    transition: background .2s, border-color .2s;
  }
  body.dark #lrt-nav {
    background: #111111;
    border-bottom-color: #333333;
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
    font-size: 18px; font-weight: 400; letter-spacing: -0.01em;
    color: #111111;
    text-decoration: none; flex-shrink: 0; white-space: nowrap;
    transition: opacity .15s;
  }
  #lrt-logo:hover { opacity: .65; }
  body.dark #lrt-logo { color: #EEEEEE; }

  #lrt-links { display: flex; align-items: center; gap: 2px; }
  .lrt-link {
    font-family: 'IBM Plex Sans', system-ui, sans-serif;
    font-size: 14px; font-weight: 500;
    color: #3D3D3D;
    text-decoration: none;
    padding: 5px 10px; border-radius: 5px;
    transition: background .15s, color .15s; white-space: nowrap;
  }
  .lrt-link:hover   { background: #F5F4F0; color: #111111; }
  .lrt-current      { background: #F5F4F0; color: #111111; font-weight: 600; }
  body.dark .lrt-link          { color: #AAAAAA; }
  body.dark .lrt-link:hover    { background: #1A1A1A; color: #EEEEEE; }
  body.dark .lrt-current       { background: #1A1A1A; color: #EEEEEE; }

  /* Theme toggle button in navbar */
  #lrt-theme-btn {
    display: flex; align-items: center; justify-content: center;
    width: 34px; height: 34px; border-radius: 5px;
    background: none; border: none; cursor: pointer;
    color: #3D3D3D; transition: background .15s, color .15s;
    flex-shrink: 0;
  }
  #lrt-theme-btn:hover { background: #F5F4F0; color: #111111; }
  body.dark #lrt-theme-btn          { color: #AAAAAA; }
  body.dark #lrt-theme-btn:hover    { background: #1A1A1A; color: #EEEEEE; }

  /* Moon shows in light mode, sun in dark mode */
  .lrt-icon-sun  { display: none; }
  .lrt-icon-moon { display: block; }
  body.dark .lrt-icon-sun  { display: block; }
  body.dark .lrt-icon-moon { display: none; }

  /* ── Body: white background, unified font ─────────────── */
  body {
    font-family: 'IBM Plex Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif !important;
    background: #FFFFFF !important;
  }
  body.dark { background: #111111 !important; }

  /* Override the tool's gray --bg so cards stay correct */
  :root   { --bg: #FFFFFF !important; }
  body.dark { --bg: #111111 !important; }

  /* ── App h1: Source Serif 4, lighter — editorial feel ─── */
  .container h1 {
    font-family: 'Source Serif 4', Georgia, 'Times New Roman', serif !important;
    font-weight: 600 !important;
    letter-spacing: -0.02em !important;
  }

  /* ── Hide the tool's own dark-mode toggle ─────────────── */
  /* (replaced by the navbar theme button above)             */
  .dark-toggle { display: none !important; }

  /* ── Mobile ───────────────────────────────────────────── */
  @media (max-width: 500px) {
    #lrt-logo { font-size: 15px; }
    .lrt-link  { font-size: 12px; padding: 4px 7px; }
  }
</style>
<!-- ══ end suite design ═════════════════════════════════════ -->`.trim();
}

/* ── Build navbar HTML ─────────────────────────────────────── */
function buildNavbar(currentId) {
  const links = TOOL_LINKS.map(t =>
    `<a href="https://lawreview.tools${t.href}" class="lrt-link${t.id === currentId ? ' lrt-current' : ''}">${t.label}</a>`
  ).join('\n      ');

  return `
<!-- ══ lawreview.tools suite navbar ══════════════════════════ -->
<nav id="lrt-nav" aria-label="lawreview.tools suite navigation">
  <div id="lrt-inner">
    <a href="https://lawreview.tools/" id="lrt-logo">
      <span aria-hidden="true">⚖</span>lawreview.tools
    </a>
    <div style="display:flex;align-items:center;gap:6px;">
      <div id="lrt-links">
        ${links}
      </div>
      <button id="lrt-theme-btn" aria-label="Toggle dark mode">${ICON_MOON}${ICON_SUN}</button>
    </div>
  </div>
</nav>
<script>
  // Forward navbar theme toggle → tool's hidden .dark-toggle (Alpine handles state)
  document.addEventListener('DOMContentLoaded', function () {
    var btn = document.getElementById('lrt-theme-btn');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var toolBtn = document.querySelector('.dark-toggle');
      if (toolBtn) { toolBtn.click(); }
      else { document.body.classList.toggle('dark'); }
    });
  });
<\/script>
<!-- ══ end suite navbar ═══════════════════════════════════════ -->`.trim();
}

/* ── HTML transformation pipeline ─────────────────────────── */
function transform(html, tool) {
  // 1. Update all URLs from old domain to new canonical
  html = html.replaceAll(tool.oldBase + '/', tool.newCanonical);
  html = html.replaceAll(tool.oldBase,       tool.newCanonical);

  // 2. Replace old favicon tags with unified lawreview.tools favicon
  html = html
    .replace(/<link[^>]*rel="icon"[^>]*>\s*/g, '')
    .replace(/<link[^>]*rel="apple-touch-icon"[^>]*>\s*/g, '')
    .replace(
      '<meta charset="UTF-8">',
      '<meta charset="UTF-8">\n  <link rel="icon" type="image/svg+xml" href="/favicon.svg">'
    );

  // 3. Inject fonts + design CSS into <head>
  html = html.replace('</head>', buildHead() + '\n</head>');

  // 4. Inject navbar as first child of <body>
  html = html.replace('<body>', '<body>\n' + buildNavbar(tool.id) + '\n');

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
