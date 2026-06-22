// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://tooltails.com',
  devToolbar: {
    enabled: false
  },
  integrations: [
    sitemap({
      customPages: [
        'https://tooltails.com/word-counter/',
        'https://tooltails.com/word-counter/about/',
        'https://tooltails.com/word-counter/blog/',
        'https://tooltails.com/word-counter/blog/average-blog-post-length-seo-2026/',
        'https://tooltails.com/word-counter/blog/character-limits-social-media/',
        'https://tooltails.com/word-counter/blog/how-many-words-5-minute-speech/',
        'https://tooltails.com/word-counter/blog/how-many-words-10-minute-speech/',
        'https://tooltails.com/word-counter/blog/how-to-improve-readability/',
        'https://tooltails.com/word-counter/blog/reading-time-vs-speaking-time/',
        'https://tooltails.com/word-counter/blog/what-is-good-readability-score/',
        'https://tooltails.com/word-counter/blog/word-count-vs-character-count/',
        'https://tooltails.com/word-counter/contact/',
        'https://tooltails.com/word-counter/privacy/',
        'https://tooltails.com/word-counter/terms/',
        'https://tooltails.com/word-counter/word-counter/',
      ]
    })
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});