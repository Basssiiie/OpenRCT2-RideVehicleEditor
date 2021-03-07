import Window from "./window";
import WindowTemplate from "./windowTemplate";


// It only tracks windows of which only a single instance can exist.
let activeWindows: Window<unknown>[] | null = null;


/**
 * Basssiiie's User Interface: a MVVM framework for OpenRCT2 plugins that makes it easier 
 * to create windows that are alive and stay up to date to your viewmodels.
 */
module BUI
{
	/**
	 * Open a new window with the specified template.
	 * 
	 * @param template The template to use for the window.
	 * @param viewModels The viewmodels to bind to.
	 */
	export function openWindow<TDescription>(template: WindowTemplate<TDescription>, ...viewModels: unknown[]): Window<TDescription>
	{
		const onlyOneInstance = template.params.onlyOneInstance;
		if (onlyOneInstance && activeWindows !== null)
		{
			const window = activeWindows.find(w => w.id === template.id);
			if (window)
			{
				window.focus();
				return window;
			}
		}

		const window = new Window(template, ...viewModels);
		if (onlyOneInstance)
		{
			if (activeWindows === null)
			{
				activeWindows = [ window ];
			}
			else
			{
				activeWindows.push(window);
			}
		}
		window.open();
		return window;
	}
}
export default BUI;