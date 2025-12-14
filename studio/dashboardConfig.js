const deployHook =
  "https://api.vercel.com/v1/integrations/deploy/prj_I8QTDwwh10IGE6sGTaA0M2VvsKwR/c3iaL1sYtr";

export default {
  widgets: [
    {
      name: "vercel-deploy",
      layout: { width: "medium" },
      options: {
        deployHook,
        title: "Vercel Deployment",
      },
    },
    { name: "project-users", layout: { height: "auto" } },
  ],
};
