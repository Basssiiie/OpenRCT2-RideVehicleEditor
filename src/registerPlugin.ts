/// <reference path="../lib/openrct2.d.ts" />

import main from './main';
import { pluginVersion } from './environment';

registerPlugin({
	name: 'RideVehicleEditor',
	version: pluginVersion,
	authors: ['Basssiiie'],
	type: 'local',
	licence: 'MIT',
	main,
});
