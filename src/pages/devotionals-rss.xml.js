import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { getDateOfWeek } from '../util';
import { SITE_DOMAIN } from '../const';

export async function GET(context) {
  const devotionals = await getCollection('devotionals');
  devotionals.sort((a, b) => a.data.week -  b.data.week);

  return rss({
    title: 'The Bible Study Leader',
    description: 'Nurturing the Soul of the Bible Study Leader',
    site: context.site,
    items: devotionals.map((post) => ({
      title: post.data.title,
      pubDate: getDateOfWeek(post.data.week),
      description: post.data.description,
      week: post.data.week,
      link: `${SITE_DOMAIN}/devotionals/${post.slug}/`,
    })),
    customData: `<language>en-us</language>`,
  })
}