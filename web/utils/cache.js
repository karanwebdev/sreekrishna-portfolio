const { AssetCache } = require('@11ty/eleventy-fetch');

require('dotenv').config();

const isProd = process.env.PRODUCTION !== 'false';

console.log(!isProd ? '[Building with cache]' : '[Not using cache]');

const withCache = async (fn, name, duration = '1d', overrideCache = false) => {
  const asset = new AssetCache(name);

  if (!isProd && !overrideCache && asset.isCacheValid(duration)) {
    return asset.getCachedValue();
  }

  const data = await fn();
  await asset.save(data, 'json');

  return data;
};

module.exports = withCache;
