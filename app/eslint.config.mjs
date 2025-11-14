import js from '@eslint/js';
import parser from '@typescript-eslint/parser';
import tseslint from 'typescript-eslint';
import reactPlugin from 'eslint-plugin-react';

const eslintConfig = [
    // JS base config
    js.configs.recommended,

    // Custom config
    {
        files: ['**/*.{ts,tsx}'],
        languageOptions: {
            parser,
            parserOptions: {
                ecmaVersion: 'latest',
                sourceType: 'module',
                ecmaFeatures: {
                    jsx: true,
                }
            },
        },
        plugins: {
            react: reactPlugin,
            '@typescript-eslint': tseslint.plugin,
        },
        rules: {
            'react/no-unescaped-entities': 'off',
            'no-constant-condition': 'error',
            'no-dupe-else-if': 'error',
            'no-dupe-args': 'error',
            'no-dupe-keys': 'error',
            'no-duplicate-case': 'error',
            'no-duplicate-imports': 'error',
            'no-ex-assign': 'error',
            'no-fallthrough': 'warn',
            'no-func-assign': 'warn',
            'no-import-assign': 'error',
            'no-irregular-whitespace': [
                'error',
                {
                    skipStrings: true,
                    skipComments: true,
                    skipTemplates: true,
                },
            ],
            'no-self-assign': 'warn',
            'no-self-compare': 'warn',
            'no-template-curly-in-string': 'warn',
            'no-unmodified-loop-condition': 'warn',
            'no-unreachable': 'error',
            'no-unreachable-loop': 'warn',
            '@typescript-eslint/no-unused-vars': [
                'warn',
                {
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                    caughtErrorsIgnorePattern: '^_',
                },
            ],
            'no-undef': 'off', // TODO
            'no-unused-vars': 'off',
            camelcase: [
                'warn',
                {
                    ignoreGlobals: true,
                },
            ],
            eqeqeq: 'error',
            'prefer-const': 'error',
            'no-with': 'error',
            'no-void': 'error',
            'no-var': 'error',
            'no-eval': 'error',
            'arrow-spacing': [
                'error',
                {
                    before: true,
                    after: true,
                },
            ],
            'block-spacing': 'error',
            'brace-style': ['error', 'stroustrup'],
            'comma-dangle': ['error', 'only-multiline'],
            'comma-spacing': 'error',
            'eol-last': 'error',
            'jsx-quotes': ['error', 'prefer-double'],
            semi: ['error', 'always'],
            quotes: [
                'error',
                'single',
                {
                    allowTemplateLiterals: true,
                },
            ],
            'no-extra-semi': 'error',
            'react/react-in-jsx-scope': 'off',
            'react/jsx-curly-spacing': [
                'error',
                {
                    when: 'always',
                    children: true,
                },
            ],
            'react/jsx-wrap-multilines': [
                'error',
                {
                    declaration: 'parens-new-line',
                    assignment: 'parens-new-line',
                    return: 'parens-new-line',
                    arrow: 'parens-new-line',
                    condition: 'parens-new-line',
                    logical: 'parens-new-line',
                    prop: 'parens-new-line',
                },
            ],
            'object-curly-spacing': ['error', 'always'],
            'react/function-component-definition': [
                'error',
                {
                    namedComponents: 'function-declaration',
                    unnamedComponents: 'arrow-function',
                },
            ],
            indent: ['error', 4],
        },
        settings: {
            react: {
                version: 'detect',
            },
        },
    },

    // Ignore patterns
    {
        ignores: ['node_modules/'],
    },
];

export default eslintConfig;
