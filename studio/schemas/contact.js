export default {
  name: "contact",
  title: "Contact Details",
  type: "document",
  fields: [
    {
      name: "email",
      title: "Email Address",
      type: "string",
      validation: (Rule) => Rule.required(),
    },
    {
      name: "instagram",
      title: "Instagram",
      type: "url",
      validation: (Rule) => Rule.required(),
    },
    {
      name: "facebook",
      title: "Facebook",
      type: "url",
      validation: (Rule) => Rule.required(),
    },
  ],
  preview: {
    select: {},
    prepare(selection) {
      return Object.assign(
        {},
        {
          title: "Contact Details",
        }
      );
    },
  },
};
