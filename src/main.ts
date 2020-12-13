import { isUiAvailable, log } from './helpers/utilityHelpers';
import VehicleSelector from './services/selector';
import VehicleEditor from './services/editor';
import StateWatcher from './services/stateWatcher';
import VehicleEditorWindow from './ui/editorWindow';


// Currently only one instance of the editor window allowed.
let editorInstance: VehicleEditorWindow | null;


/**
 * Opens the ride editor window.
 */
function openEditorWindow()
{
	if (editorInstance)
	{
		editorInstance.show();
		return;
	}
	
	const window = new VehicleEditorWindow();
	window.show();

	const selector = new VehicleSelector(window);
	const editor = new VehicleEditor(selector, window);

	const watcher = new StateWatcher(selector, editor);

	window.onClose = (() =>
	{
		watcher.dispose();
		editorInstance = null;
	});
	editorInstance = window;
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
