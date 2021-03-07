import Log from './helpers/logger';
import { getRidesInPark } from './helpers/ridesInPark';
import { isUiAvailable } from './helpers/utilityHelpers';
import EditVehicleViewModel from './models/editVehicleViewModel';
import SelectionViewModel from './models/selectionViewModel';
//import VehicleSelector from './services/selector';
//import VehicleEditor from './services/editor';
//import StateWatcher from './services/stateWatcher';
import VehicleEditorWindow from './ui/editorWindow';
import { editor } from './ui/editorWindow2';
import BUI from './ui/framework/bui';


// Stores whether the game is outdated check has been performed and what the result is.
let isGameOutdated: boolean | null = null;

// Currently only one instance of the editor window allowed.
let editorInstance: VehicleEditorWindow | null;


/**
 * Returns true if the game is outdated, may return false if the plugin cannot determine 
 * if the game is outdated. 
 */
function checkIsGameOutdated(): boolean
{
	if (isGameOutdated !== null)
	{
		return isGameOutdated;
	}

	const entities = map.getAllEntities("car");
	if (entities.length === 0)
	{
		// We cannot check if the game is up to date, assume up to date for now...
		return false;
	}

	const car = (entities[0] as Car);

	// The game is up-to-date if the 'trackProgress' property is present.
	isGameOutdated = (car && typeof car.trackProgress === 'undefined');
	return isGameOutdated;
}


/**
 * Opens the ride editor window.
 */
function openEditorWindow()
{
	// Check if game is up-to-date...
	if (checkIsGameOutdated())
	{
		const title = "Please update the game!"
		const message = "The version of OpenRCT2 you are currently playing is too old for this plugin.";

		ui.showError(title, message);
		Log.error(`${title} ${message}`);
		return;
	}

	// Show the current instance if one is active.
	if (editorInstance)
	{
		editorInstance.show();
		return;
	}
	
	const selection = new SelectionViewModel();
	const vehicle = new EditVehicleViewModel();

	selection.rideList.set(getRidesInPark().map(r => r.name));

	BUI.openWindow(editor, selection, vehicle);
	//vm.rideList.set(getRidesInPark().map(r => r.name));

	/*
	const window = new VehicleEditorWindow();
	window.show();

	const selector = new VehicleSelector(window);
	const editor = new VehicleEditor(selector, window);

	const watcher = new StateWatcher(window, selector, editor);

	window.onClose = (() =>
	{
		watcher.dispose();
		editorInstance = null;
	});
	editorInstance = window;
	*/
}


/**
 * Entry point of the plugin.
 */
function main()
{

	if (!isUiAvailable) 
	{
		Log.warning("Game is running headless, plugin is disabled.");
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
