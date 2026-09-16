// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

/**
 * Deployment target is configured in exactly one place.
 *
 * - Default: the GitHub Pages user site (https://joao-afonso-p.github.io, base "/").
 * - Project repo: set BASE_PATH=/repo-name.
 * - Custom domain: set SITE_URL=https://joaoafonso.com and add public/CNAME.
 *
 * Nothing else in the codebase hardcodes the deployed origin.
 */
const SITE_URL = process.env.SITE_URL ?? 'https://joao-afonso-p.github.io';
const BASE_PATH = process.env.BASE_PATH ?? '/';

export default defineConfig({
  site: SITE_URL,
  base: BASE_PATH,
  // Pages are emitted as directories and linked with a trailing slash, so
  // internal links, canonicals and the sitemap all agree on one URL shape.
  trailingSlash: 'always',
  build: { format: 'directory' },
  integrations: [mdx(), sitemap()],
  // `subsets` is deliberately latin-only: <Font preload> fetches every subset
  // unconditionally, ignoring unicode-range, and no glyph on the site needs
  // latin-ext (a, e-acute, em dash and middle dot all live in latin).
  // Add 'latin-ext' back if content ever needs it.
  fonts: [
    {
      provider: fontProviders.google(),
      name: 'Schibsted Grotesk',
      cssVariable: '--font-schibsted-grotesk',
      weights: ['400 700'],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['Helvetica Neue', 'Arial', 'sans-serif'],
    },
    {
      provider: fontProviders.google(),
      name: 'IBM Plex Mono',
      cssVariable: '--font-ibm-plex-mono',
      weights: [400, 500],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['ui-monospace', 'SFMono-Regular', 'monospace'],
    },
  ],
  markdown: {
    shikiConfig: { theme: 'github-light', wrap: true },
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
