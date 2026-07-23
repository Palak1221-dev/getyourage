// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  site: 'https://tooltails.com',
  output: 'server',
  adapter: vercel(),
  devToolbar: {
    enabled: false
  },
  integrations: [
    sitemap({
      filter: (page) => !page.includes('404') && !page.includes('500')
    })
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});