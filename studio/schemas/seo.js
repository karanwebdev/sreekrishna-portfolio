export default {
  name: "seo",
  type: "document",
  title: "Settings",
  __experimental_actions: [/*'create',*/ "update", /*'delete',*/ "publish"],
  groups: [
    { name: 'general', title: 'General', default: true  },
    { name: 'seo', title: 'SEO' },
    { name: 'home', title: 'Home'},
  ],
  fields: [
    {
      name: "baseURL",
      title: "Base URL",
      description: "URL at which the site is deployed",
      type: "url",
      group: 'general',
      validation: (Rule) => Rule.required()
    },
    {
      name: "title",
      type: "string",
      title: "Title",
      group: 'general',
      validation: (Rule) => Rule.required(),
    },

    {
      type: "object",
      title: "Video Loop",
      description: 'Short video clip',
      name: "homeCover",
      group: 'home',
      validation: (Rule) => Rule.required(),
      fields: [
        {
          title: "Full size",
          name: "full",
          type: "file",
          options: {
            accept: "video/*",
          },
        },
        {
          title: "Small size",
          name: "small",
          type: "file",
          options: {
            accept: "video/*",
          },
        },
        {
          title: 'Media Dimensions',
          name: 'dimensions',
          type: 'object',
          fields: [
            {
              name: 'width',
              title: 'Width',
              type: 'number',
              validation: (Rule) => Rule.required().max(1920),
              initialValue: 1080,
            },
            {
              name: 'height',
              title: 'Height',
              type: 'number',
              validation: (Rule) => Rule.required().max(1920),
              initialValue: 1920,
            }
          ],
          options: {
            columns: 2
          }
        }
      ],
      options: {
        collapsible: true,
        collapsed: false,
      }
    },

    {
      name: "description",
      type: "text",
      title: "Description",
      description: "Describe your site for search engines and social media.",
      group: 'seo',
      validation: (Rule) => Rule.required(),
    },
    {
      name: "keywords",
      type: "array",
      title: "Keywords",
      description: "Add keywords that describes your site.",
      group: 'seo',
      of: [{ type: "string" }],
      options: {
        layout: "tags",
      },
      validation: (Rule) => Rule.required(),
    },
  ],
  initialValue: {
    title: "SREE - Filmmaker & Creative Director",
    url: "https://sreekrishna.com",
  },
};
