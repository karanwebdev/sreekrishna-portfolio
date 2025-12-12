const title = 'Sree Krishna';
const apiId = '743befd7-872e-40c3-b4c2-c66d669f0d3a';
const buildHookId = '62c5d2b5d0a76d0fb0694f6d';
const name = 'sree-krishna';

export default {
  widgets: [
    {
      name: 'netlify',
      options: {
        title: 'Netlify deploys',
        description:
          'Because these sites are static builds, they need to be re-deployed to see the changes when documents are published. You can check if the build was successful.',
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
    { name: 'project-users', layout: { height: 'auto' } },
  ],
};