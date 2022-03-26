import babel from "@rollup/plugin-babel";
import resolve from "@rollup/plugin-node-resolve";
import replace from "@rollup/plugin-replace";
import getPath from "platform-folders";
import { terser } from "rollup-plugin-terser";


// Environment variables
const build = process.env.BUILD || "development";
const isDev = (build === "development");
const extensions = [ ".js", ".ts" ];

/**
 * Tip: if you change the path here to your personal user folder,
 * you can ignore this change in git with:
 * ```
 * > git update-index --skip-worktree rollup.config.js
 * ```
 * To accept changes on this file again, use:
 * ```
 * > git update-index --no-skip-worktree rollup.config.js
 * ```
 */
const output = (isDev)
	? `${getPath("documents")}/OpenRCT2/plugin/RideVehicleEditor.js`
	: "./dist/RideVehicleEditor.js";


/**
 * @type {import("rollup").RollupOptions}
 */
const config = {
	input: "./src/registerPlugin.ts",
	output: {
		file: output,
		format: "iife",
	},
	plugins: [
		resolve({
			extensions,
		}),
		replace({
			extensions,
			include: "./src/environment.ts",
			preventAssignment: true,
			values: {
				__BUILD_CONFIGURATION__: JSON.stringify(build)
			}
		}),
		babel({
			assumptions: {
				constantReexports: true,
				constantSuper: true,
				enumerableModuleMeta: true,
				ignoreFunctionLength: true,
				ignoreToPrimitiveHint: true,
				iterableIsArray: true,
				mutableTemplateObject: true,
				noClassCalls: true,
				noDocumentAll: true,
				noIncompleteNsImportDetection: true,
				noNewArrows: true,
				objectRestNoSymbols: true,
				privateFieldsAsProperties: true,
				pureGetters: true,
				setClassMethods: true,
				setComputedProperties: true,
				setPublicClassFields: true,
				setSpreadProperties: true,
				skipForOfIteratorClosing: true,
				superIsCallableConstructor: true,
			},
			babelHelpers: "bundled",
			babelrc: false,
			extensions,
			presets: [
				"@babel/preset-env",
				"@babel/preset-typescript"
			]
		}),
		terser({
			compress: {
				passes: 5,
				toplevel: true,
				unsafe: true
			},
			format: {
				comments: false,
				quote_style: 1,
				wrap_iife: true,
				preamble: "// Get the latest version: https://github.com/Basssiiie/OpenRCT2-RideVehicleEditor",

				beautify: isDev,
			},
			mangle: {
				properties: {
					regex: /^_/
				}
			},

			// Useful only for stacktraces:
			keep_fnames: isDev,
		}),
	],
};
export default config;