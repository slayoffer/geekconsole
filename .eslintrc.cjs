const vitestFiles = ['app/**/__tests__/**/*', 'app/**/*.{spec,test}.*'];
const testFiles = ['**/tests/**', ...vitestFiles];
const appFiles = ['app/**'];

/** @type {import('@types/eslint').Linter.BaseConfig} */

module.exports = {
	extends: [
		'plugin:tailwindcss/recommended',
		'plugin:react-hooks/recommended',
		'plugin:storybook/recommended',
		'@remix-run/eslint-config',
		'@remix-run/eslint-config/node',
		'prettier',
	],
	overrides: [
		{
			files: appFiles,
			excludedFiles: testFiles,
			rules: {
				'no-restricted-imports': [
					'error',
					{
						patterns: [
							{
								group: testFiles,
								message: 'Do not import test files in app files',
							},
						],
					},
				],
			},
		},
		{
			extends: ['@remix-run/eslint-config/jest-testing-library'],
			files: vitestFiles,
			rules: {
				'testing-library/no-await-sync-events': 'off',
				'jest-dom/prefer-in-document': 'off',
			},
			settings: {
				jest: {
					version: 28,
				},
			},
		},
	],
	parserOptions: {
		ecmaVersion: 'latest',
		sourceType: 'module',
		project: true,
		ecmaFeatures: {
			jsx: true,
		},
	},
	plugins: ['react'],
	rules: {
		'@typescript-eslint/consistent-type-definitions': ['error', 'type'],
		'@typescript-eslint/consistent-type-imports': 'error',
		'@typescript-eslint/explicit-function-return-type': 'off',
		'@typescript-eslint/no-throw-literal': 'off',
		'@typescript-eslint/consistent-type-assertions': 'off',
		'no-empty-pattern': 'off',
		'import/no-duplicates': ['warn', { 'prefer-inline': true }],
		'import/consistent-type-specifier-style': ['warn', 'prefer-inline'],
		'import/order': [
			'warn',
			{
				alphabetize: { order: 'asc', caseInsensitive: true },
				groups: [
					'builtin',
					'external',
					'internal',
					'parent',
					'sibling',
					'index',
				],
			},
		],
	},
};
