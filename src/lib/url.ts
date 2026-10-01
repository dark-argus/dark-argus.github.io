/**
 * Prefix an internal path with the configured base path so links keep
 * working when the site is deployed under /<repo-name>/ on GitHub Pages.
 *   withBase('/research/') → '/dark-argus/research/'
 */
export function withBase(path = '/'): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  if (/^(https?:|mailto:|#)/.test(path)) return path;
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `${base}${clean}` || '/';
}

/** Absolute URL (for canonical, OG, RSS). */
export function absoluteUrl(path: string, site: URL | undefined): string {
  return new URL(withBase(path), site ?? 'http://localhost:4321').toString();
}

export const isExternal = (href: string) => /^https?:\/\//.test(href);
