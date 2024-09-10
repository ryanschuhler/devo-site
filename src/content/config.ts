import { defineCollection, z } from 'astro:content';
import { frontmatterSchema } from '../const';

const devocionais = defineCollection({
	type: 'content',
	schema: frontmatterSchema
});
const devocionales = defineCollection({
	type: 'content',
	schema: frontmatterSchema
});
const devotionals = defineCollection({
	type: 'content',
	schema: frontmatterSchema
});

export const collections = {
	'devocionais': devocionais,
	'devocionales': devocionales,
	'devotionals': devotionals,
};