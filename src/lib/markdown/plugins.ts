/**
 * HAST plugins for Astro 7's default Markdown processor (Sätteri).
 * They run AFTER Shiki highlighting and BEFORE Astro's image + heading-id
 * passes, for both .md and .mdx.
 *
 *  - callouts:        > [!NOTE] / [!TIP] / [!WARNING] / [!CAUTION] / [!IMPORTANT]
 *  - code frames:     wrap Shiki <pre> in a <figure> with a label bar + copy button
 *  - heading anchors: stable ids + an empty "#" permalink (text stays clean for the TOC)
 *  - external links:  rel="noopener noreferrer"
 *  - tables:          keyboard-scrollable wrapper
 *  - figures:         a paragraph holding only an image becomes <figure>
 */
import { defineHastPlugin, type HastPluginEntry } from 'satteri';
import GithubSlugger from 'github-slugger';
import type { Element, ElementContent } from 'hast';

const el = (tagName: string, properties: Element['properties'], children: ElementContent[] = []): Element => ({
  type: 'element',
  tagName,
  properties,
  children,
});
const txt = (value: string): ElementContent => ({ type: 'text', value });
const isWs = (n: ElementContent) => n.type === 'text' && !n.value.trim();

/* ---- callouts ---------------------------------------------------------- */
const CALLOUT_LABEL: Record<string, string> = {
  note: 'Note',
  tip: 'Tip',
  warning: 'Warning',
  caution: 'Caution',
  important: 'Important',
};

const callouts = defineHastPlugin({
  name: 'argus-callouts',
  element: {
    filter: ['blockquote'],
    visit(node) {
      const firstP = node.children.find((c): c is Element => c.type === 'element' && c.tagName === 'p');
      const first = firstP?.children[0];
      if (!firstP || first?.type !== 'text') return;
      const m = /^\s*\[!(note|tip|warning|caution|important)\][ \t]*\n?/i.exec(first.value);
      if (!m) return;
      const kind = m[1]!.toLowerCase();

      const restFirst: ElementContent[] = [txt(first.value.slice(m[0].length)), ...firstP.children.slice(1)];
      const pHasContent = restFirst.some((c) => !isWs(c));
      const body = node.children.flatMap((c) => {
        if (c !== firstP) return [c];
        return pHasContent ? [el('p', { ...firstP.properties }, restFirst)] : [];
      });

      return el('div', { className: ['callout', `callout--${kind}`], role: 'note', ariaLabel: CALLOUT_LABEL[kind] }, [
        el('p', { className: ['callout-label'], ariaHidden: 'true' }, [txt(CALLOUT_LABEL[kind]!)]),
        el('div', { className: ['callout-body'] }, body),
      ]);
    },
  },
});

/* ---- code frames ------------------------------------------------------- */
const LANG_LABEL: Record<string, string> = {
  js: 'javascript',
  ts: 'typescript',
  py: 'python',
  sh: 'shell',
  plaintext: 'text',
  txt: 'text',
};

const codeFrames = defineHastPlugin({
  name: 'argus-code-frames',
  element: {
    filter: ['pre'],
    visit(node, ctx) {
      const p = node.properties ?? {};
      const kind = p.dataKind;
      if (kind !== 'code' && kind !== 'terminal') return; // not a Shiki block
      const lang = String(p.dataLang ?? 'text');
      const title = p.dataTitle ? String(p.dataTitle) : '';
      const terminal = kind === 'terminal';
      const label = terminal
        ? ['Terminal', title].filter(Boolean).join(' · ')
        : [LANG_LABEL[lang] ?? lang, title].filter(Boolean).join(' · ');

      ctx.wrapNode(
        node,
        el(
          'figure',
          {
            className: ['code-frame', terminal ? 'code-frame--terminal' : 'code-frame--code'],
            dataCopyScope: '',
          },
          [
            el('figcaption', { className: ['code-bar'] }, [
              el('span', { className: ['code-label'] }, [txt(label)]),
              // hidden until scripts/copy.ts can make it work
              el('button', { type: 'button', className: ['code-copy'], dataCopyTarget: 'pre code', hidden: true }, [
                txt('Copy'),
              ]),
            ]),
          ],
        ),
      );
    },
  },
});

/* ---- heading anchors ---------------------------------------------------- */
// Factory → a fresh slugger per document (same algorithm Astro uses).
const headingAnchors: HastPluginEntry = () => {
  const slugger = new GithubSlugger();
  return defineHastPlugin({
    name: 'argus-heading-anchors',
    element: {
      filter: ['h2', 'h3', 'h4'],
      visit(node, ctx) {
        const text = ctx.textContent(node).trim();
        const id = typeof node.properties?.id === 'string' ? node.properties.id : slugger.slug(text);
        ctx.setProperty(node, 'id', id);
        // Empty link: its text doesn't leak into the TOC; "#" is drawn in CSS.
        ctx.appendChild(node, el('a', { className: ['heading-anchor'], href: `#${id}`, ariaLabel: `Link to section: ${text}` }));
      },
    },
  });
};

/* ---- external links ----------------------------------------------------- */
const externalLinks = defineHastPlugin({
  name: 'argus-external-links',
  element: {
    filter: ['a'],
    visit(node, ctx) {
      const href = node.properties?.href;
      if (typeof href === 'string' && /^https?:\/\//i.test(href)) {
        ctx.setProperty(node, 'rel', ['noopener', 'noreferrer']);
      }
    },
  },
});

/* ---- tables ------------------------------------------------------------- */
const tables = defineHastPlugin({
  name: 'argus-tables',
  element: {
    filter: ['table'],
    visit(node, ctx) {
      // Focusable so keyboard users can scroll wide tables.
      ctx.wrapNode(node, el('div', { className: ['table-wrap'], tabIndex: 0, role: 'region', ariaLabel: 'Table' }));
    },
  },
});

/* ---- figures ------------------------------------------------------------ */
const figures = defineHastPlugin({
  name: 'argus-figures',
  element: {
    filter: ['p'],
    visit(node) {
      const kids = node.children.filter((c) => !isWs(c));
      const img = kids[0];
      if (kids.length !== 1 || img?.type !== 'element' || img.tagName !== 'img') return;
      const title = img.properties?.title;
      return el('figure', { className: ['figure'] }, [
        img,
        ...(typeof title === 'string' && title ? [el('figcaption', {}, [txt(title)])] : []),
      ]);
    },
  },
});

export const hastPlugins: HastPluginEntry[] = [callouts, codeFrames, headingAnchors, externalLinks, tables, figures];
