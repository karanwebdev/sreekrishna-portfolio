export default {
  name: "about",
  title: "About",
  type: "document",
  groups: [
    {
      name: 'hero',
      title: 'Hero',
      default: true,
    },
    {
      name: 'services',
      title: 'Services',
    },
    {
      name: 'footer',
      title: 'Footer',
    },
  ],
  fields: [
    {
      name: "intro",
      title: "Intro",
      type: "aboutHeroBlock",
      group: 'hero',
      validation: (Rule) => Rule.required(),
    },
    {
      name: "desc",
      title: "Description",
      type: "text",
      group: 'hero',
      validation: (Rule) => Rule.required(),
    },
    {
      name: "cover",
      title: "Cover image",
      type: "image",
      group: 'hero',
      validation: (Rule) => Rule.required(),
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: "alt",
          type: "string",
          title: "Alt description",
          options: {
            isHighlighted: true,
            collapsible: true,
            collapsed: true,
          },
        },
      ],
    },
    {
      title: "Services",
      name: "services",
      type: "array",
      group: 'services',
      // validation: (Rule) => Rule.required().length(3),
      of: [
        {
          type: "object",
          fields: [
            {
              title: "Icon",
              name: "icon",
              type: "image",
              validation: (Rule) => Rule.required(),
            },
            {
              title: "Title",
              name: "title",
              type: "string",
              validation: (Rule) => Rule.required(),
            },
            {
              title: "Description",
              name: "description",
              type: "text",
              validation: (Rule) => Rule.required(),
            }
          ]
        }
      ],
      options: {
        collapsible: true,
        collapsed: false,
      }
    },
    {
      title: "Footer Description",
      name: "footer",
      type: "text",
      validation: (Rule) => Rule.required(),
      group: 'footer',
    }
  ],
  preview: {
    select: {},
    prepare(selection) {
      return Object.assign(
        {},
        {
          title: "About",
        }
      );
    },
  },
};
