const groq = require('groq');
const string = require('string');
const client = require('../../../utils/sanityClient');
const urlFor = require('../../../utils/imageUrl');

const withCache = require('../../../utils/cache');

module.exports = withCache(
  async () => {
    const home = await client.fetch(groq`*[_type == 'case']|order(orderRank){
      cover,
      slug,
      title,
      loop {
        dimensions,
        poster,
        'full': full.asset->{url}.url,
        'small': small.asset->{url}.url,
      }
    }
    `);

    // Handle empty Sanity project
    if (!home || home.length === 0) {
      return [];
    }

    const imageParsed = home.map((item) => ({
      ...item,
      cover: urlFor(item.loop?.poster || item.cover).width(2500).fit('max').auto('format')
        .url(),
      slug: string(item.slug.current).slugify().toString(),
    }));

    return imageParsed;
  },
  'home',
  '1d',
);
