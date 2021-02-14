import replace from '@rollup/plugin-replace';
import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';

export default {
	input: './src/registerPlugin.ts',
	output: {
		file: './dist/RideVehicleEditor.js',
		format: 'iife',
	},
	plugins: [
		replace({
			__BUILD_CONFIGURATION__: JSON.stringify("production"),
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
