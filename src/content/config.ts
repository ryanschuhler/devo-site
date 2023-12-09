import { defineCollection, z } from 'astro:content';
import { frontmatterSchema } from '../const';

const devocionales = defineCollection({
	type: 'content',
	schema: frontmatterSchema
});
const devotionals = defineCollection({
	type: 'content',
	schema: frontmatterSchema
});
const tips = defineCollection({
	type: 'content',
	schema: frontmatterSchema
});

export const collections = {
	'devocionales': devocionales,
	'devotionals': devotionals,
	'tips': tips,
};