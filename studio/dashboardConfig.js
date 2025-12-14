const title = "Sree Krishna Portfolio";
const apiId = "prj_I8QTDwwh10IGE6sGTaA0M2VvsKwR";
const buildHookId = "c3iaL1sYtr";
const name = "sreekrishna-portfolio";

export default {
  widgets: [
    {
      name: "netlify",
      options: {
        title: "Vercel Deployments",
        description:
          "This site is a static build deployed on Vercel. Click 'Deploy' below to manually trigger a rebuild and publish your content changes.",
        sites: [
          {
            title,
            apiId,
            buildHookId,
            name,
          },
        ],
      },
    },
    { name: "project-users", layout: { height: "auto" } },
  ],
};
