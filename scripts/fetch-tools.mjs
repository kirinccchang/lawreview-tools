/**
 * fetch-tools.mjs  (prebuild)
 *
 * Fetches each tool's index.html and wraps it in the lawreview.tools
 * shared shell: navbar, author section, footer, typography, dark-mode.
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
══════════════════════════════════════════════════════════════ */
const SHELL_CSS = `
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Source+Serif+4:opsz,wght@8..60,400;8..60,600&family=IBM+Plex+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap" rel="stylesheet">
<style id="lrt-shell">

/* ── Body + typography ─────────────────────────────────────── */
body {
  font-family: 'IBM Plex Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif !important;
  background: #FFFFFF !important;
}
body.dark { background: #111111 !important; }
:root      { --bg: #FFFFFF !important; }
body.dark  { --bg: #111111 !important; }
.container h1 {
  font-family: 'Source Serif 4', Georgia, 'Times New Roman', serif !important;
  font-weight: 600 !important;
  letter-spacing: -0.02em !important;
}
/* Hide tool's own dark toggle — replaced by navbar */
.dark-toggle { display: none !important; }
/* Trim tool container bottom padding; footer adds space */
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
#lrt-nav.lrt-scrolled          { border-bottom-color: #D0CEC9; }
body.dark #lrt-nav             { background: #111111; }
body.dark #lrt-nav.lrt-scrolled{ border-bottom-color: #333333; }

#lrt-nav-inner {
  max-width: min(1440px, calc(100vw - 64px));
  margin: 0 auto; padding: 0 32px; height: 100%;
  display: flex; align-items: center; justify-content: space-between; gap: 16px;
}
#lrt-logo {
  display: flex; align-items: center; gap: 8px;
  font-family: 'Source Serif 4', Georgia, 'Times New Roman', serif;
  font-size: 20px; font-weight: 400; letter-spacing: -0.01em;
  color: #111111; text-decoration: none;
  flex-shrink: 0; white-space: nowrap; transition: opacity .15s;
}
#lrt-logo:hover           { opacity: .65; }
body.dark #lrt-logo       { color: #EEEEEE; }

#lrt-nav-right { display: flex; align-items: center; gap: 6px; }

.lrt-nav-link {
  font-size: 15px; font-weight: 500; color: #3D3D3D;
  text-decoration: none; padding: 5px 10px; border-radius: 4px;
  transition: background .15s, color .15s; white-space: nowrap;
}
.lrt-nav-link:hover            { background: #F5F4F0; color: #111111; }
.lrt-current                   { background: #F5F4F0; color: #111111; font-weight: 600; }
body.dark .lrt-nav-link        { color: #AAAAAA; }
body.dark .lrt-nav-link:hover  { background: #1A1A1A; color: #EEEEEE; }
body.dark .lrt-current         { background: #1A1A1A; color: #EEEEEE; }

/* GitHub icon link */
.lrt-gh-link {
  display: flex; align-items: center;
  padding: 5px 6px;
}
.lrt-gh-link svg { width: 18px; height: 18px; display: block; }

/* Theme toggle — fully reset to defeat tool button CSS */
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
#lrt-theme-btn:hover           { background: #F5F4F0 !important; color: #111111 !important; }
body.dark #lrt-theme-btn       { color: #AAAAAA !important; }
body.dark #lrt-theme-btn:hover { background: #1A1A1A !important; color: #EEEEEE !important; }
#lrt-theme-btn svg { width: 18px !important; height: 18px !important; display: block !important; pointer-events: none; }

/* Show moon in light mode, sun in dark mode */
.lrt-moon { display: block !important; }
.lrt-sun  { display: none  !important; }
body.dark .lrt-moon { display: none  !important; }
body.dark .lrt-sun  { display: block !important; }

/* ── Author section ─────────────────────────────────────────── */
#lrt-author {
  padding: 0 0 80px;
  font-family: 'IBM Plex Sans', -apple-system, BlinkMacSystemFont, sans-serif;
}
#lrt-author-divider {
  width: 100%; height: 2px; background: #D0CEC9; margin-bottom: 48px;
}
body.dark #lrt-author-divider { background: #333333; }

#lrt-author-inner {
  max-width: min(1440px, calc(100vw - 64px));
  margin: 0 auto; padding: 0 32px;
}
#lrt-author-flex {
  display: flex; gap: 32px; align-items: flex-start; max-width: 700px;
}
@media (max-width: 600px) { #lrt-author-flex { flex-direction: column; } }

#lrt-avatar {
  width: 80px; height: 80px; border-radius: 50%;
  object-fit: cover; flex-shrink: 0;
  box-shadow: 0 1px 2px rgba(0,0,0,.06);
}
#lrt-avatar-fallback {
  width: 80px; height: 80px; border-radius: 50%;
  background: #111111; color: #FFFFFF;
  font-family: 'Source Serif 4', Georgia, serif; font-size: 24px;
  display: none; align-items: center; justify-content: center; flex-shrink: 0;
}
body.dark #lrt-avatar-fallback { background: #EEEEEE; color: #111111; }

#lrt-author-name {
  font-family: 'Source Serif 4', Georgia, 'Times New Roman', serif;
  font-size: 22px; font-weight: 400; letter-spacing: -0.01em;
  color: #111111; margin-bottom: 8px;
}
body.dark #lrt-author-name { color: #EEEEEE; }

#lrt-author-roles {
  font-size: 14px; color: #3D3D3D; line-height: 1.7; margin-bottom: 12px;
}
body.dark #lrt-author-roles { color: #AAAAAA; }

#lrt-author-pubs {
  font-size: 14px; color: #888888; line-height: 1.65; margin-bottom: 16px;
}
#lrt-author-pubs em { font-style: italic; }
body.dark #lrt-author-pubs { color: #666666; }

#lrt-author-links { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.lrt-alink {
  font-size: 14px; color: #111111; text-decoration: none; transition: opacity .15s;
}
.lrt-alink:hover { opacity: .65; }
body.dark .lrt-alink { color: #EEEEEE; }
.lrt-asep { color: #888888; font-size: 14px; }
body.dark .lrt-asep { color: #666666; }

/* ── Footer ─────────────────────────────────────────────────── */
#lrt-footer {
  border-top: 1px solid #D0CEC9;
  padding: 56px 0 32px;
  font-family: 'IBM Plex Sans', -apple-system, BlinkMacSystemFont, sans-serif;
  background: #FFFFFF;
}
body.dark #lrt-footer { border-top-color: #333333; background: #111111; }

#lrt-footer-inner {
  max-width: min(1440px, calc(100vw - 64px));
  margin: 0 auto; padding: 0 32px;
}
#lrt-footer-grid {
  display: grid; grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 2rem; margin-bottom: 48px;
}
@media (max-width: 768px) {
  #lrt-footer-grid { grid-template-columns: 1fr 1fr; }
  .lrt-fbrand { grid-column: 1 / -1; }
}
@media (max-width: 480px) {
  #lrt-footer-grid { grid-template-columns: 1fr; }
  #lrt-nav-inner, #lrt-author-inner, #lrt-footer-inner { padding: 0 20px; }
}
.lrt-flogo {
  display: inline-flex; align-items: center; gap: 6px;
  font-family: 'Source Serif 4', Georgia, serif;
  font-size: 16px; color: #111111; text-decoration: none;
  margin-bottom: 10px; transition: opacity .15s;
}
.lrt-flogo:hover { opacity: .7; }
body.dark .lrt-flogo { color: #EEEEEE; }
.lrt-ftagline { font-size: 13px; color: #888888; line-height: 1.6; }
body.dark .lrt-ftagline { color: #666666; }
.lrt-fcol { display: flex; flex-direction: column; gap: 10px; }
.lrt-fheading {
  font-size: 11px; font-weight: 600; letter-spacing: 0.12em;
  text-transform: uppercase; color: #888888; margin-bottom: 4px;
}
body.dark .lrt-fheading { color: #666666; }
.lrt-flink { font-size: 14px; color: #3D3D3D; text-decoration: none; transition: color .15s; }
.lrt-flink:hover { color: #111111; }
body.dark .lrt-flink       { color: #AAAAAA; }
body.dark .lrt-flink:hover { color: #EEEEEE; }
#lrt-footer-bottom {
  border-top: 1px solid #D0CEC9; padding-top: 24px;
  font-size: 13px; color: #888888;
}
body.dark #lrt-footer-bottom { border-top-color: #333333; color: #666666; }
#lrt-footer-bottom a { color: #3D3D3D; text-decoration: none; transition: color .15s; }
#lrt-footer-bottom a:hover { color: #111111; }
body.dark #lrt-footer-bottom a       { color: #AAAAAA; }
body.dark #lrt-footer-bottom a:hover { color: #EEEEEE; }

</style>`.trim();

