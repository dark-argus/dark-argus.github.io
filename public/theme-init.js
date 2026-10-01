/*
 * theme-init.js — runs render-blocking in <head> (tiny, external so the CSP
 * can stay `script-src 'self'` with no inline hashes). Sets data-theme
 * before first paint so there's no flash of the wrong theme.
 * Priority: saved choice → OS preference → "void".
 */
(function () {
  var theme = 'void';
  try {
    var saved = localStorage.getItem('theme');
    if (saved === 'void' || saved === 'paper') theme = saved;
    else if (window.matchMedia('(prefers-color-scheme: light)').matches) theme = 'paper';
  } catch (e) {
    /* storage blocked — fall back to default */
  }
  document.documentElement.setAttribute('data-theme', theme);
  document.documentElement.classList.add('js');
})();
