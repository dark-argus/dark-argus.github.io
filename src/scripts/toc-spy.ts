/**
 * TOC scroll-spy: marks the section currently being read with
 * aria-current="location" in every [data-toc] (sidebar + mobile).
 * A heading is "current" once it has scrolled above the top ~third.
 */
const tocs = [...document.querySelectorAll<HTMLElement>('[data-toc]')];
const links = tocs.flatMap((t) => [...t.querySelectorAll<HTMLAnchorElement>('a[href^="#"]')]);
const ids = [...new Set(links.map((a) => decodeURIComponent(a.hash.slice(1))))];
const headings = ids.map((id) => document.getElementById(id)).filter((h): h is HTMLElement => !!h);

let ticking = false;
let current = '';

function update() {
  ticking = false;
  const line = window.innerHeight * 0.3;
  let active = headings[0]?.id ?? '';
  for (const h of headings) {
    if (h.getBoundingClientRect().top <= line) active = h.id;
    else break;
  }
  // At the very bottom, the last section wins even if it's short.
  if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
    active = headings.at(-1)?.id ?? active;
  }
  if (active === current) return;
  current = active;
  for (const a of links) {
    if (decodeURIComponent(a.hash.slice(1)) === active) a.setAttribute('aria-current', 'location');
    else a.removeAttribute('aria-current');
  }
}

if (headings.length) {
  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    },
    { passive: true },
  );
  window.addEventListener('resize', update, { passive: true });
  update();
}

// Close the mobile TOC after choosing a section.
for (const d of document.querySelectorAll<HTMLDetailsElement>('details[data-toc]')) {
  d.addEventListener('click', (e) => {
    if ((e.target as HTMLElement).closest('a')) d.open = false;
  });
}

export {}; // module scope (keeps top-level names private)
