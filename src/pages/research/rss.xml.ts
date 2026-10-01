import type { APIContext } from 'astro';
import { SITE } from '~site';
import { getResearch } from '@/lib/posts';
import { feed } from '@/lib/feed';

export async function GET(context: APIContext) {
  return feed(context, await getResearch(), {
    title: `${SITE.title} — research`,
    description: 'Original security research and disclosures.',
    self: '/research/rss.xml',
  });
}
