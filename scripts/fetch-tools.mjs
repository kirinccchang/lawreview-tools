/**
 * fetch-tools.mjs  (prebuild)
 *
 * Fetches each tool's index.html and wraps it in the lawreview.tools
 * shared shell: same navbar, same footer, same typography, same dark-mode.
 *
 * Philosophy: the tools are the content; the shell is identical to the
 * main site so every page feels like one product.
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

const NAV_TOOLS = [
  { id: 'permadrop', label: 'PermaDrop',    href: 'https://lawreview.tools/permadrop/' },
  { id: 'supradrop', label: 'SupraDrop',    href: 'https://lawreview.tools/supradrop/' },
  { id: 'zotero',   label: 'Zotero Plugin', href: 'https://lawreview.tools/zotero'     },
];

/* ══════════════════════════════════════════════════════════════
   SHARED SHELL CSS
   All colors are hardcoded to lawreview.tools values.
   body.dark variants handle the tool's Alpine-driven dark mode.
   Prefixed #lrt- / .lrt- to never clash with tool styles.
══════════════════════════════════════════════════════════════ */
const SHELL_CSS = `
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Source+Serif+4:opsz,wght@8..60,400;8..60,600&family=IBM+Plex+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap" rel="stylesheet">
<style id="lrt-shell">

/* ── Reset + typography override ───────────────────────────── */
body {
  font-family: 'IBM Plex Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif !important;
  background: #FFFFFF !important;
}
body.dark { background: #111111 !important; }
:root  { --bg: #FFFFFF !important; }
body.dark { --bg: #111111 !important; }

/* Tool app h1 gets the same serif treatment as the main site */
.container h1 {
  font-family: 'Source Serif 4', Georgia, 'Times New Roman', serif !important;
  font-weight: 600 !important;
  letter-spacing: -0.02em !important;
}

/* Hide the tool's own dark toggle — replaced by the navbar one */
.dark-toggle { display: none !important; }

/* Reduce tool container bottom padding (footer adds its own breathing room) */
.container { padding-bottom: 48px !important; }

/* ── Navbar ─────────────────────────────────────────────────── */
#lrt-nav {
  position: sticky; top: 0; z-index: 9999;
  height: 68px;
  background: #FFFFFF;
  border-bottom: 1px solid transparent;
  transition: border-color .2s, background .2s;
  font-family: 'IBM Plex Sans', -apple-system, BlinkMacSystemFont, sans-serif;
}
#lrt-nav.lrt-scrolled {
  border-bottom-color: #D0CEC9;
}
body.dark #lrt-nav          { background: #111111; }
body.dark #lrt-nav.lrt-scrolled { border-bottom-color: #333333; }

#lrt-nav-inner {
  max-width: min(1440px, calc(100vw - 64px));
  margin: 0 auto; padding: 0 32px;
  height: 100%; display: flex; align-items: center;
  justify-content: space-between; gap: 16px;
}

/* Logo */
#lrt-logo {
  display: flex; align-items: center; gap: 8px;
  font-family: 'Source Serif 4', Georgia, 'Times New Roman', serif;
  font-size: 20px; font-weight: 400; letter-spacing: -0.01em;
  color: #111111; text-decoration: none;
  flex-shrink: 0; white-space: nowrap;
  transition: opacity .15s;
}
#lrt-logo:hover { opacity: .65; }
body.dark #lrt-logo { color: #EEEEEE; }

/* Nav links */
#lrt-nav-right { display: flex; align-items: center; gap: 6px; }
.lrt-nav-link {
  font-size: 15px; font-weight: 500;
  color: #3D3D3D;
  text-decoration: none; padding: 5px 10px; border-radius: 4px;
  transition: background .15s, color .15s; white-space: nowrap;
}
.lrt-nav-link:hover  { background: #F5F4F0; color: #111111; }
.lrt-current         { background: #F5F4F0; color: #111111; font-weight: 600; }
body.dark .lrt-nav-link       { color: #AAAAAA; }
body.dark .lrt-nav-link:hover { background: #1A1A1A; color: #EEEEEE; }
body.dark .lrt-current        { background: #1A1A1A; color: #EEEEEE; }

/* Theme toggle button — fully reset then restyle */
#lrt-theme-btn {
  all: unset !important;
  box-sizing: border-box !important;
  display: flex !important; align-items: center !important; justify-content: center !important;
  width: 34px !important; height: 34px !important;
  border-radius: 4px !important;
  color: #3D3D3D !important;
  cursor: pointer !important;
  transition: background .15s, color .15s !important;
  flex-shrink: 0 !important;
}
#lrt-theme-btn:hover { background: #F5F4F0 !important; color: #111111 !important; }
body.dark #lrt-theme-btn       { color: #AAAAAA !important; }
body.dark #lrt-theme-btn:hover { background: #1A1A1A !important; color: #EEEEEE !important; }

#lrt-theme-btn svg { width: 18px; height: 18px; display: block; pointer-events: none; }

/* Moon shows in light, sun shows in dark */
.lrt-moon { display: block; }
.lrt-sun  { display: none;  }
body.dark .lrt-moon { display: none;  }
body.dark .lrt-sun  { display: block; }

/* ── Footer ─────────────────────────────────────────────────── */
#lrt-footer {
  border-top: 1px solid #D0CEC9;
  padding: 56px 0 32px;
  margin-top: 64px;
  font-family: 'IBM Plex Sans', -apple-system, BlinkMacSystemFont, sans-serif;
  background: #FFFFFF;
}
body.dark #lrt-footer {
  border-top-color: #333333;
  background: #111111;
}
#lrt-footer-inner {
  max-width: min(1440px, calc(100vw - 64px));
  margin: 0 auto; padding: 0 32px;
}
#lrt-footer-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 2rem;
  margin-bottom: 48px;
}
@media (max-width: 768px) {
  #lrt-footer-grid { grid-template-columns: 1fr 1fr; }
  .lrt-fbrand { grid-column: 1 / -1; }
}
@media (max-width: 480px) {
  #lrt-footer-grid { grid-template-columns: 1fr; }
  #lrt-nav-inner { padding: 0 20px; }
}
.lrt-flogo {
  display: inline-flex; align-items: center; gap: 6px;
  font-family: 'Source Serif 4', Georgia, serif;
  font-size: 16px; color: #111111;
  text-decoration: none; margin-bottom: 10px;
  transition: opacity .15s;
}
.lrt-flogo:hover { opacity: .7; }
body.dark .lrt-flogo { color: #EEEEEE; }

.lrt-ftagline { font-size: 13px; color: #888888; line-height: 1.6; }
body.dark .lrt-ftagline { color: #666666; }

.lrt-fcol { display: flex; flex-direction: column; gap: 10px; }
.lrt-fheading {
  font-size: 11px; font-weight: 600;
  letter-spacing: 0.12em; text-transform: uppercase;
  color: #888888; margin-bottom: 4px;
}
body.dark .lrt-fheading { color: #666666; }

.lrt-flink {
  font-size: 14px; color: #3D3D3D;
  text-decoration: none; transition: color .15s;
}
.lrt-flink:hover { color: #111111; }
body.dark .lrt-flink       { color: #AAAAAA; }
body.dark .lrt-flink:hover { color: #EEEEEE; }

#lrt-footer-bottom {
  border-top: 1px solid #D0CEC9;
  padding-top: 24px;
  font-size: 13px; color: #888888;
}
body.dark #lrt-footer-bottom { border-top-color: #333333; color: #666666; }
#lrt-footer-bottom a { color: #3D3D3D; text-decoration: none; transition: color .15s; }
#lrt-footer-bottom a:hover { color: #111111; }
body.dark #lrt-footer-bottom a       { color: #AAAAAA; }
body.dark #lrt-footer-bottom a:hover { color: #EEEEEE; }

</style>`.trim();

