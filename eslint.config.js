// eslint.config.js
import markdown from 'eslint-plugin-markdown';
import tsParser from '@typescript-eslint/parser';

export default [{
        files: ['**/*.{js,mjs,cjs,jsx}'],
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
        // Configuration for TypeScript files
        files: ['**/*.{ts,tsx}'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            parser: tsParser,
            parserOptions: {
                project: './tsconfig.json',
            },
        },
        rules: {
            // TypeScript-specific rules
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
            'semi': 'off',
        },
    },
    {
        // Configuration for markdown code blocks
        files: ['**/*.md/*.{js,ts,jsx,tsx}'],
        rules: {
            'no-undef': 'off',
            'no-unused-vars': 'off',
            'no-console': 'off',
            'semi': 'off',
        },
    },
];