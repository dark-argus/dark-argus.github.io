import type { APIContext } from 'astro';
import { SITE } from '~site';
import { getAllPosts } from '@/lib/posts';
import { feed } from '@/lib/feed';

export async function GET(context: APIContext) {
  return feed(context, await getAllPosts(), {
    title: SITE.title,
    description: SITE.description,
    self: '/rss.xml',
  });
}
