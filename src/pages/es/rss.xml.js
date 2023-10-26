import rss from '@astrojs/rss';
import { pagesGlobToRssItems } from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
  const posts = await getCollection("es");
  return rss({
    title: 'Bible Study Leader',
    description: 'Nurturing the Soul of the Bible Study Leader',
    site: context.site,
    items: await pagesGlobToRssItems(import.meta.glob('./**/*.md')),
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.description,
      link: `/es/${post.slug}/`,
    })),
    customData: `<language>es-es</language>`,
  })
}