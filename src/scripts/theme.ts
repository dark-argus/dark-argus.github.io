/**
 * Theme toggle (void ⇄ paper). The initial theme is already set before
 * paint by /theme-init.js; this only wires up the button(s) and keeps
 * following the OS preference until the user makes an explicit choice.
 */
type Theme = 'void' | 'paper';
const root = document.documentElement;
const current = (): Theme => (root.dataset.theme === 'paper' ? 'paper' : 'void');

function apply(theme: Theme, persist: boolean) {
  root.dataset.theme = theme;
  if (persist) {
    try {
      localStorage.setItem('theme', theme);
    } catch {
      /* storage blocked */
    }
  }
  const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (meta) meta.content = theme === 'paper' ? '#F1EEE6' : '#0E0E13';
  for (const btn of document.querySelectorAll<HTMLButtonElement>('[data-theme-toggle]')) {
    btn.setAttribute('aria-pressed', String(theme === 'paper'));
    btn.title = theme === 'paper' ? 'Switch to void (dark) theme' : 'Switch to paper (light) theme';
  }
}

for (const btn of document.querySelectorAll<HTMLButtonElement>('[data-theme-toggle]')) {
  btn.addEventListener('click', () => apply(current() === 'void' ? 'paper' : 'void', true));
}

window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', (e) => {
  let saved: string | null = null;
  try {
    saved = localStorage.getItem('theme');
  } catch {
    /* ignore */
  }
  if (!saved) apply(e.matches ? 'paper' : 'void', false);
});

apply(current(), false);

export {}; // module scope (keeps top-level names private)
