import rss from '@astrojs/rss';
import { pagesGlobToRssItems } from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
  const posts = await getCollection("en");
  return rss({
    title: 'Bible Study Leader',
    description: 'Nurturing the Soul of the Bible Study Leader',
    site: context.site,
    items: await pagesGlobToRssItems(import.meta.glob('./**/*.md')),
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.description,
      link: `/en/${post.slug}/`,
    })),
    customData: `<language>en-us</language>`,
  })
}