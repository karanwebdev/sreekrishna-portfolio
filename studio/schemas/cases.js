import {
  orderRankField,
  orderRankOrdering,
} from "@sanity/orderable-document-list";

export default {
  name: "case",
  title: "Case",
  type: "document",
  orderings: [orderRankOrdering],
  groups: [
    {
      name: 'hero',
      title: 'Hero',
      default: true,
    },
    {
      name: 'body',
      title: 'Body',
    },
    {
      name: 'details',
      title: 'Details',
    },
  ],
  fields: [
    orderRankField({ type: "case" }),
    {
      name: "title",
      title: "Title",
      type: "string",
      group: 'hero',
      validation: (Rule) => Rule.required(),
    },
    {
      name: "slug",
      title: "Slug",
      description: 'This is what appears after: my-domain.com/cases/',
      type: "slug",
      group: 'details',
      validation: (Rule) => Rule.required(),
      options: {
        source: "title",
        maxLength: 96,
      },
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
      type: 'string',
      name: 'type',
      title: 'Project type',
      validation: (Rule) => Rule.required(),
      options:{
        list: [
          {title: 'Photographic', value: 'photo'},
          {title: 'Videographic', value: 'video'},
        ]
      },
      group: 'body',
      initialValue: 'video'
    },
    {
      type: "object",
      title: "Video Loop",
      description: 'Short video clip',
      name: "loop",
      group: 'body',
      hidden: ({parent}) => parent?.type !== 'video',
      validation: (Rule) => Rule.custom((value, {parent}) => parent?.type === 'video' ? typeof value === 'undefined' ? 'Video Loop is required' : true : true),
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
          title: 'Poster',
          name: 'poster',
          type: 'image',
          description: 'Ensure the poster is the same aspect ratio as the video',
          options: {
            hotspot: true,
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
      name: "details",
      title: "Details",
      type: "object",
      group: 'details',
      fields: [
        {
          name: "year",
          title: "Year",
          type: "string",
          validation: (Rule) => Rule.required(),
        },
        {
          name: "client",
          title: "Client",
          type: "string",
          validation: (Rule) => Rule.required(),
        },
        {
          name: "type",
          title: "Type",
          type: "string",
          validation: (Rule) => Rule.required(),
        },
      ],
      validation: (Rule) => Rule.required(),
      options: {
        collapsible: true,
        collapsed: false,
      }
    },
    {
      name: "intro",
      title: "Intro",
      type: "text",
      group: 'hero',
      validation: (Rule) => Rule.required(),
    },
    {
      name: "link",
      title: "YouTube link",
      group: 'body',
      type: "url",
      validation: (Rule) => Rule.custom((value, {parent}) => parent?.type === 'video' ? typeof value === 'undefined' ? 'Video Loop is required' : true : true),
      hidden: ({parent}) => parent?.type !== 'video',
    },

    {
      name: "thumbnails",
      title: "Thumbnails",
      group: 'body',
      type: "array",
      of: [
        {
          type: "image",
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
              },
            },
          ],
        },
      ],
    },

    {
      name: 'result',
      title: 'Result',
      group: 'body',
      type: 'text',
    },
    {
      name: 'resultDescription',
      title: 'Result Description',
      group: 'body',
      type: 'text',
    }
  ],

  preview: {
    select: {
      title: "title",
      media: "cover",
      subtitle: "details.client",
    },
  },
};
