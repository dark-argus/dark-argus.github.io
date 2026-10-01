/**
 * ─────────────────────────────────────────────────────────────
 *  dark-argus · site configuration
 *  Every personal detail lives here.
 * ─────────────────────────────────────────────────────────────
 */

export interface SocialLink {
  label: string;
  href: string;
  /** shown in mono next to the label, e.g. "@handle" */
  handle?: string;
}

export const SITE = {
  /** Wordmark + <title> suffix. */
  title: 'dark-argus',
  /** Used in meta descriptions, RSS and OG images. */
  description: 'Security research, CTF writeups, pentest reports and lab notes by Mohammad Sheeban.',
  /** Short hero line under the headline. */
  tagline: 'Security research, CTF writeups, pentest reports and lab notes. A hundred eyes on every system.',
  /** Small label above the hero headline. */
  heroEyebrow: "The watcher's notebook",
  /** Stacked hero headline — one array item per line. */
  heroLines: ['I watch.', 'I break.', 'I write up.'],
  /** The handwritten accent phrase in the hero. Keep it short. */
  accentPhrase: 'see everything. miss nothing.',

  /**
   * Production URL (no trailing slash). Used for canonical URLs, RSS, sitemap
   * and OG images. The GitHub Pages workflow overrides this automatically via
   * the SITE_URL env var, so this is the local/default value.
   */
  url: 'https://dark-argus.github.io',
  /**
   * Base path. '/' for a custom domain or a <user>.github.io repo,
   * '/<repo-name>' for a GitHub Pages *project* site. Also overridable
   * via the BASE_PATH env var (the workflow sets it for you).
   */
  base: '/',
  locale: 'en',

  author: {
    name: 'Mohammad Sheeban',
    handle: '0xdark_argus', // shown as "@handle" / in the whoami card
    /** One-liner for the About page + homepage. */
    bio: 'Offensive security researcher based in India — web exploitation, Active Directory attack chains and vulnerability research.',
    location: 'India',
    /** Used on the About page and in /.well-known/security.txt */
    email: 'argus-security919@proton.me',
  },

  /** Rendered in the footer + About. */
  socials: [
    { label: 'GitHub', href: 'https://github.com/dark-argus', handle: '@dark-argus' },
    { label: 'X', href: 'https://twitter.com/0xdark_argus', handle: '@0xdark_argus' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/mohammad-sheeban', handle: 'Mohammad Sheeban' },
    { label: 'Instagram', href: 'https://instagram.com/0xdark_argus', handle: '@0xdark_argus' },
  ] satisfies SocialLink[],

  /** /about ("whoami") page data. The long-form narrative lives in the page. */
  about: {
    /** Birthday — used to show your current age on /about. */
    born: '2007-08-11',
    /** Shown as "currently" in the whoami terminal card. */
    now: 'PortSwigger Web Academy — SQL injection, after Path Traversal and File Inclusion.',
    /** Tools, rendered as chips on /about. */
    tools: [
      'Burp Suite',
      'Nmap',
      'BloodHound',
      'NetExec',
      'Impacket',
      'ffuf',
      'Hydra',
      'Exegol',
      'Python',
      'BloodyAD',
      'Sliver C2',
      'Mythic C2',
      'Metasploit',
    ],
  },

  /** Responsible-disclosure details (About page + security.txt). */
  disclosure: {
    /** Where people should report issues in *your* site or tools. */
    contact: 'mailto:argus-security919@proton.me',
    /** Typical embargo you follow when disclosing to vendors. */
    embargoDays: 90,
    /** ISO date security.txt expires (must be < 1 year ahead). */
    securityTxtExpires: '2027-09-01T00:00:00.000Z', // TODO: bump yearly
  },

  /** Topics scrolling in the ticker strip. */
  ticker: ['WEB', 'AD', 'KERBEROS', 'BLOODHOUND', 'PWN', 'REVERSE', 'CRYPTO', 'FORENSICS', 'CVE', 'HTB', 'THM', 'CTF'],

  /** Homepage/listing sizes. */
  homeLatestCount: 3,
} as const;

export type SiteConfig = typeof SITE;
