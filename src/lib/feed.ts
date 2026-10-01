/** Shared RSS builder for /rss.xml, /research/rss.xml and /writeups/rss.xml. */
import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { SITE } from '~site';
import { withBase } from './url';
import { isResearch, postPath, type AnyPost } from './posts';

export function feed(context: APIContext, posts: AnyPost[], opts: { title: string; description: string; self: string }) {
  const site = context.site ?? new URL('http://localhost:4321');
  return rss({
    title: opts.title,
    description: opts.description,
    site: new URL(withBase('/'), site).toString(),
    trailingSlash: true,
    xmlns: { atom: 'http://www.w3.org/2005/Atom' },
    customData: [
      `<language>${SITE.locale}</language>`,
      `<atom:link href="${new URL(withBase(opts.self), site)}" rel="self" type="application/rss+xml" />`,
    ].join(''),
    items: posts.map((p) => ({
      title: p.data.title,
      pubDate: p.data.date,
      description: p.data.summary,
      link: withBase(postPath(p)),
      categories: [isResearch(p) ? 'research' : `writeup:${p.data.platform}`, ...p.data.tags, ...(p.data.cve ?? [])],
      author: `${SITE.author.email} (${SITE.author.name})`,
    })),
  });
}
