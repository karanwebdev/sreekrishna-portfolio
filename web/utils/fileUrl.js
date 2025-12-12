const { buildFileUrl } = require('@sanity/asset-utils');
const sanityClient = require('./sanityClient');

const fileUrlFor = (asset) => {
  const [_file, id, extension] = asset.asset._ref.split('-');
  const { projectId, dataset } = sanityClient.clientConfig;

  return `https://cdn.sanity.io/files/${projectId}/${dataset}/${id}.${extension}`;
};

module.exports = fileUrlFor;
