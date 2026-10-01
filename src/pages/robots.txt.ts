import type { APIContext } from 'astro';
import { withBase } from '@/lib/url';

export function GET({ site }: APIContext) {
  const sitemap = new URL(withBase('/sitemap-index.xml'), site ?? 'http://localhost:4321');
  return new Response(`User-agent: *\nAllow: /\nDisallow: /search/\n\nSitemap: ${sitemap}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
