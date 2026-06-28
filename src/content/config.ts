import { z, defineCollection } from 'astro:content';

const blogSchema = z.object({
  title: z.string(),
  description: z.string(),
  pubDate: z.date(),
  updatedDate: z.date().optional(),
});

const blogCollection = defineCollection({
  type: 'content',
  schema: blogSchema,
});

const focusBlogCollection = defineCollection({
  type: 'content',
  schema: blogSchema.omit({ section: true }),
});

const pomodoroBlogCollection = defineCollection({
  type: 'content',
  schema: blogSchema.omit({ section: true }),
});

export const collections = {
  'blog': blogCollection,
  'focus-blog': focusBlogCollection,
  'pomodoro-blog': pomodoroBlogCollection,
};
