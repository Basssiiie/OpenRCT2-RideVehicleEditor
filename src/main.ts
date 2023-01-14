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
	if (version < 65)
	{
		// 65 => 0.4.3 release
		showUpdateError("The version of OpenRCT2 you are currently playing is too old for this plugin.");
		return;
	}
	if (version < 69 && Environment.isMultiplayer())
	{
		// 69 => https://github.com/OpenRCT2/OpenRCT2/pull/19091
		showUpdateError("Multiplayer is only supported in the latest develop version.");
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
	const title = "Please update the game!";

	ui.showError(title, message);
	console.log(`[RideVehicleEditor] ${title} ${message}`);
}


/**
 * Entry point of the plugin.
 */
export function main(): void
{
	if (!Environment.isUiAvailable)
	{
		console.log("UI unavailable, plugin disabled.");
		return;
	}

	initActions();
	ui.registerMenuItem("Edit ride vehicles", () => openEditorWindow());
}