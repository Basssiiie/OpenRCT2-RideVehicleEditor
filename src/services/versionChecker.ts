/**
 * Checks if the game is up-to-date for running the plugin, and shows a popup if it's not.
 */
export function isValidGameVersion(): boolean
{
	const version = context.apiVersion;
	if (version < 105)
	{
		// 105 => https://github.com/OpenRCT2/OpenRCT2/pull/23359
		showUpdateError("The version of OpenRCT2 you are currently playing is too old for this plugin.");
		return false;
	}

	return true;
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
