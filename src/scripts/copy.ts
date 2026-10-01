/**
 * Copy-to-clipboard for any <button data-copy="text"> or
 * <button data-copy-target="css selector">. Buttons ship `hidden` and are
 * revealed here, so no-JS visitors never see a dead control.
 * Used by the RSS card and every code block.
 */
const live = document.createElement('div');
live.className = 'visually-hidden';
live.setAttribute('aria-live', 'polite');
document.body.append(live);

function textFor(btn: HTMLButtonElement): string {
  if (btn.dataset.copy) return btn.dataset.copy;
  const sel = btn.dataset.copyTarget;
  const scope = btn.closest('[data-copy-scope]') ?? document;
  const el = sel ? scope.querySelector<HTMLElement>(sel) : null;
  if (!el) return '';
  // Terminal blocks: skip prompts / output marked data-nocopy.
  const clone = el.cloneNode(true) as HTMLElement;
  clone.querySelectorAll('[data-nocopy]').forEach((n) => n.remove());
  let text = clone.textContent ?? '';
  // Terminal blocks: removed output lines leave blank lines behind.
  if (el.closest('.code-frame--terminal')) text = text.split('\n').filter((l) => l.trim()).join('\n');
  return text.replace(/\n$/, '');
}

for (const btn of document.querySelectorAll<HTMLButtonElement>('button[data-copy], button[data-copy-target]')) {
  btn.hidden = false;
  const idle = btn.textContent ?? 'Copy';
  btn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(textFor(btn));
      btn.textContent = 'Copied!';
      btn.dataset.state = 'copied';
      live.textContent = 'Copied to clipboard';
    } catch {
      btn.textContent = 'Press Ctrl+C';
      live.textContent = 'Copy failed — select the text and press Ctrl+C';
    }
    setTimeout(() => {
      btn.textContent = idle;
      delete btn.dataset.state;
    }, 1800);
  });
}

export {}; // module scope (keeps top-level names private)
