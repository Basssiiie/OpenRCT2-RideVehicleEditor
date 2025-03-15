import * as Environment from "./environment";
import { registerActions } from "./services/actions";
import { registerShortcuts } from "./services/shortcuts";
import { openEditorWindow } from "./ui/mainWindow";


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
	}
}
