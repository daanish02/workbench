import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const notes = defineCollection({
  // id = "<area>/<section>/<slug>", taken from the file path
  loader: glob({ pattern: '**/*.mdx', base: './src/content/notes' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    order: z.number(),
    /** advanced = harder, or leans on several earlier notes (shown as an ADV badge); everything else is core */
    tier: z.enum(['core', 'advanced']).default('core'),
    /** 3-4 one-line takeaways shown in the "In short" box at the top */
    takeaways: z.array(z.string()).default([]),
    resources: z
      .array(z.object({ title: z.string(), url: z.string().url(), note: z.string().optional() }))
      .default([]),
  }),
});

export const collections = { notes };
