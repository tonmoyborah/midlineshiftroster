module.exports = {
	env: { browser: true, es2022: true, node: true },
	extends: [
		'eslint:recommended',
		'plugin:react/recommended',
		'plugin:react-hooks/recommended',
		'plugin:@typescript-eslint/recommended',
		'prettier'
	],
	parser: '@typescript-eslint/parser',
	plugins: ['react', 'react-hooks', '@typescript-eslint'],
	settings: { react: { version: 'detect' } },
	rules: {
		'react/react-in-jsx-scope': 'off'
	}
}; 