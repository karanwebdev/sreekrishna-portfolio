const groq = require("groq");

const htm = require("htm");
const vhtml = require("vhtml");
const { toHTML } = require("@portabletext/to-html");
const withCache = require("../../../utils/cache");
const client = require("../../../utils/sanityClient");

const html = htm.bind(vhtml);

const aboutHero = {
  marks: {
    strong: ({ children }) => html`<span class="bg-block">${children}</span>`,
  },
};

module.exports = withCache(
  async () => {
    const about = await client.fetch(groq`* [_type == 'about']{
      cover,
      footer,
      intro,
      services,
      desc,
    }[0]
  `);

    // Handle empty Sanity project
    if (!about) {
      return {
        intro: "<p>About content coming soon...</p>",
        cover: null,
        footer: null,
        services: [],
        desc: null,
      };
    }

    about.intro = toHTML(about.intro, { components: aboutHero });

    return about;
  },
  "about",
  "1d"
);

// module.exports = {
//   title: "Wulf",
//   description: "Placeholder",
//   karan: "Awesome",
// };
