import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { getDateOfWeek } from '../util';
import { SITE_TITLE_PT, SITE_DOMAIN_PT } from '../const';

export async function GET(context) {
  const devocionais = await getCollection('devocionais');
  devocionais.sort((a, b) => a.data.week -  b.data.week);

  return rss({
    title: SITE_TITLE_PT,
    description: SITE_TITLE_PT,
    site: context.site,
    items: devocionais.map((post) => ({
      title: post.data.title,
      pubDate: getDateOfWeek(post.data.week),
      description: post.data.description,
      week: post.data.week,
      link: `${SITE_DOMAIN_PT}/devocionais/${post.slug}/`,
    })),
    customData: `<language>pt-br</language>`,
  })
}