/* ══════════════════════════════════════════════════════════════
   NAVBAR HTML
══════════════════════════════════════════════════════════════ */
function buildNavbar(currentId) {
  const links = NAV_TOOLS.map(t =>
    `<a href="${t.href}" class="lrt-nav-link${t.id === currentId ? ' lrt-current' : ''}">${t.label}</a>`
  ).join('\n        ');

  return `
<!-- ══ lawreview.tools navbar ═══════════════════════════════ -->
<nav id="lrt-nav" aria-label="lawreview.tools">
  <div id="lrt-nav-inner">
    <a href="https://lawreview.tools/" id="lrt-logo">
      <span aria-hidden="true">⚖</span>lawreview.tools
    </a>
    <div id="lrt-nav-right">
      ${links}
      <button id="lrt-theme-btn" aria-label="Toggle dark mode">
        <svg class="lrt-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
        <svg class="lrt-sun"  viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
      </button>
    </div>
  </div>
</nav>
<!-- ══ end navbar ═══════════════════════════════════════════ -->`.trim();
}

/* ══════════════════════════════════════════════════════════════
   FOOTER HTML  (identical structure to main site)
══════════════════════════════════════════════════════════════ */
const FOOTER_HTML = `
<!-- ══ lawreview.tools footer ══════════════════════════════ -->
<footer id="lrt-footer">
  <div id="lrt-footer-inner">
    <div id="lrt-footer-grid">
      <div class="lrt-fbrand">
        <a href="https://lawreview.tools/" class="lrt-flogo">
          <span aria-hidden="true">⚖</span> lawreview.tools
        </a>
        <p class="lrt-ftagline">Free, private Bluebook tools<br>for law review editors<br>and legal scholars.</p>
      </div>
      <div class="lrt-fcol">
        <div class="lrt-fheading">Tools</div>
        <a href="https://lawreview.tools/permadrop/" class="lrt-flink">PermaDrop</a>
        <a href="https://lawreview.tools/supradrop/" class="lrt-flink">SupraDrop</a>
        <a href="https://lawreview.tools/zotero" class="lrt-flink">Zotero Plugin</a>
      </div>
      <div class="lrt-fcol">
        <div class="lrt-fheading">Resources</div>
        <a href="https://github.com/kirinccchang" target="_blank" rel="noopener" class="lrt-flink">GitHub</a>
        <a href="https://lawreview.tools/zotero" class="lrt-flink">Docs</a>
        <a href="https://github.com/kirinccchang/zotero-perma-archiver/releases" target="_blank" rel="noopener" class="lrt-flink">Changelog</a>
      </div>
      <div class="lrt-fcol">
        <div class="lrt-fheading">Legal</div>
        <a href="https://www.gnu.org/licenses/agpl-3.0.html" target="_blank" rel="noopener" class="lrt-flink">AGPL v3 License</a>
        <a href="https://lawreview.tools/privacy" class="lrt-flink">Privacy Policy</a>
      </div>
    </div>
    <div id="lrt-footer-bottom">
      © 2026 Kirin Chang · <a href="https://lawreview.tools/">lawreview.tools</a> · Open source under AGPL v3
    </div>
  </div>
</footer>
<!-- ══ end footer ═══════════════════════════════════════════ -->`.trim();

