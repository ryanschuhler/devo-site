import rss from '@astrojs/rss';
import { pagesGlobToRssItems } from '@astrojs/rss';

export async function GET(context) {
  return rss({
    title: 'Bible Study Leader Tips',
    description: 'Nurturing the Soul of the Bible Study Leader',
    site: context.site,
    items: await pagesGlobToRssItems(import.meta.glob('../../content/tips/*.{md,mdx}')),
    customData: `<language>en-us</language>`,
  })
}