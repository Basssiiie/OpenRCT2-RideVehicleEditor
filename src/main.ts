import { isUiAvailable, log } from './helpers/utilityHelpers';
import { VehicleEditorWindow } from './core/window';


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
