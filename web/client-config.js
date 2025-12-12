module.exports = {
  sanity: {
    projectId: process.env.SANITY_PROJECT_ID || 'pyltmxm0',
    dataset: process.env.SANITY_DATASET || 'production',
    apiVersion: '2022-04-30',
    useCdn: false,
  },
};
