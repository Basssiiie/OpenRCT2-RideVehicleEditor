import { isUiAvailable, log } from './helpers/utilityHelpers';
import VehicleEditorWindow from './ui/editorWindow';


/**
 * Entry point of the plugin.
 */
const main = (): void => {
	log("Plugin started.");

	if (!isUiAvailable) {
		return;
	}

	/* // This can crash the plugin system...
	const window = ui.getWindow(VehicleEditorWindow.identifier);
	if (window)
	{
		log("Editor window was already open; reopen because of reload.");
		window.close();
	}
	*/

	ui.registerMenuItem("Edit ride vehicles", () => {
		VehicleEditorWindow.show();
	})
};

export default main;
