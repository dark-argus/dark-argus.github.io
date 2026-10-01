/** Writeup taxonomy + the accent each value is drawn with. */
export const CATEGORIES = ['web', 'pwn', 'reverse', 'crypto', 'forensics', 'misc'] as const;
export const DIFFICULTIES = ['easy', 'medium', 'hard', 'insane'] as const;
export type Category = (typeof CATEGORIES)[number];
export type Difficulty = (typeof DIFFICULTIES)[number];

export type Accent = 'lime' | 'violet' | 'orange' | 'cyan' | 'bone';

export const DIFFICULTY_ACCENT: Record<Difficulty, Accent> = {
  easy: 'lime',
  medium: 'cyan',
  hard: 'orange',
  insane: 'violet',
};

export const CATEGORY_ACCENT: Record<Category, Accent> = {
  web: 'cyan',
  pwn: 'orange',
  reverse: 'violet',
  crypto: 'lime',
  forensics: 'cyan',
  misc: 'bone',
};

/**
 * Stable accent for arbitrary strings (tags, platforms).
 * Ultraviolet is deliberately excluded: small text on/in it is ~4.3:1,
 * just under WCAG AA, so it's reserved for borders, dots and large text.
 */
const ROTATION: Accent[] = ['lime', 'cyan', 'orange', 'bone'];
export function accentFor(value: string): Accent {
  let h = 0;
  for (const ch of value) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return ROTATION[h % ROTATION.length]!;
}
