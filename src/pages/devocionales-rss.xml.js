import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { getDateOfWeek } from '../util';
import { SITE_TITLE_ES, SITE_DOMAIN_ES } from '../const';

export async function GET(context) {
  const devocionales = await getCollection('devocionales');
  devocionales.sort((a, b) => a.data.week -  b.data.week);

  return rss({
    title: SITE_TITLE_ES,
    description: SITE_TITLE_ES,
    site: context.site,
    items: devocionales.map((post) => ({
      title: post.data.title,
      pubDate: getDateOfWeek(post.data.week),
      description: post.data.description,
      week: post.data.week,
      link: `${SITE_DOMAIN_ES}/devocionales/${post.slug}/`,
    })),
    customData: `<language>es-es</language>`,
  })
}