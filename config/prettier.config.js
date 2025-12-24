/** Prettier shared config (JS) */
export default {
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  semi: true,
  singleQuote: true,
  jsxSingleQuote: false,
  trailingComma: 'es5',
  bracketSpacing: true,
  arrowParens: 'always',
  endOfLine: 'lf',
  htmlWhitespaceSensitivity: 'css',
  proseWrap: 'always',
  overrides: [
    {
      files: ['*.css'],
      options: { singleQuote: false },
    },
    {
      files: ['*.md'],
      options: { printWidth: 80, proseWrap: 'always' },
    },
    {
      files: ['*.json'],
      options: { trailingComma: 'none' },
    },
  ],
};
