const groq = require('groq');
const client = require('../../../utils/sanityClient');

const withCache = require('../../../utils/cache');

module.exports = withCache(
  async () => {
    const contact = await client.fetch(groq`*[_type == 'contact']{
      dribbble,
      email,
      instagram,
      twitter,
      facebook
    }[0]
    `);

    // Handle empty Sanity project
    if (!contact) {
      return {
        dribbble: '#',
        email: 'hello@example.com',
        instagram: '#',
        twitter: '#',
        facebook: '#',
      };
    }

    return contact;
  },
  'contact',
  '1d',
);

// module.exports = {
//   title: "Wulf",
//   description: "Placeholder",
//   karan: "Awesome",
// };
