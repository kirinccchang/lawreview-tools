/**
 * fetch-tools.mjs
 *
 * Runs as `prebuild` before Astro compiles.
 * Pulls the latest index.html from each tool repo so Cloudflare Pages
 * always serves the current version of PermaDrop and SupraDrop.
 */

import { writeFileSync } from 'fs';

const tools = [
  {
    repo: 'kirinccchang/permadrop',
    file: 'index.html',
    dest: 'public/permadrop/index.html',
  },
  {
    repo: 'kirinccchang/supradrop',
    file: 'index.html',
    dest: 'public/supradrop/index.html',
  },
];

console.log('\n📦 Fetching latest tool builds from GitHub...');

for (const { repo, file, dest } of tools) {
  const url = `https://raw.githubusercontent.com/${repo}/main/${file}`;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`  ⚠️  ${repo}: HTTP ${res.status} — keeping committed version`);
      continue;
    }
    const content = await res.text();
    writeFileSync(dest, content, 'utf-8');
    console.log(`  ✓  ${repo} → ${dest}`);
  } catch (err) {
    console.warn(`  ⚠️  ${repo}: ${err.message} — keeping committed version`);
  }
}

console.log('');
