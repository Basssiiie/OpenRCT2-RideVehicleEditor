import { isUiAvailable, log } from './helpers/utilityHelpers';
import { VehicleEditorWindow } from './core/window';


/**
 * Entry point of the plugin.
 */
const main = (): void => {
	log("Plugin started.");

	if (!isUiAvailable) {
		return;
	}

	ui.registerMenuItem("Edit ride vehicles", () => {
		VehicleEditorWindow.show();
	})
};

export default main;
