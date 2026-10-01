/**
 * Shiki transformer: tags every block as source code or a terminal session
 * and prepares terminal lines for styling and copying.
 *
 *   ```go title="auth/session.go"   → data-kind="code",     data-title
 *   ```console / ```terminal        → data-kind="terminal": "$ " prompts are
 *                                      split into <span class="prompt">, command
 *                                      lines get .cmd, everything else .out
 *   ```output                       → data-kind="terminal", all lines .out
 *
 * Prompts and output lines carry data-nocopy, so the copy button copies just
 * the commands (see scripts/copy.ts). The wrapper frame + copy button are
 * added afterwards by rehype-code-frames.ts.
 */
import type { ShikiTransformer } from 'shiki';
import type { Element, ElementContent } from 'hast';

export const TERMINAL_LANGS = new Set(['console', 'shellsession', 'shell-session', 'sh-session', 'terminal', 'output']);

// "$ ", "# ", "PS C:\> ", ">>> ", "user@host:~$ "
const PROMPT = /^(?:[\w.-]+@[\w.-]+(?::[^$#\n]*)?)?(?:\$|#|>>>|PS [^>\n]*>)\s/;

const textOf = (n: ElementContent): string =>
  n.type === 'text' ? n.value : n.type === 'element' ? n.children.map(textOf).join('') : '';

function addClass(el: Element, cls: string) {
  const cur = el.properties.class;
  el.properties.class = [cur, cls].filter(Boolean).join(' ');
}

/** Remove the first `len` characters of visible text from a line and return them. */
function stripLeading(line: Element, len: number): void {
  let left = len;
  const walk = (children: ElementContent[]) => {
    for (let i = 0; i < children.length && left > 0; i++) {
      const child = children[i]!;
      if (child.type === 'text') {
        const take = Math.min(left, child.value.length);
        child.value = child.value.slice(take);
        left -= take;
      } else if (child.type === 'element') {
        walk(child.children);
      }
    }
  };
  walk(line.children);
}

export function transformerFrames(): ShikiTransformer {
  return {
    name: 'argus:frames',
    pre(node) {
      const lang = String(this.options.lang ?? 'plaintext').toLowerCase();
      const raw = (this.options.meta as { __raw?: string } | undefined)?.__raw ?? '';
      const title = /title=(["'])(.*?)\1/.exec(raw)?.[2];
      node.properties.dataLang = lang;
      node.properties.dataKind = TERMINAL_LANGS.has(lang) ? 'terminal' : 'code';
      if (title) node.properties.dataTitle = title;
    },
    code(node) {
      const lang = String(this.options.lang ?? '').toLowerCase();
      if (!TERMINAL_LANGS.has(lang)) return;
      const allOutput = lang === 'output';
      let continuing = false; // previous command ended with "\"

      for (const line of node.children) {
        if (line.type !== 'element') continue;
        const text = textOf(line);

        if (allOutput) {
          addClass(line, 'out');
          continue;
        }
        if (continuing) {
          addClass(line, 'cmd');
          continuing = /\\\s*$/.test(text);
          continue;
        }
        const m = PROMPT.exec(text);
        if (m) {
          stripLeading(line, m[0].length);
          line.children.unshift({
            type: 'element',
            tagName: 'span',
            properties: { class: 'prompt', dataNocopy: '' },
            children: [{ type: 'text', value: m[0] }],
          });
          addClass(line, 'cmd');
          continuing = /\\\s*$/.test(text);
        } else {
          addClass(line, 'out');
          line.properties.dataNocopy = '';
        }
      }
    },
  };
}
