/**
 * Homepage copy that isn't personal info (that lives in site.config.ts).
 * Edit freely — the components just render these arrays.
 */
import type { Accent } from '@/lib/taxonomy';

export const START_HERE: { title: string; body: string; href: string; cta: string; accent: Accent }[] = [
  {
    title: 'Research',
    body: 'Original findings, root-cause analysis, and disclosure timelines. Slow, deep, and cited.',
    href: '/research/',
    cta: 'See research',
    accent: 'lime',
  },
  {
    title: 'Writeups',
    body: 'CTF, HTB and THM walkthroughs with the dead ends left in. Filter by platform, category and difficulty.',
    href: '/writeups/',
    cta: 'Browse writeups',
    accent: 'orange',
  },
  {
    title: 'About',
    body: 'Who is behind the eye, the story, and how to reach me.',
    href: '/about/',
    cta: 'Whoami',
    accent: 'cyan',
  },
];

export const METHOD: { title: string; body: string; accent: Accent }[] = [
  { title: 'Recon', body: 'Map the surface. Scope first, notes always.', accent: 'lime' },
  { title: 'Analyze', body: 'Read the code, traffic and behavior until something looks wrong.', accent: 'violet' },
  { title: 'Exploit', body: 'Prove it in a lab or authorized target. Minimal and reproducible.', accent: 'orange' },
  { title: 'Report', body: "Write it up, disclose responsibly, publish when it's safe.", accent: 'cyan' },
];

export const METHOD_NOTE = {
  label: 'Ground rule',
  body: 'Only lab boxes, CTFs, and authorized targets. Scope comes first, always.',
};

export const FAQ: { q: string; a: string; accent: Accent }[] = [
  {
    q: 'What do you cover?',
    a: 'Original security research plus lab and CTF writeups: web, pwn, reverse engineering, crypto, forensics, and the occasional CVE.',
    accent: 'lime',
  },
  { q: 'How do I follow along?', a: 'Add the RSS feed to any reader. No accounts, no newsletter gate.', accent: 'cyan' },
  {
    q: 'Do you track visitors?',
    a: 'No analytics, no cookies, no third-party scripts. The watcher does not watch you.',
    accent: 'orange',
  },
  {
    q: 'Can I suggest a topic?',
    a: 'Yes. Use the contact details in the disclosure section. No promises on timing.',
    accent: 'violet',
  },
];
