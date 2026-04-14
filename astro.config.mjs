import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://lawreview.tools',
  compressHTML: true,
  build: {
    // Inline all component CSS into HTML — eliminates hashed /_astro/*.css
    // files that can cause MIME-type 404s if CDN deployment is partial.
    inlineStylesheets: 'always',
  },
});
