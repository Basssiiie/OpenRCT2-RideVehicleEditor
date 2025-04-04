import eslint from '@eslint/js';
import stylisticTs from '@stylistic/eslint-plugin-ts';
import tseslint from 'typescript-eslint';

export default tseslint.config(
	eslint.configs.recommended,
	tseslint.configs.strictTypeChecked,
	tseslint.configs.stylisticTypeChecked,
	stylisticTs.configs.all,
	{
		languageOptions: {
			parserOptions: {
				ecmaVersion: 5,
				projectService: true,
			}
		},
		rules: {
			"@typescript-eslint/consistent-type-assertions": ["error", { assertionStyle: "angle-bracket" }],
			"@typescript-eslint/prefer-includes": "off", // not in es5
			"@typescript-eslint/prefer-literal-enum-member": "off", // enums are used as bit flags for clean efficiency
			"@typescript-eslint/prefer-nullish-coalescing": "off", // too verbose in es5
			"@typescript-eslint/prefer-optional-chain": "off", // too verbose in es5
			"@typescript-eslint/prefer-string-starts-ends-with": "off", // not in es5
    		"@typescript-eslint/no-confusing-void-expression": ["error", { ignoreArrowShorthand: true }],
			"@typescript-eslint/no-inferrable-types": "warn",
			"@typescript-eslint/no-unnecessary-condition": "warn",
			"@typescript-eslint/no-unsafe-enum-comparison": "off", // enums are only used as labelled numbers
			"@typescript-eslint/restrict-plus-operands": ["error", { allowNumberAndString: true }],
			"@typescript-eslint/restrict-template-expressions": ["error", { allowArray: true, allowBoolean: true, allowNullish: true, allowNumber: true }],
    		"@typescript-eslint/triple-slash-reference": "off", // needed for openrct2 symbols
			"@typescript-eslint/unified-signatures": "off", // signatures are split for easier readability
			"@stylistic/ts/brace-style": ["error", "allman"],
			"@stylistic/ts/indent": ["error", "tab", { "flatTernaryExpressions": true, "ignoredNodes": ["ArrowFunctionExpression", "ImportDeclaration", "ObjectExpression"], "SwitchCase": 1 }],
			"@stylistic/ts/keyword-spacing": ["error", { "overrides": { "this": { "before": false } } }],
			"@stylistic/ts/space-before-function-paren": ["error", "never"],
			"@stylistic/ts/quote-props": "off",
			"@stylistic/ts/lines-around-comment": "off",
			"@stylistic/ts/lines-between-class-members": "off",
			"@stylistic/ts/no-extra-parens": "off",
			"@stylistic/ts/object-curly-spacing": "off",
			"@stylistic/ts/object-property-newline": "off",
		}
	},
	{
		files: [
			"**/tests/**/*.ts"
		],
		rules: {
			"@typescript-eslint/dot-notation": "off", // by-passes allowed in tests
    		"@typescript-eslint/no-non-null-assertion": "off", // allowed in tests
			"@stylistic/ts/brace-style": ["error", "allman", { "allowSingleLine": true }], // single lines allowed in tests
		}
	},
	{
		ignores: [
			"**/dist/**",
			"**/lib/**",
			"**/*.config.{js,mjs}",
			"**/_setup.cjs"
		]
	}
);
