// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { loadEnv } from 'vite';

// The Web3Forms access key is public by design (it appears in the page),
// but it lives in .env.local / a GitHub secret so it's set in one place.
const env = loadEnv('', process.cwd(), '');
const formKey = env.FORM_ACCESS_KEY || process.env.FORM_ACCESS_KEY || '';

export default defineConfig({
  site: 'https://2ohairsolutions.com',
  output: 'static',
  trailingSlash: 'ignore',
  compressHTML: true,
  build: { format: 'directory' },
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/thank-you') && !page.includes('/404'),
    }),
  ],
  vite: {
    define: {
      'import.meta.env.FORM_ACCESS_KEY': JSON.stringify(formKey),
    },
  },
});
