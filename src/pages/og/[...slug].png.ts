/**
 * Build-time Open Graph images (1200×630 PNG) with Satori + resvg.
 *   /og/default.png                 → site card (home + index pages)
 *   /og/research/<id>.png           → per post
 *   /og/writeups/<id>.png
 * Satori can't read woff2, so OG-only .woff copies live in src/assets/og/.
 */
import type { APIRoute, GetStaticPaths } from 'astro';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { SITE } from '~site';
import { formatDate, getAllPosts, isResearch, type AnyPost } from '@/lib/posts';

type Card = { kind: string; kindBg: string; title: string; meta: string; cve?: string };

export const getStaticPaths = (async () => {
  const posts = await getAllPosts();
  return [
    { params: { slug: 'default' }, props: { post: undefined } },
    ...posts.map((post) => ({ params: { slug: `${post.collection}/${post.id}` }, props: { post } })),
  ];
}) satisfies GetStaticPaths;

const C = { void: '#0E0E13', panel: '#16161D', bone: '#F1EEE6', muted: '#B8B5AD', lime: '#B6FF3B', cyan: '#35E0FF', orange: '#FF6A3D', violet: '#7C5CFF', ink: '#111111' };

let fonts: { name: string; data: Buffer; weight: 400 | 500 | 700; style: 'normal' }[] | undefined;
async function loadFonts() {
  const f = (p: string) => readFile(resolve(process.cwd(), 'src/assets/og', p));
  fonts ??= [
    { name: 'Anton', data: await f('anton-400.woff'), weight: 400, style: 'normal' },
    { name: 'JetBrains Mono', data: await f('jetbrains-mono-700.woff'), weight: 700, style: 'normal' },
    { name: 'DM Sans', data: await f('dm-sans-500.woff'), weight: 500, style: 'normal' },
  ];
  return fonts;
}

const eyeSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><path d="M3 24C11 9 37 9 45 24C37 39 11 39 3 24Z" fill="${C.void}" stroke="${C.bone}" stroke-width="3.5" stroke-linejoin="round"/><circle cx="24" cy="24" r="9.5" fill="${C.lime}" stroke="${C.bone}" stroke-width="3"/><circle cx="24" cy="24" r="3.8" fill="${C.void}"/><circle cx="27.2" cy="20.8" r="1.8" fill="${C.bone}"/></svg>`;
const eyeUri = `data:image/svg+xml;base64,${Buffer.from(eyeSvg).toString('base64')}`;

function cardFor(post?: AnyPost): Card {
  if (!post) return { kind: 'Security research & writeups', kindBg: C.lime, title: 'I watch. I break. I write up.', meta: SITE.description };
  const tags = post.data.tags.slice(0, 3).map((t) => `#${t}`).join('  ');
  if (isResearch(post)) {
    return { kind: 'Research', kindBg: C.lime, title: post.data.title, meta: `${formatDate(post.data.date)}   ${tags}`, cve: post.data.cve?.[0] };
  }
  const d = post.data;
  return { kind: `${d.platform} · ${d.category} · ${d.difficulty}`, kindBg: C.orange, title: d.title, meta: `${formatDate(d.date)}   ${tags}`, cve: d.cve?.[0] };
}

// Tiny hyperscript for Satori's object syntax.
type Node = { type: string; props: Record<string, unknown> };
const h = (type: string, style: Record<string, unknown>, children?: unknown, extra: Record<string, unknown> = {}): Node => ({
  type,
  props: { style: { display: 'flex', ...style }, children, ...extra },
});

export const GET: APIRoute = async ({ props }) => {
  const card = cardFor((props as { post?: AnyPost }).post);
  const size = card.title.length < 36 ? 96 : card.title.length < 64 ? 80 : 64;

  const chip = (text: string, bg: string, color: string) =>
    h('div', { padding: '6px 18px', border: `4px solid ${C.bone}`, borderRadius: 999, background: bg, color, fontFamily: 'JetBrains Mono', fontSize: 22, letterSpacing: 2, textTransform: 'uppercase' }, text);

  const tree = h('div', { width: 1200, height: 630, background: C.void, padding: 44, fontFamily: 'DM Sans' }, [
    // hard shadow + frame
    h('div', { position: 'relative', width: '100%', height: '100%' }, [
      h('div', { position: 'absolute', left: 14, top: 14, width: '100%', height: '100%', background: card.kindBg }),
      h('div', { position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', background: C.panel, border: `5px solid ${C.bone}`, padding: '40px 52px', flexDirection: 'column', justifyContent: 'space-between' }, [
        h('div', { alignItems: 'center', justifyContent: 'space-between' }, [
          h('div', { alignItems: 'center', gap: 18 }, [
            h('img', {}, undefined, { src: eyeUri, width: 64, height: 64 }),
            h('div', { fontFamily: 'Anton', fontSize: 40, color: C.bone, letterSpacing: 2 }, 'DARK-ARGUS'),
          ]),
          chip(card.kind, card.kindBg, C.ink),
        ]),
        h('div', { fontFamily: 'Anton', fontSize: size, lineHeight: 1, color: C.bone, textTransform: 'uppercase', maxWidth: 1000 }, card.title),
        h('div', { alignItems: 'center', justifyContent: 'space-between', gap: 24 }, [
          h('div', { fontFamily: 'JetBrains Mono', fontSize: 24, color: C.muted, letterSpacing: 1 }, card.meta),
          card.cve ? chip(card.cve, C.ink, C.bone) : h('div', { width: 64, height: 12, background: C.lime }),
        ]),
      ]),
    ]),
  ]);

  const svg = await satori(tree as unknown as Parameters<typeof satori>[0], { width: 1200, height: 630, fonts: await loadFonts() });
  const png = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } }).render().asPng();
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};
