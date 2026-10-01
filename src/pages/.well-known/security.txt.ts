/** RFC 9116 security.txt, generated from site.config.ts. */
import type { APIContext } from 'astro';
import { SITE } from '~site';
import { withBase } from '@/lib/url';

export function GET({ site }: APIContext) {
  const abs = (p: string) => new URL(withBase(p), site ?? 'http://localhost:4321').toString();
  const body = [
    `Contact: ${SITE.disclosure.contact}`,
    `Expires: ${SITE.disclosure.securityTxtExpires}`,
    `Policy: ${abs('/about/#disclosure')}`,
    `Canonical: ${abs('/.well-known/security.txt')}`,
    `Preferred-Languages: ${SITE.locale}`,
    '',
  ].join('\n');
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
