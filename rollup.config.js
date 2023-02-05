import resolve from "@rollup/plugin-node-resolve";
import replace from "@rollup/plugin-replace";
import typescript from "@rollup/plugin-typescript";
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
function getOutput()
{
	if (!isDev)
		return "./dist/RideVehicleEditor.js";

	const pluginPath = "OpenRCT2/plugin/RideVehicleEditor.js";
	switch (process.platform)
	{
		case "win32": return `${getPath("documents")}/${pluginPath}`;
		default: return `${getPath("userData")}/${pluginPath}`; // for both Mac and Linux
	}
}


/**
 * @type {import("rollup").RollupOptions}
 */
const config = {
	input: "./src/registerPlugin.ts",
	output: {
		file: getOutput(),
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
		typescript(),
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
			mangle: isDev ? {}
			: {
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