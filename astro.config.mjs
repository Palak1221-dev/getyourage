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
  trailingSlash: 'always',
  devToolbar: {
    enabled: false
  },
  integrations: [
    sitemap({
      filter: (page) => {
        if (page.includes('404') || page.includes('500')) return false;
        // Exclude legacy alias URLs that redirect to canonical product pages
        const aliases = ['study-planner', 'revision-tracker', 'resume-optimizer-kit', 'habit-tracker', 'budget-planner'];
        if (aliases.some((a) => page.includes('/digital-store/' + a + '/'))) return false;
        // Exclude checkout and payment-confirmation pages (noindex, nofollow)
        if (page.includes('/digital-store/checkout/')) return false;
        if (page.includes('/payment-')) return false;
        // Exclude gated planner apps (noindex, nofollow)
        if (page.includes('/app/')) return false;
        return true;
      }
    })
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});