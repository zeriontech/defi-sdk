// ESLint flat config for ESLint v9+

/** @type {import('eslint').Linter.FlatConfig[]} */
module.exports = [
  {
    ignores: [
      'node_modules',
      'coverage',
      'artifacts',
      'build',
      'docs',
      'typechain-types', // Exclude generated types
    ],
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: require('@typescript-eslint/parser'),
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': require('@typescript-eslint/eslint-plugin'),
    },
    rules: {
      'indent': ['error', 2],
      'no-undef': 'off',
      'prefer-const': 'off',
      'no-console': 'off',
      'linebreak-style': 'off',
      'operator-linebreak': 'off',
      'object-curly-newline': 'off',
      'arrow-body-style': 'off',
      ...require('@typescript-eslint/eslint-plugin').configs.recommended.rules,
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
    },
  },
]; 
