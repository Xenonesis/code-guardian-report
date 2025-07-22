// eslint.config.js
import markdown from 'eslint-plugin-markdown';

export default [
  {
    files: ['**/*.{js,mjs,cjs,jsx,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    rules: {
      // Add your rules here
      'semi': ['error', 'always'],
      'quotes': ['error', 'single'],
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
];