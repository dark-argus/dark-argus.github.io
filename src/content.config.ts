/**
 * Content collections. Frontmatter is validated at build time — a typo in
 * a date, category or CVE ID fails the build with a readable error.
 */
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { CATEGORIES, DIFFICULTIES } from './lib/taxonomy';

/** CVE-YYYY-NNNN(+) — rendered as linked badges (NVD). */
const cve = z
  .array(z.string().trim().toUpperCase().regex(/^CVE-\d{4}-\d{4,}$/, 'Expected a CVE ID like CVE-2024-12345'))
  .optional();

/** Tags are normalised to lower-case kebab so filters/URLs stay stable. */
const tags = z
  .array(z.string().trim().toLowerCase().regex(/^[a-z0-9][a-z0-9-]*$/, 'Tags must be kebab-case (a-z, 0-9, -)'))
  .default([]);

/** Shared by both collections. */
const common = {
  title: z.string().min(3).max(140),
  date: z.coerce.date(),
  summary: z.string().min(10).max(320),
  tags,
  cve,
  /** Drafts are built in `npm run dev` but excluded from production. */
  draft: z.boolean().default(false),
  /** Marks placeholder/sample content (shows a banner). Delete samples before launch. */
  sample: z.boolean().default(false),
};

const research = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/research' }),
  schema: ({ image }) =>
    z
      .object({
        ...common,
        updated: z.coerce.date().optional(),
        cover: image().optional(),
        coverAlt: z.string().optional(),
        /** Rendered as the "Disclosure timeline" block. */
        disclosure: z.array(z.object({ date: z.coerce.date(), event: z.string().min(2) })).optional(),
      })
      .refine((d) => !d.cover || !!d.coverAlt, { message: 'coverAlt is required when cover is set', path: ['coverAlt'] })
      .refine((d) => !d.updated || d.updated >= d.date, { message: '`updated` is before `date`', path: ['updated'] }),
});

const writeups = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/writeups' }),
  schema: z.object({
    ...common,
    updated: z.coerce.date().optional(),
    /** HTB, THM, or a CTF name, e.g. "DEF CON Quals 2026" */
    platform: z.string().trim().min(2).max(60),
    category: z.enum(CATEGORIES),
    difficulty: z.enum(DIFFICULTIES),
  }),
});

export const collections = { research, writeups };
