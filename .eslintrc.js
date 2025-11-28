module.exports = {
  root: true,
  env: { browser: true, es2021: true },
  extends: ['eslint:recommended', 'plugin:import/recommended', 'prettier'],
  overrides: [
    {
      files: ['**/*.ts?(x)'],
      parser: '@typescript-eslint/parser',
      extends: ['plugin:@typescript-eslint/recommended', 'plugin:import/typescript'],
    },
  ],
  plugins: ['simple-import-sort', 'prettier', '@typescript-eslint', 'unused-imports'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    tsconfigRootDir: '.',
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  settings: {
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
    'import/resolver': {
      typescript: {},
      node: {
        paths: ['src'],
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    },
    react: {
      version: 'detect',
    },
  },
  rules: {
    'prettier/prettier': ['error', {}, { usePrettierrc: true }],
    'arrow-parens': 0,
    'no-debugger': 1,
    'no-warning-comments': [
      1,
      {
        terms: ['hardcoded'],
        location: 'anywhere',
      },
    ],
    'no-return-await': 0,
    'object-curly-spacing': ['error', 'always'],
    'simple-import-sort/imports': 'warn',
    'simple-import-sort/exports': 'warn',
    'unused-imports/no-unused-imports': 'warn',
    'no-var': 'error',
    'comma-dangle': [1, 'always-multiline'],
    'linebreak-style': ['error', 'unix'],
    'max-len': [
      1,
      {
        code: 100,
        comments: 100,
        ignoreUrls: true,
        ignoreStrings: true,
        ignoreTemplateLiterals: true,
        ignoreRegExpLiterals: true,
      },
    ],
    'no-console': [
      1,
      {
        allow: ['warn', 'error'],
      },
    ],
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/no-empty-object-type': ['warn', { allowInterfaces: 'with-single-extends' }],
  },
  ignorePatterns: [
    '!.prettierrc',
    '**/!.eslintrc.js',
    '**/dist*/',
    '**/scripts/**/*.js',
    '**/*__GENERATED__*',
    '**/build',
    '**/public',
    '**/.cache',
    '**/*.js',
    '**/*.html',
    'jest.config.base.js',
    'jest.config.js',
    '/packages/ios/',
    '/packages/android/',
    '/examples/ios/',
    '/examples/android/',
    '/examples/react-native/',
  ],
}
