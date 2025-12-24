import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import { defineConfig, globalIgnores } from 'eslint/config';

// Flat Config（ESLint v8+）詳細設定
// - ブラウザ向け(JSX含む)とNode向け(設定ファイル等)でオーバーライド
// - 明示的な無視パターンで静的アセット/ビルド成果物を対象外に
export default defineConfig([
  // グローバル無視（パスパターン）
  globalIgnores(['node_modules/**', 'dist/**', 'coverage/**', 'public/**', '.vercel/**']),

  // ブラウザ/アプリコード（JSX含む）
  {
    name: 'app:browser-jsx',
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.browser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    rules: {
      // 変数未使用検出（Reactの新JSX変換や定数名慣例に配慮）
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
      // デバッグコードの混入防止
      'no-debugger': 'error',
      // コンソール利用はwarn/errorのみ許可
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      // 近代的なJS推奨
      'no-var': 'error',
      'prefer-const': 'warn',
      'object-shorthand': 'warn',
      // 意図しない等価比較を減らす（null/undefinedにはsmart）
      eqeqeq: ['warn', 'smart'],
      // 可読性のためのブロック強制（複数行）
      curly: ['warn', 'multi-line'],
      // React Hooks の基本ルール（明示再設定。推奨設定で有効だがseverity指定）
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      // ViteのFast Refresh互換：コンポーネント以外のexportに注意
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },

  // Node向け設定ファイル（ESLint/Vite等）
  {
    name: 'config:node',
    files: ['**/*.config.js', 'vite.config.js', 'eslint.config.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.node,
    },
    rules: {
      // 設定ファイルではconsole利用を許可
      'no-console': 'off',
      // Nodeスクリプトでも最新構文を推奨
      'no-var': 'error',
      'prefer-const': 'warn',
    },
  },
]);
