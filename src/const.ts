import { z } from 'astro:content';

export const SITE_TITLE = 'Feeding the Soul of the Bible Study Leader';
export const SITE_TITLE_ES = 'Alimentando el alma del líder de estudios Bíblicos';
export const SITE_TITLE_PT = 'Alimentando el alma del líder de estudios Bíblicos';
export const SITE_DOMAIN = 'https://www.biblestudyleader.com';
export const SITE_DOMAIN_ES = 'https://www.liderdeestudiobiblico.com';
export const SITE_DOMAIN_PT = 'https://www.liderdeestudiobiblico.com';

export const frontmatterSchema = z.object({
    description: z.string().optional(),
    image: z.string().optional(),
    lang: z.string().optional(),
    title: z.string().optional(),
    week: z.number().optional(),
});