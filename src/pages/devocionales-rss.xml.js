import rss from '@astrojs/rss';
import { pagesGlobToRssItems } from '@astrojs/rss';

export async function GET(context) {
  return rss({
    title: 'Bible Study Leader ES',
    description: 'Nurturing the Soul of the Bible Study Leader',
    site: context.site,
    items: await pagesGlobToRssItems(import.meta.glob('../../content/devocionales/*.{md,mdx}')),
    customData: `<language>es-es</language>`,
  })
}