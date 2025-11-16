import next from 'eslint-config-next';

/** @type {import('eslint').Linter.FlatConfig[]} */
const config = [
  ...next,
  {
    rules: {
      'react/no-unescaped-entities': 'off',
    },
  },
];

export default config;
