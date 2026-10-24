// A small, safe markdown renderer for chat replies: everything is HTML-escaped first, and the only
// tags produced are the ones below. Supports paragraphs, headings, lists, **bold**, *italic*, `code`,
// fenced code, $math$ / $$math$$ and [n] citations.
export interface Cite {
  href: string;
  title: string;
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const attr = (s: string) => esc(s).replace(/"/g, '&quot;');

export function renderMarkdown(
  md: string,
  cite: (n: number) => Cite | null,
  math: (tex: string, display: boolean) => string,
): string {
  const held: string[] = [];
  const hold = (html: string) => `\u0000${held.push(html) - 1}\u0000`;

  let s = md.replace(/\r\n?/g, '\n');
  // code and math are set aside first, so their contents are never read as markdown
  s = s.replace(/```[^\n]*\n([\s\S]*?)(?:```|$)/g, (_, code: string) => hold(`<pre><code>${esc(code.replace(/\n$/, ''))}</code></pre>`));
  s = s.replace(/`([^`\n]+)`/g, (_, c: string) => hold(`<code>${esc(c)}</code>`));
  s = s.replace(/\\\[([\s\S]+?)\\\]/g, (_, t: string) => `$$${t}$$`).replace(/\\\(([\s\S]+?)\\\)/g, (_, t: string) => `$${t}$`);
  s = s.replace(/\$\$([\s\S]+?)\$\$/g, (_, t: string) => hold(`<div class="math">${math(t.trim(), true)}</div>`));
  s = s.replace(/(?<!\\)\$(?!\s)([^$\n]+?)(?<!\s)\$/g, (_, t: string) => hold(math(t, false)));
  s = esc(s).replace(/\\\$/g, '$');

  const inline = (t: string) =>
    t
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/(?<![*\w])\*(?!\s)(.+?)(?<!\s)\*(?![*\w])/g, '<em>$1</em>')
      .replace(/\[(\d{1,2}(?:\s*,\s*\d{1,2})*)\]/g, (whole, nums: string) => {
        const links = nums.split(',').map((x) => {
          const n = Number(x);
          const c = cite(n);
          return c ? `<a class="cite" href="${attr(c.href)}" title="${attr(c.title)}">${n}</a>` : null;
        });
        return links.every(Boolean) ? links.join('') : whole;
      });

  const out: string[] = [];
  let list: 'ul' | 'ol' | null = null;
  let para: string[] = [];
  const flush = () => {
    if (para.length) out.push(`<p>${inline(para.join(' '))}</p>`);
    para = [];
  };
  const closeList = () => {
    if (list) out.push(`</${list}>`);
    list = null;
  };
  const item = (kind: 'ul' | 'ol', text: string) => {
    flush();
    if (list !== kind) {
      closeList();
      out.push(`<${kind}>`);
      list = kind;
    }
    out.push(`<li>${inline(text)}</li>`);
  };

  for (const line of s.split('\n')) {
    const t = line.trim();
    let m: RegExpExecArray | null;
    if (!t) {
      flush();
      closeList();
    } else if ((m = /^#{1,4}\s+(.*)$/.exec(t))) {
      flush();
      closeList();
      out.push(`<h4>${inline(m[1])}</h4>`);
    } else if ((m = /^[-*•]\s+(.*)$/.exec(t))) item('ul', m[1]);
    else if ((m = /^\d+[.)]\s+(.*)$/.exec(t))) item('ol', m[1]);
    else if (/^\u0000\d+\u0000$/.test(t)) {
      flush();
      closeList();
      out.push(t);
    } else {
      closeList();
      para.push(t);
    }
  }
  flush();
  closeList();
  return out.join('').replace(/\u0000(\d+)\u0000/g, (_, i: string) => held[Number(i)]);
}
