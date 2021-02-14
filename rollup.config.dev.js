import replace from '@rollup/plugin-replace';
import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';

export default {
	input: './src/registerPlugin.ts',
	output: {
		file: 'dist/RideVehicleEditor.js', // CHANGE THIS TO YOUR OPENRCT2 PLUGIN FOLDER FOR HOT RELOAD
		format: 'iife',
	},
	plugins: [
		replace({
			__BUILD_CONFIGURATION__: JSON.stringify("development"),
			include: "./src/environment.ts"
		}),
		typescript(),
		terser({
			format: {
				quote_style: 1,
				wrap_iife: true,
				preamble: '// Get the latest version: https://github.com/Basssiiie/OpenRCT2-RideVehicleEditor',
			},
		}),
	],
};
