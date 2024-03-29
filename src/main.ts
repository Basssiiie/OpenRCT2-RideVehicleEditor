import * as Environment from "./environment";
import { initActions } from "./services/actions";
import { mainWindow } from "./ui/mainWindow";


/**
 * Opens the ride editor window.
 */
function openEditorWindow(): void
{
	// Check if game is up-to-date...
	const version = context.apiVersion;
	if (version < 75)
	{
		// 75 => https://github.com/OpenRCT2/OpenRCT2/pull/19305
		showUpdateError("The version of OpenRCT2 you are currently playing is too old for this plugin.");
		return;
	}

	// Show the current instance if one is active.
	mainWindow.open();
}


/**
 * Report to the player that they need to update the game, both ingame and in console.
 */
function showUpdateError(message: string): void
{
	const title = "Please update the game! ";

	ui.showError(title, message);
	console.log("[RideVehicleEditor] " + title + message);
}


/**
 * Entry point of the plugin.
 */
export function main(): void
{
	initActions();
	if (Environment.isUiAvailable)
	{
		ui.registerMenuItem("Edit ride vehicles", () => openEditorWindow());
	}
}