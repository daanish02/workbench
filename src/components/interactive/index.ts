// Every component usable inside note MDX without an import.
// Any .astro file in this folder is registered automatically under its file name,
// e.g. TinyCpu.astro -> <TinyCpu />.
import Figure from '../Figure.astro';
import Callout from '../Callout.astro';
import CodeTabs from '../CodeTabs.astro';

const modules = import.meta.glob<{ default: unknown }>('./*.astro', { eager: true });

export const components: Record<string, unknown> = { Figure, Callout, CodeTabs };
for (const [path, mod] of Object.entries(modules)) {
  components[path.slice(2, -'.astro'.length)] = mod.default;
}