/* ══════════════════════════════════════════════════════════════
   NAVBAR
══════════════════════════════════════════════════════════════ */
const GH_SVG = `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>`;

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
      <a href="https://github.com/kirinccchang" target="_blank" rel="noopener noreferrer"
         class="lrt-nav-link lrt-gh-link" aria-label="GitHub">${GH_SVG}</a>
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
   AUTHOR SECTION  (identical content to main site)
══════════════════════════════════════════════════════════════ */
const AUTHOR_HTML = `
<!-- ══ lawreview.tools author section ══════════════════════ -->
<section id="lrt-author">
  <div id="lrt-author-inner">
    <div id="lrt-author-divider"></div>
    <div id="lrt-author-flex">
      <img
        src="https://lawreview.tools/avatar.jpeg"
        alt="Kirin Chang"
        id="lrt-avatar"
        width="80" height="80"
        onerror="this.style.display='none';document.getElementById('lrt-avatar-fallback').style.display='flex';"
      />
      <div id="lrt-avatar-fallback" aria-hidden="true">KC</div>
      <div>
        <h2 id="lrt-author-name">Built by Kirin Chang</h2>
        <p id="lrt-author-roles">
          Research Fellow, U.S.-Asia Law Institute · NYU School of Law<br>
          Affiliate Research Fellow, AI &amp; the Future of Work · Emory Law<br>
          Member of the New York and Texas Bars
        </p>
        <p id="lrt-author-pubs">
          Appeared or is forthcoming in print and online journals and books with the
          <em>NYU Law Review</em>, <em>UCLA Law Review</em>,
          <em>Georgetown Law Journal</em>, <em>Minnesota Law Review</em>,
          <em>University of Illinois Law Review</em>, <em>Wisconsin Law Review</em>,
          <em>University of Pennsylvania Journal of International Law</em>,
          among others.
        </p>
        <div id="lrt-author-links">
          <a href="https://kirinchang.com" target="_blank" rel="noopener" class="lrt-alink">kirinchang.com</a>
          <span class="lrt-asep">·</span>
          <a href="https://papers.ssrn.com/sol3/cf_dev/AbsByAuth.cfm?per_id=5438024" target="_blank" rel="noopener" class="lrt-alink">SSRN</a>
          <span class="lrt-asep">·</span>
          <a href="https://scholar.google.com/citations?user=D-z05L0AAAAJ&amp;hl=en" target="_blank" rel="noopener" class="lrt-alink">Google Scholar</a>
          <span class="lrt-asep">·</span>
          <a href="https://github.com/kirinccchang" target="_blank" rel="noopener" class="lrt-alink">GitHub</a>
          <span class="lrt-asep">·</span>
          <a href="https://twitter.com/chengchi_chang" target="_blank" rel="noopener" class="lrt-alink">@chengchi_chang</a>
        </div>
      </div>
    </div>
  </div>
</section>
<!-- ══ end author section ═══════════════════════════════════ -->`.trim();

