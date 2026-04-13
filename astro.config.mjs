import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://lawreview.tools',
  compressHTML: true,
  vite: {
    css: {
      transformer: 'lightningcss',
    },
    build: {
      cssMinify: 'lightningcss',
    },
  },
});
