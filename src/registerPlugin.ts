/// <reference path="../lib/openrct2.d.ts" />

import * as Environment from "./environment";
import { main } from "./main";


registerPlugin({
	name: "RideVehicleEditor",
	version: Environment.pluginVersion,
	authors: ["Basssiiie"],
	type: "remote",
	licence: "MIT",
	targetApiVersion: 65,
	main,
});
