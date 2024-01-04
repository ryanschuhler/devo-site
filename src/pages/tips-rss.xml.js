import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { getDateOfWeek } from '../util';

export async function GET(context) {
  const tips = await getCollection('tips');
  return rss({
    title: 'The Bible Study Leader',
    description: 'Nurturing the Soul of the Bible Study Leader',
    site: context.site,
    items: tips.map((post) => ({
      title: post.data.title,
      pubDate: getDateOfWeek(post.data.week),
      description: post.data.description,
      week: post.data.week,
      link: `/tips/${post.slug}/`,
    })),
    customData: `<language>en-us</language>`,
  })
}