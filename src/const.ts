import { z } from 'astro:content';

export const SITE_TITLE = 'Bible Study Leader';
export const SITE_TITLE_ES = 'Bible Study Leader';
export const SITE_DESCRIPTION = 'Nurturing the Soul of the Bible Study Leader';
export const SITE_DESCRIPTION_ES = 'Nurturing the Soul of the Bible Study Leader';

export const frontmatterSchema = z.object({
    image: z.string().optional(),
    lang: z.string().optional(),
    title: z.string().optional(),
    week: z.number().optional(),
});