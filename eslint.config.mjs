import { eslintConfig, eslintConfigReact } from '@goncharovv/eslint-config';

/** @type {import('eslint').Linter.Config[]} */
export default [
  ...eslintConfig,
  ...eslintConfigReact,

  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
];
