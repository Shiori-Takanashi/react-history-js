export default {
  extends: ['stylelint-config-standard'],
  ignoreFiles: [
    '**/node_modules/**',
    '**/dist/**',
    '**/coverage/**',
    '**/public/**',
    '**/.vercel/**',
  ],
  rules: {
    'selector-class-pattern': null, // allow existing BEM-ish names
    'no-duplicate-at-import-rules': null,
    'no-duplicate-selectors': null,
    'shorthand-property-no-redundant-values': null,
    'color-function-notation': null,
    'alpha-value-notation': null,
    'media-feature-range-notation': null,
    'color-hex-length': null,
    'rule-empty-line-before': null,
  },
};
