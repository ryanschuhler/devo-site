import { defineCollection, z } from 'astro:content';

const devocionales = defineCollection({
	type: 'content',
	schema: z.object({
		title: z.string().optional(),
		week: z.number().optional(),
	})
});
const devotionals = defineCollection({
	type: 'content',
	schema: z.object({
		title: z.string().optional(),
		week: z.number().optional(),
	})
});
const tips = defineCollection({
	type: 'content',
	schema: z.object({
		title: z.string().optional(),
	})
});

export const collections = {
	'devocionales': devocionales,
	'devotionals': devotionals,
	'tips': tips,
};