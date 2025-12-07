import * as Environment from "./environment";
import { registerActions } from "./services/actions";
import { registerShortcuts } from "./services/shortcuts";
import { openEditorWindow } from "./ui/mainWindow";
import { viewportWindow } from "./ui/viewportWindow";
import { VehicleViewModel } from "./viewmodels/vehicleViewModel";


/**
 * Entry point of the plugin.
 */
export function main(): void
{
	registerActions();
	if (Environment.isUiAvailable)
	{
		registerShortcuts();
		ui.registerMenuItem("Edit ride vehicles", () => openEditorWindow());
		ui.registerMenuItem("Edit ride vehicles (new ui)", () =>
		{
			//const selection = new SelectionViewModel();
			//const viewport = new ViewportViewModel(selection);
			//const editor = new EditorViewModel(selection);

			const viewmodel = new VehicleViewModel();

			viewportWindow.open(viewmodel);
		});
	}
}
