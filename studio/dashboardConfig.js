const deployHook =
  "https://api.vercel.com/v1/integrations/deploy/prj_I8QTDwwh10IGE6sGTaA0M2VvsKwR/c3iaL1sYtr";

console.log('[DashboardConfig] Loading dashboard with deploy hook:', deployHook);

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
