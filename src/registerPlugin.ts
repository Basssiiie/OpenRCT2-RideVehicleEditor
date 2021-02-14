/// <reference path="../lib/openrct2.d.ts" />

import main from './main';
import { pluginVersion } from './environment';

registerPlugin({
	name: 'RideVehicleEditor',
	version: pluginVersion,
	minApiVersion: 16, // Version 16 adds car.travelBy
	authors: ['Basssiiie'],
	type: 'local',
	licence: 'MIT',
	main,
});
