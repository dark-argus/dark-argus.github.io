/**
 * Collection helpers: one place for "published, sorted, with URL".
 * Drafts are visible in `astro dev` and excluded from production builds.
 */
import { getCollection, type CollectionEntry } from 'astro:content';

export type Research = CollectionEntry<'research'>;
export type Writeup = CollectionEntry<'writeups'>;
export type AnyPost = Research | Writeup;

const visible = (p: AnyPost) => import.meta.env.DEV || !p.data.draft;
const newestFirst = (a: AnyPost, b: AnyPost) => b.data.date.valueOf() - a.data.date.valueOf();

export async function getResearch(): Promise<Research[]> {
  return (await getCollection('research', visible)).sort(newestFirst);
}

export async function getWriteups(): Promise<Writeup[]> {
  return (await getCollection('writeups', visible)).sort(newestFirst);
}

export async function getAllPosts(): Promise<AnyPost[]> {
  return [...(await getResearch()), ...(await getWriteups())].sort(newestFirst);
}

/** Base-relative URL of a post, e.g. "/research/some-slug/". */
export function postPath(p: AnyPost): string {
  return `/${p.collection}/${p.id}/`;
}

export const isResearch = (p: AnyPost): p is Research => p.collection === 'research';

/** "SEP 12, 2026" style used across cards and meta lines. */
export function formatDate(d: Date): string {
  return d
    .toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit', timeZone: 'UTC' })
    .toUpperCase();
}

/** ISO yyyy-mm-dd for <time datetime> and timelines. */
export const isoDate = (d: Date) => d.toISOString().slice(0, 10);

/** Unique sorted tag list with counts. */
export function tagCounts(posts: AnyPost[]): { tag: string; count: number }[] {
  const m = new Map<string, number>();
  for (const p of posts) for (const t of p.data.tags) m.set(t, (m.get(t) ?? 0) + 1);
  return [...m].map(([tag, count]) => ({ tag, count })).sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

/**
 * Map free-text disclosure events to short stage labels for compact
 * displays (homepage featured card). Falls back to the event's date.
 */
export function disclosureStages(events: { date: Date; event: string }[] = []) {
  const rules: [RegExp, string, 'lime' | 'cyan' | 'orange' | 'bone'][] = [
    [/report|notif|contact/i, 'Reported', 'lime'],
    [/ack|confirm|reproduc|triag/i, 'Acknowledged', 'cyan'],
    [/fix|patch|release|ship|mitigat/i, 'Fixed', 'orange'],
    [/publish|disclos/i, 'Published', 'bone'],
  ];
  return events.map((e) => {
    const hit = rules.find(([re]) => re.test(e.event));
    return hit
      ? { label: hit[1], accent: hit[2], title: `${isoDate(e.date)} — ${e.event}` }
      : { label: formatDate(e.date), accent: 'bone' as const, title: e.event };
  });
}

/**
 * Reading time from the raw Markdown body (works on listings without
 * rendering each post). Code blocks count at a slower pace than prose.
 */
export function readingMinutes(p: AnyPost): number {
  const body = p.body ?? '';
  const code = [...body.matchAll(/```[\s\S]*?```/g)].map((m) => m[0]).join('\n');
  const prose = body.replace(/```[\s\S]*?```/g, ' ');
  const words = (s: string) => (s.match(/\S+/g) ?? []).length;
  return Math.max(1, Math.round(words(prose) / 230 + words(code) / 100));
}
