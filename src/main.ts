import { isUiAvailable, log } from './helpers/utilityHelpers';
import VehicleSelector from './services/selector';
import VehicleEditor from './services/editor';
import VehicleEditorWindow from './ui/editorWindow';


/**
 * Opens the ride editor window.
 */
function openEditorWindow()
{
	const window = VehicleEditorWindow.show();

	const selector = new VehicleSelector(window);
	new VehicleEditor(selector, window);
}


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

	ui.registerMenuItem("Edit ride vehicles", () => openEditorWindow());
};



export default main;
