import { defineConfig, fontProviders } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { satteri } from '@astrojs/markdown-satteri';
import { SITE } from './site.config';
import { argusTheme } from './src/lib/markdown/argus-theme';
import { transformerFrames } from './src/lib/markdown/shiki-frames';
import { hastPlugins } from './src/lib/markdown/plugins';

// CI (GitHub Pages workflow) injects SITE_URL / BASE_PATH so the same repo
// works as a user site, a project site (/repo-name) or a custom domain.
const site = process.env.SITE_URL || SITE.url;
const base = process.env.BASE_PATH || SITE.base;

/** Self-hosted local font helper (files live in src/assets/fonts). */
const localFont = (
  name: string,
  cssVariable: string,
  fallbacks: string[],
  variants: { src: string; weight: string | number; style?: 'normal' | 'italic' }[],
) => ({
  provider: fontProviders.local(),
  name,
  cssVariable,
  fallbacks,
  // "swap" + Astro's metric-matched fallbacks keeps CLS at ~0.
  display: 'swap' as const,
  options: {
    variants: variants.map((v) => ({ src: [v.src], weight: v.weight, style: v.style ?? 'normal' })) as [
      { src: [string]; weight: string | number; style: 'normal' | 'italic' },
      ...{ src: [string]; weight: string | number; style: 'normal' | 'italic' }[],
    ],
  },
});

export default defineConfig({
  site,
  base,
  trailingSlash: 'ignore',
  output: 'static',

  integrations: [
    mdx(),
    // /search/ is noindex + disallowed in robots.txt, keep it out of the sitemap too
    sitemap({ filter: (page) => !/\/search\/?$/.test(new URL(page).pathname) }),
  ],

  markdown: {
    // Astro 7's default processor; our HAST plugins run after Shiki.
    processor: satteri({ hastPlugins }),
    shikiConfig: {
      theme: argusTheme,
      // `output` = plain program output, `terminal` = a shell session.
      langAlias: { output: 'plaintext', terminal: 'shellsession' },
      transformers: [transformerFrames()],
    },
  },

  fonts: [
    localFont('Anton', '--font-display', ['Impact', 'Arial Narrow', 'sans-serif'], [
      { src: './src/assets/fonts/anton-400.woff2', weight: 400 },
    ]),
    localFont('Caveat', '--font-script', ['Comic Sans MS', 'cursive'], [
      { src: './src/assets/fonts/caveat-600.woff2', weight: 600 },
    ]),
    localFont('DM Sans', '--font-body', ['system-ui', 'Segoe UI', 'Roboto', 'sans-serif'], [
      { src: './src/assets/fonts/dm-sans-var.woff2', weight: '100 1000' },
      { src: './src/assets/fonts/dm-sans-var-italic.woff2', weight: '100 1000', style: 'italic' },
    ]),
    localFont('JetBrains Mono', '--font-mono', ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'], [
      { src: './src/assets/fonts/jetbrains-mono-var.woff2', weight: '100 800' },
    ]),
  ],

  vite: {
    build: {
      // Never inline JS as data: URIs / inline <script> — keeps CSP `script-src 'self'` strict.
      assetsInlineLimit: 0,
    },
  },
});