/* ══════════════════════════════════════════════════════════════
   DARK MODE + SCROLL SYNC SCRIPT
   - Reads/writes localStorage 'theme' (same key as main site)
   - On alpine:initialized, syncs Alpine's darkMode to localStorage
   - MutationObserver keeps localStorage in sync on any change
   - Navbar theme button forwards click to hidden .dark-toggle
   - Scroll listener adds .lrt-scrolled border to navbar
══════════════════════════════════════════════════════════════ */
const SYNC_SCRIPT = `
<script id="lrt-sync">
(function () {
  // Navbar scroll border
  var nav = document.getElementById('lrt-nav');
  if (nav) {
    window.addEventListener('scroll', function () {
      nav.classList.toggle('lrt-scrolled', window.scrollY > 10);
    }, { passive: true });
  }

  // Dark mode: sync Alpine ↔ localStorage ↔ navbar icon
  document.addEventListener('alpine:initialized', function () {
    var stored = localStorage.getItem('theme');
    if (stored) {
      var wantsDark = stored === 'dark';
      var isDark    = document.body.classList.contains('dark');
      if (wantsDark !== isDark) {
        var toolBtn = document.querySelector('.dark-toggle');
        if (toolBtn) toolBtn.click();
      }
    }
  });

  // Persist any dark-mode change to localStorage
  new MutationObserver(function () {
    var dark = document.body.classList.contains('dark');
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }).observe(document.body, { attributes: true, attributeFilter: ['class'] });

  // Navbar theme button → forward to tool's hidden toggle
  document.addEventListener('DOMContentLoaded', function () {
    var btn = document.getElementById('lrt-theme-btn');
    if (btn) {
      btn.addEventListener('click', function () {
        var toolBtn = document.querySelector('.dark-toggle');
        if (toolBtn) toolBtn.click();
        else document.body.classList.toggle('dark');
      });
    }
  });
}());
<\/script>`.trim();

/* ══════════════════════════════════════════════════════════════
   HTML TRANSFORMATION PIPELINE
══════════════════════════════════════════════════════════════ */
function transform(html, tool) {
  // 1. Update URLs from old domain to new canonical
  html = html.replaceAll(tool.oldBase + '/', tool.newCanonical);
  html = html.replaceAll(tool.oldBase,       tool.newCanonical);

  // 2. Unified favicon
  html = html
    .replace(/<link[^>]*rel="icon"[^>]*>\s*/g, '')
    .replace(/<link[^>]*rel="apple-touch-icon"[^>]*>\s*/g, '')
    .replace(
      '<meta charset="UTF-8">',
      '<meta charset="UTF-8">\n  <link rel="icon" type="image/svg+xml" href="/favicon.svg">'
    );

  // 3. Inject shared CSS + fonts into <head>
  html = html.replace('</head>', SHELL_CSS + '\n</head>');

  // 4. Inject navbar + dark-mode script at top of <body>
  html = html.replace('<body>', '<body>\n' + buildNavbar(tool.id) + '\n' + SYNC_SCRIPT + '\n');

  // 5. Inject footer before </body>
  html = html.replace('</body>', FOOTER_HTML + '\n</body>');

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