/* ══════════════════════════════════════════════════════════════
   FOOTER
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
══════════════════════════════════════════════════════════════ */
const SYNC_SCRIPT = `
<script id="lrt-sync">
(function () {
  // Scroll → border
  var nav = document.getElementById('lrt-nav');
  if (nav) window.addEventListener('scroll', function () {
    nav.classList.toggle('lrt-scrolled', window.scrollY > 10);
  }, { passive: true });

  // On Alpine init: apply stored theme preference
  document.addEventListener('alpine:initialized', function () {
    var stored = localStorage.getItem('theme');
    if (stored) {
      var wantsDark = stored === 'dark';
      var isDark    = document.body.classList.contains('dark');
      if (wantsDark !== isDark) {
        var tb = document.querySelector('.dark-toggle');
        if (tb) tb.click();
      }
    }
  });

  // Persist any dark-mode change to localStorage
  new MutationObserver(function () {
    localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
  }).observe(document.body, { attributes: true, attributeFilter: ['class'] });

  // Navbar toggle → forward to tool's hidden button
  document.addEventListener('DOMContentLoaded', function () {
    var btn = document.getElementById('lrt-theme-btn');
    if (btn) btn.addEventListener('click', function () {
      var tb = document.querySelector('.dark-toggle');
      if (tb) tb.click(); else document.body.classList.toggle('dark');
    });
  });
}());
<\/script>`.trim();

/* ══════════════════════════════════════════════════════════════
   TRANSFORMATION PIPELINE
══════════════════════════════════════════════════════════════ */
function transform(html, tool) {
  html = html.replaceAll(tool.oldBase + '/', tool.newCanonical);
  html = html.replaceAll(tool.oldBase,       tool.newCanonical);

  html = html
    .replace(/<link[^>]*rel="icon"[^>]*>\s*/g, '')
    .replace(/<link[^>]*rel="apple-touch-icon"[^>]*>\s*/g, '')
    .replace(
      '<meta charset="UTF-8">',
      '<meta charset="UTF-8">\n  <link rel="icon" type="image/svg+xml" href="/favicon.svg">'
    );

  html = html.replace('</head>', SHELL_CSS + '\n</head>');
  html = html.replace('<body>',  '<body>\n' + buildNavbar(tool.id) + '\n' + SYNC_SCRIPT + '\n');
  html = html.replace('</body>', AUTHOR_HTML + '\n' + FOOTER_HTML + '\n</body>');

  return html;
}

/* ── Main ──────────────────────────────────────────────────── */
console.log('\n📦 Fetching and integrating tool builds...\n');
for (const tool of TOOLS) {
  const url = `https://raw.githubusercontent.com/${tool.repo}/main/index.html`;
  try {
    const res = await fetch(url);
    if (!res.ok) { console.warn(`  ⚠  ${tool.repo}: HTTP ${res.status}`); continue; }
    writeFileSync(tool.dest, transform(await res.text(), tool), 'utf-8');
    console.log(`  ✓  ${tool.repo} → ${tool.dest}`);
  } catch (err) {
    console.warn(`  ⚠  ${tool.repo}: ${err.message}`);
  }
}
console.log('\n✅ Done.\n');
