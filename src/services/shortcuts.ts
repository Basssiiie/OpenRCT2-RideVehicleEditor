import { model, openEditorWindow } from "../ui/mainWindow";

/**
 * Register all available shortcuts for the plugin.
 */
export function registerShortcuts(): void
{
	createShortcut("open", "[RVE] Open window", ["E"], () => openEditorWindow());
	createShortcut("pick", "[RVE] Activate picker", ["CTRL+E", "GUI+E"], () => model._setPicker(!model._isPicking.get(), () => model._isOpen || openEditorWindow()));
	createShortcut("copy", "[RVE] Copy selected vehicle", null, () => model._copy(true));
	createShortcut("paste", "[RVE] Paste copied vehicle", null, () => model._paste());
	createShortcut("locate", "[RVE] Move camera to selected vehicle", null, () => model._locate());

	createShortcut("ride-next-", "[RVE] Select next ride", null, () => navigateRides(1));
	createShortcut("ride-previous", "[RVE] Select previous ride", null, () => navigateRides(-1));
	createShortcut("train-next", "[RVE] Select next train", null, () => navigateTrains(1));
	createShortcut("train-previous", "[RVE] Select previous train", null, () => navigateTrains(-1));
	createShortcut("vehicle-next", "[RVE] Select next vehicle", null, () => navigateVehicles(1));
	createShortcut("vehicle-previous", "[RVE] Select previous vehicle", null, () => navigateVehicles(-1));
}

/**
 * Shorthand helper function for registering shortcuts.
 */
function createShortcut(id: string, text: string, keys: string[] | null, callback: () => void): void
{
	const shortcut: ShortcutDesc = { id: "ride-vehicle-editor." + id, text, callback };
	if (keys)
	{
		shortcut.bindings = keys;
	}
	ui.registerShortcut(shortcut);
}

/**
 * Navigates to a specific ride in the list by index offset.
 */
function navigateRides(offset: number): void
{
	const ride = model._selectedRide.get();
	if (ride)
	{
		model._selectRide(ride[1] + offset);
	}
}

/**
 * Navigates to a specific train in the list by index offset.
 */
function navigateTrains(offset: number): void
{
	const train = model._selectedTrain.get();
	if (train)
	{
		model._selectTrain(train[1] + offset);
	}
}

/**
 * Navigates to a specific vehicle in the list by index offset.
 */
function navigateVehicles(offset: number): void
{
	const vehicle = model._selectedVehicle.get();
	if (vehicle)
	{
		model._selectVehicle(vehicle[1] + offset);
	}
}
