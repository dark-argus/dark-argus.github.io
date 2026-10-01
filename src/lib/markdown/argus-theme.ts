/**
 * "argus" — custom Shiki theme built from the site palette.
 * Code blocks are dark in BOTH site themes (they read as terminal-like
 * "stickers"), so one theme is enough. Every color is ≥ 4.5:1 on #08080C.
 */
import type { ThemeRegistration } from 'shiki';

const c = {
  bg: '#08080c',
  fg: '#f1eee6',
  muted: '#b8b5ad', // punctuation
  comment: '#8f94a8', // ≈ 6.4:1
  lime: '#b6ff3b', // strings
  cyan: '#35e0ff', // keywords
  orange: '#ff6a3d', // numbers / constants
  violet: '#c2b5ff', // functions — ultraviolet lightened for text contrast
  peach: '#ffb38f', // types / classes
};

export const argusTheme: ThemeRegistration = {
  name: 'argus',
  type: 'dark',
  colors: {
    'editor.background': c.bg,
    'editor.foreground': c.fg,
  },
  tokenColors: [
    { settings: { foreground: c.fg } },
    { scope: ['comment', 'punctuation.definition.comment'], settings: { foreground: c.comment, fontStyle: 'italic' } },
    {
      scope: ['keyword', 'storage', 'storage.type', 'storage.modifier', 'keyword.operator.new', 'keyword.operator.expression'],
      settings: { foreground: c.cyan },
    },
    { scope: ['keyword.operator', 'punctuation', 'meta.brace'], settings: { foreground: c.muted } },
    { scope: ['string', 'string.quoted', 'string.template', 'markup.inline.raw'], settings: { foreground: c.lime } },
    { scope: ['constant.character.escape', 'string.regexp'], settings: { foreground: c.orange } },
    {
      scope: ['constant.numeric', 'constant.language', 'constant.other', 'support.constant', 'variable.language'],
      settings: { foreground: c.orange },
    },
    {
      scope: ['entity.name.function', 'support.function', 'meta.function-call entity.name.function', 'variable.function'],
      settings: { foreground: c.violet },
    },
    {
      scope: ['entity.name.type', 'entity.name.class', 'support.type', 'support.class', 'entity.other.inherited-class', 'storage.type.primitive'],
      settings: { foreground: c.peach },
    },
    { scope: ['variable.parameter'], settings: { foreground: c.fg, fontStyle: 'italic' } },
    { scope: ['entity.name.tag', 'meta.tag'], settings: { foreground: c.cyan } },
    { scope: ['entity.other.attribute-name'], settings: { foreground: c.peach } },
    { scope: ['support.type.property-name', 'meta.object-literal.key'], settings: { foreground: c.fg } },
    // diff
    { scope: ['markup.inserted', 'punctuation.definition.inserted'], settings: { foreground: c.lime } },
    { scope: ['markup.deleted', 'punctuation.definition.deleted'], settings: { foreground: c.orange } },
    { scope: ['meta.diff.header', 'meta.diff.range'], settings: { foreground: c.cyan } },
    // http
    { scope: ['keyword.control.http', 'keyword.other.http'], settings: { foreground: c.cyan } },
    { scope: ['entity.name.header.http', 'support.variable.http'], settings: { foreground: c.comment } },
    // markdown-ish
    { scope: ['markup.heading'], settings: { foreground: c.cyan, fontStyle: 'bold' } },
    { scope: ['markup.bold'], settings: { fontStyle: 'bold' } },
    { scope: ['markup.italic'], settings: { fontStyle: 'italic' } },
  ],
};
