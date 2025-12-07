import * as Environment from "./environment";
import { registerActions } from "./services/actions";
import { openViewportWindow } from "./ui/viewportWindow";


/**
 * Entry point of the plugin.
 */
export function main(): void
{
	registerActions();
	if (Environment.isUiAvailable)
	{
		//registerShortcuts();
		//ui.registerMenuItem("Edit ride vehicles", () => openEditorWindow());
		ui.registerMenuItem("Edit ride vehicles (new ui)", () =>
		{
			openViewportWindow();
		});
	}
}
