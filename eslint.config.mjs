import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import cssModules from 'eslint-plugin-css-modules';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import {fixupPluginRules} from '@eslint/compat';

export default tseslint.config(
    {
        ignores: [
            'eslint.config.mjs',
            'coverage/**',
            'dist/**',
            '.next/**',
            'out/**',
            'scripts/**',
            'src/lib/**',
            'postcss.config.mjs',
            'notes/**',
        ],
    },
    eslint.configs.recommended,
    ...tseslint.configs.recommendedTypeChecked,
    eslintPluginPrettierRecommended,
    {
        languageOptions: {
            globals: {
                ...globals.node,
                ...globals.jest,
            },
            sourceType: 'module',
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
    },
    {
        files: ['**/*.{ts,tsx}'],
        plugins: {
            'css-modules': fixupPluginRules(cssModules),
        },
        rules: {
            'css-modules/no-unused-class': 'warn',
            'css-modules/no-undef-class': 'warn',
        },
    },
    {
        files: ['**/*.{ts,tsx}'],
        rules: {
            'no-unused-vars': 'off',
            '@typescript-eslint/no-unused-vars': [
                'error',
                {
                    vars: 'all',
                    args: 'after-used',
                    ignoreRestSiblings: false,
                    caughtErrors: 'all',
                },
            ],
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-floating-promises': 'warn',
            '@typescript-eslint/no-unsafe-argument': 'warn',
            'prettier/prettier': ['warn', {endOfLine: 'auto', tabWidth: 4, bracketSpacing: false}],
        },
    },
);
