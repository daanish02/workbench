// The note graph: one node per note, one edge per internal link written in a note's body.
// Built at build time from the content collection, so it always matches the notes.
import { getCollection } from 'astro:content';
import { areas } from '../data/areas';
import { noteParts, noteUrl, type Note } from './nav';

const PLACEHOLDER = 'Placeholder. Content not written yet.';

export interface GraphNode {
  id: string; // "<area>/<section>/<slug>"
  title: string;
  description: string;
  area: string;
  section: string;
  sectionTitle: string;
  href: string;
  written: boolean;
  advanced: boolean;
  /** position in curriculum order (area, section, note order), used for the build-up animation */
  rank: number;
}

export interface Graph {
  nodes: GraphNode[];
  /** [from, to] as indices into `nodes`; deduplicated, no self-links */
  edges: [number, number][];
  /** links to something that is not a note, as "from -> link" */
  broken: string[];
}

/** Resolve a markdown link written in note `fromId` to a note-id-shaped path, or null if it is external. */
function resolve(fromId: string, link: string): string | null {
  const href = link.split('#')[0];
  if (!href || /^(https?:|mailto:)/.test(href)) return null;
  let path: string;
  if (href.startsWith('/workbench/')) path = href.slice('/workbench/'.length);
  else if (href.startsWith('/')) return null;
  else path = `${fromId}/${href}`; // relative links are written against the note's URL, which is its id
  const parts: string[] = [];
  for (const seg of path.split('/')) {
    if (seg === '..') parts.pop();
    else if (seg && seg !== '.') parts.push(seg);
  }
  return parts.join('/');
}

async function build(): Promise<Graph> {
  const notes: Note[] = await getCollection('notes');
  const sectionTitle = new Map(areas.flatMap((a) => a.sections.map((s) => [`${a.id}/${s.id}`, s.title])));
  const index = new Map(notes.map((n, i) => [n.id, i]));
  const overviews = new Set(notes.flatMap((n) => [noteParts(n).area, `${noteParts(n).area}/${noteParts(n).section}`]));
  const nodes: GraphNode[] = notes.map((n) => {
    const { area, section } = noteParts(n);
    return {
      id: n.id,
      title: n.data.title,
      description: n.data.description,
      area,
      section,
      sectionTitle: sectionTitle.get(`${area}/${section}`) ?? section,
      href: noteUrl(n),
      written: !(n.body ?? '').includes(PLACEHOLDER),
      advanced: n.data.tier === 'advanced',
      rank: 0,
    };
  });
  const areaPos = new Map(areas.map((a, i) => [a.id, i]));
  const sectionPos = new Map(areas.flatMap((a) => a.sections.map((s, i) => [`${a.id}/${s.id}`, i])));
  notes
    .map((n, i) => ({ i, key: [areaPos.get(nodes[i].area) ?? 0, sectionPos.get(`${nodes[i].area}/${nodes[i].section}`) ?? 0, n.data.order] }))
    .sort((a, b) => a.key[0] - b.key[0] || a.key[1] - b.key[1] || a.key[2] - b.key[2])
    .forEach(({ i }, rank) => (nodes[i].rank = rank));
  const seen = new Set<string>();
  const edges: [number, number][] = [];
  const broken: string[] = [];
  notes.forEach((n, from) => {
    // markdown links only; code blocks and inline code are skipped so example URLs and `f[T](…)` do not count
    const body = (n.body ?? '').replace(/```[\s\S]*?```/g, '').replace(/`[^`\n]*`/g, '');
    for (const m of body.matchAll(/\]\(([^)\s]+)\)/g)) {
      const target = resolve(n.id, m[1]);
      if (target === null) continue;
      const to = index.get(target);
      if (to === undefined) {
        // links to an area or section overview page are valid, just not graph edges
        if (!overviews.has(target)) broken.push(`${n.id} -> ${m[1]}`);
        continue;
      }
      if (to === from || seen.has(`${from}|${to}`)) continue;
      seen.add(`${from}|${to}`);
      edges.push([from, to]);
    }
  });
  return { nodes, edges, broken };
}

// built once per build: every note page asks for its neighbourhood, and the graph page for the whole graph
let cached: Promise<Graph> | undefined;
export const buildGraph = (): Promise<Graph> => (cached ??= build());

/** One note and the notes linked to or from it, with every link among them: the data for a neighbourhood graph. */
export function neighbourhood(g: Graph, id: string) {
  const self = g.nodes.findIndex((n) => n.id === id);
  const keep = new Set<number>([self]);
  // appendix pages (glossary, cheat sheets) link to everything, so they are left out, as in the whole graph
  const shown = (i: number) => !g.nodes[i].sectionTitle.startsWith('Appendix');
  for (const [s, t] of g.edges) {
    if (s === self && shown(t)) keep.add(t);
    if (t === self && shown(s)) keep.add(s);
  }
  const ids = [...keep].sort((a, b) => a - b);
  const at = new Map(ids.map((old, i) => [old, i]));
  return {
    nodes: ids.map((i) => g.nodes[i]),
    edges: g.edges.filter(([s, t]) => keep.has(s) && keep.has(t)).map(([s, t]) => [at.get(s)!, at.get(t)!] as [number, number]),
    home: at.get(self)!,
  };
}
