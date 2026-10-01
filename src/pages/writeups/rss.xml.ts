import type { APIContext } from 'astro';
import { SITE } from '~site';
import { getWriteups } from '@/lib/posts';
import { feed } from '@/lib/feed';

export async function GET(context: APIContext) {
  return feed(context, await getWriteups(), {
    title: `${SITE.title} — writeups`,
    description: 'CTF, HTB and THM writeups.',
    self: '/writeups/rss.xml',
  });
}
