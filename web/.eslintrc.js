module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'airbnb-base',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    'linebreak-style': 0,
    'import/prefer-default-export': 'off',
    'no-plusplus': 'off',
    'no-param-reassign': 'off',
    'no-unused-vars': ['warn'],
    'no-unused-expressions': ['error', { allowShortCircuit: true, allowTernary: true }],
  },
};
