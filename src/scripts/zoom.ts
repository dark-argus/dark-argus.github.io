/**
 * Click-to-zoom for article screenshots, using a native <dialog>
 * (Esc, focus trapping and backdrop come for free). Images become
 * keyboard-operable buttons only once this script runs.
 */
const imgs = [...document.querySelectorAll<HTMLImageElement>('.prose img')].filter((img) => !img.closest('a'));

if (imgs.length) {
  const dialog = document.createElement('dialog');
  dialog.className = 'zoom-dialog';
  dialog.innerHTML =
    '<button type="button" class="zoom-close" aria-label="Close image">Close ×</button><img alt="" /><p class="zoom-cap"></p>';
  document.body.append(dialog);
  const big = dialog.querySelector('img')!;
  const cap = dialog.querySelector<HTMLParagraphElement>('.zoom-cap')!;
  let opener: HTMLElement | null = null;

  const open = (img: HTMLImageElement) => {
    opener = img;
    big.src = img.currentSrc || img.src;
    big.alt = img.alt;
    cap.textContent = img.alt;
    dialog.showModal();
  };
  dialog.addEventListener('click', () => dialog.close()); // any click closes
  dialog.addEventListener('close', () => opener?.focus());

  for (const img of imgs) {
    img.classList.add('zoomable');
    img.tabIndex = 0;
    img.setAttribute('role', 'button');
    img.setAttribute('aria-label', `Enlarge image: ${img.alt}`);
    img.addEventListener('click', () => open(img));
    img.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        open(img);
      }
    });
  }
}

export {}; // module scope (keeps top-level names private)
