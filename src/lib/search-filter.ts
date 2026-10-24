// Pagefind matches every word of a query as a prefix, so "red team" finds pages about "reduce" and "teams".
// For queries of two or more words, these helpers keep only pages where each word is really there: as the same
// word or a plain inflection of it (team / teams / teaming), judged from the words pagefind highlighted.
const INFLECTION = /^(s|es|d|ed|ing|er|ers|ly)$/;

const sameWord = (a: string, b: string) => {
  if (a === b) return true;
  const [short, long] = a.length < b.length ? [a, b] : [b, a];
  return long.startsWith(short) && INFLECTION.test(long.slice(short.length));
};

/** lowercase words of a query, without punctuation */
export const queryWords = (q: string) => q.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? [];

/** the highlighted words in excerpt html, each cut to its leading letters and digits */
const marked = (html: string) =>
  [...html.matchAll(/<mark>([\s\S]*?)<\/mark>/g)].map((m) => (m[1].replace(/<[^>]+>/g, '').toLowerCase().match(/^[\p{L}\p{N}]+/u) ?? [''])[0]);

/** true when every query word of 3+ letters appears among the highlighted words of the page's excerpts */
export function coversWords(excerpts: string[], words: string[]) {
  const found = excerpts.flatMap(marked);
  return words.filter((w) => w.length >= 3).every((w) => found.some((m) => sameWord(w, m)));
}
