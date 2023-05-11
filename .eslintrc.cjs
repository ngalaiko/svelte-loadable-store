module.exports = {
	root: true,
	parser: '@typescript-eslint/parser',
	extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'prettier'],
	ignorePatterns: ['*.cjs'],
	plugins: ['@typescript-eslint'],
	env: {
		browser: true,
		node: true
	},
	rules: {
		'@typescript-eslint/no-empty-function': 'off',
		'@typescript-eslint/no-explicit-any': 'off'
	}
};
