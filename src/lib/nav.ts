import { getCollection, type CollectionEntry } from 'astro:content';
import { areas } from '../data/areas';

export type Note = CollectionEntry<'notes'>;

/** Prefix a site-relative path with the configured base, e.g. url('cs/') -> '/workbench/cs/' */
export function url(path = ''): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const clean = path.replace(/^\//, '');
  return `${base}/${clean}`;
}

export function noteParts(note: Note) {
  const [area, section, slug] = note.id.split('/');
  return { area, section, slug };
}

export const noteUrl = (note: Note) => {
  const { area, section, slug } = noteParts(note);
  return url(`${area}/${section}/${slug}/`);
};

/**
 * Estimated minutes to read a note. Technical prose is read slower than fiction (~200 wpm),
 * code slower still (~100 wpm), and each interactive gets a minute to play with.
 */
export function readingMinutes(note: Note): number {
  const body = note.body ?? '';
  const code = [...body.matchAll(/```[\s\S]*?```/g)].map((m) => m[0]).join(' ');
  const interactives = (body.match(/^<(?!Callout|Figure)[A-Z]\w*[^>]*\/>/gm) ?? []).length;
  const prose = body
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/\$\$[\s\S]*?\$\$/g, ' formula ')
    .replace(/<\/?[A-Z][^>]*>/g, ' ');
  const words = (s: string) => s.split(/\s+/).filter((w) => /\w/.test(w)).length;
  const takeaways = note.data.takeaways.join(' ');
  return Math.max(1, Math.round((words(prose) + words(takeaways)) / 200 + words(code) / 100 + interactives));
}

export interface NavSection {
  id: string;
  title: string;
  notes: Note[];
}

/** Every area ends with one or more appendices (CS has A, B, C): shown as sections, but not counted as ones. */
export const isAppendix = (s: NavSection) => s.id.startsWith('appendix');

/** Sections of an area in curriculum order, each with its notes sorted by `order`. */
export async function areaNav(areaId: string): Promise<NavSection[]> {
  const area = areas.find((a) => a.id === areaId);
  if (!area) return [];
  const all = await getCollection('notes', (n) => noteParts(n).area === areaId);
  return area.sections.map((s) => ({
    id: s.id,
    title: s.title,
    notes: all
      .filter((n) => noteParts(n).section === s.id)
      .sort((a, b) => a.data.order - b.data.order),
  }));
}
