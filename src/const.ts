import { z } from 'astro:content';

export const SITE_TITLE = 'Feeding the Soul of the Bible Study Leader';
export const SITE_TITLE_ES = 'Alimentando el alma del líder de estudios Bíblicos';

export const frontmatterSchema = z.object({
    description: z.string().optional(),
    image: z.string().optional(),
    lang: z.string().optional(),
    title: z.string().optional(),
    week: z.number().optional(),
});