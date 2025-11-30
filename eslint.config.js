// eslint.config.js
import markdown from 'eslint-plugin-markdown';
import js from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import reactPlugin from 'eslint-plugin-react';

export default [
  js.configs.recommended,
  {
    files: ['**/*.{js,mjs,cjs,jsx,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser: tsParser, // Use TypeScript parser
      parserOptions: {
        ecmaFeatures: {
          jsx: true, // Enable JSX parsing
        },
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin, // Use TypeScript plugin
      'react': reactPlugin, // Use React plugin
    },
    rules: {
      // Add your rules here
      'semi': ['error', 'always'],
      'quotes': ['error', 'single', { allowTemplateLiterals: true }],
      'no-undef': 'off', // TypeScript provides undefined checks
      'no-unused-vars': 'off', // Use @typescript-eslint/no-unused-vars instead
      // TypeScript-specific rules
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      // React-specific rules
      'react/react-in-jsx-scope': 'off', // Not needed in React 17+
      'react/jsx-uses-vars': 'error', // Report variables used in JSX as unused
    },
  },
  {
    // Configuration for markdown files
    files: ['**/*.md'],
    plugins: {
      markdown,
    },
    processor: 'markdown/markdown',
    rules: {
      // Disable rules that might cause issues with markdown content
      'no-undef': 'off',
      'no-unused-vars': 'off',
      'no-console': 'off',
      'no-unused-expressions': 'off',
    },
  },
  {
    // Ignore markdown HTML linting errors - README uses valid HTML for formatting
    files: ['**/*.md/**'],
    rules: {
      // Disable all rules for markdown code blocks
    },
  },
];