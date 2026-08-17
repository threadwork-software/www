import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineConfig } from 'astro/config';

import sitemap from '@astrojs/sitemap';
import icon from 'astro-icon';
import compress from 'astro-compress';
import tailwindcss from '@tailwindcss/vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  site: 'https://www.threadworksoftware.com',
  output: 'static',

  // build.format 'directory' serves /page/ and 301s /page to it. Emitting the
  // non-slash form in the sitemap would make every entry a redirect, which is
  // the Search Console warning openscorm/www had to fix (OQ, GSC "Page with
  // redirect"). Align the sitemap, the canonicals, and what is actually served.
  trailingSlash: 'always',
  build: {
    format: 'directory',
  },

  integrations: [
    sitemap({
      serialize: (item) => ({
        ...item,
        url: item.url.endsWith('/') ? item.url : `${item.url}/`,
      }),
    }),

    icon({
      include: {
        tabler: ['*'],
      },
    }),

    compress({
      CSS: true,
      HTML: {
        'html-minifier-terser': {
          removeAttributeQuotes: false,
        },
      },
      Image: false,
      JavaScript: true,
      SVG: false,
      Logger: 1,
    }),
  ],

  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '~': path.resolve(__dirname, './src'),
      },
    },
  },
});
