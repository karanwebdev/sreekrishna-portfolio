const groq = require("groq");
const client = require("../../../utils/sanityClient");

const withCache = require("../../../utils/cache");

module.exports = withCache(
  async () => {
    const seo = await client.fetch(groq`*[_id == 'seo']{
      ...,
      homeCover {
        ...,
        "full": full.asset->url,
        "small": small.asset->url,
      },
    }[0]
    `);

    // Handle empty Sanity project
    if (!seo) {
      return {
        title: "Portfolio",
        description: "Welcome to the portfolio",
        keywords: "",
        homeCover: null,
      };
    }

    return seo;
  },
  "seo",
  "1d"
);

// module.exports = {
//   title: "Wulf",
//   description: "Placeholder",
//   karan: "Awesome",
// };
