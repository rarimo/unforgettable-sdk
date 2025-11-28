const fs = require('fs');
const config = JSON.parse(fs.readFileSync(`${__dirname}/.swcrc`, 'utf-8'));

// Add the mut-cjs-exports plugin to handle CommonJS exports in ESM environment
config.jsc.experimental = {
  ...config.jsc.experimental,
  plugins: [
    ...(config.jsc.experimental?.plugins || []),
    ["@swc-contrib/mut-cjs-exports", {}]
  ],
}

module.exports = {
  ...require('../../jest.config.base.js'),

  transform: {
    '^.+\\.(t|j)sx?$': ['@swc/jest', { ...config, swcrc: false, exclude: [] }],
  },

  transformIgnorePatterns: [
    'node_modules/(?!(@noble)/)',
  ],

  moduleNameMapper: {
    '^@noble/(.*)$': '<rootDir>/../../node_modules/@noble/$1',
  },
};
