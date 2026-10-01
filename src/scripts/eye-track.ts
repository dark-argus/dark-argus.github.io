/**
 * Cursor-tracking eyes. Every <svg data-eye> moves its [data-eye-iris]
 * group toward the pointer, clamped to `data-range` SVG units.
 *
 * Off when: prefers-reduced-motion, or the device has no hover-capable
 * pointer (touch) — the eyes simply look straight ahead.
 */
const motionOK = window.matchMedia('(prefers-reduced-motion: no-preference)');
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

type Eye = { svg: SVGSVGElement; iris: SVGGElement; range: number };
let eyes: Eye[] = [];
let px = 0;
let py = 0;
let frame = 0;

function collect() {
  eyes = [...document.querySelectorAll<SVGSVGElement>('svg[data-eye]')].flatMap((svg) => {
    const iris = svg.querySelector<SVGGElement>('[data-eye-iris]');
    return iris ? [{ svg, iris, range: Number(svg.dataset.range ?? 8) }] : [];
  });
}

function update() {
  frame = 0;
  for (const { svg, iris, range } of eyes) {
    const r = svg.getBoundingClientRect();
    if (r.bottom < 0 || r.top > innerHeight) continue; // off-screen: skip
    const dx = px - (r.left + r.width / 2);
    const dy = py - (r.top + r.height / 2);
    const dist = Math.hypot(dx, dy) || 1;
    // ease in over ~300px so eyes near the cursor don't jitter at full range
    const k = Math.min(1, dist / 300) * range;
    // vertical travel is shorter — the almond is wider than tall
    iris.setAttribute('transform', `translate(${((dx / dist) * k).toFixed(2)} ${((dy / dist) * k * 0.6).toFixed(2)})`);
  }
}

function onMove(e: PointerEvent) {
  px = e.clientX;
  py = e.clientY;
  if (!frame) frame = requestAnimationFrame(update);
}

function reset() {
  for (const { iris } of eyes) iris.removeAttribute('transform');
}

function sync() {
  if (motionOK.matches && finePointer.matches) {
    collect();
    window.addEventListener('pointermove', onMove, { passive: true });
  } else {
    window.removeEventListener('pointermove', onMove);
    reset();
  }
}

motionOK.addEventListener('change', sync);
finePointer.addEventListener('change', sync);
sync();

export {}; // module scope (keeps top-level names private)
