const groq = require("groq");
const getVideoId = require("get-video-id");
const client = require("../../../utils/sanityClient");

const withCache = require("../../../utils/cache");

module.exports = withCache(
  async () => {
    const cases = await client.fetch(groq`*[_type == 'case']|order(orderRank){
      cover,
      details,
      intro,
      link,
      loop,
      slug,
      thumbnails,
      title,
      result,
      resultDescription,
    }
    `);

    // Handle empty Sanity project
    if (!cases || cases.length === 0) {
      return [];
    }

    const n = cases.length;
    cases.forEach((item, idx) => {
      // get next case cyclically
      const idxp1 = idx + 1;
      const nidx = idxp1 === n ? 0 : idxp1;
      const { cover, slug, title } = cases[nidx];
      item.next = {
        cover,
        slug,
        title,
      };

      // extract link
      if (item.link) {
        item.ytid = getVideoId(item.link).id;
      }
    });

    return cases;
  },
  "cases",
  "1d"
);
