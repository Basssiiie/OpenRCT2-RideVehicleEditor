import Binder from "./binder";
import WidgetBindingContext from "./contexts/widgetBindingContext";
import WindowTemplate, { createUniqueId } from "./windowTemplate";


/**
 * The active window instance. This is the view in MVVM.
 */
export default class Window<TDescription>
{
	readonly id: string;

	private readonly _params: WindowDesc;
	private readonly _viewModels: unknown[];
	private readonly _widgetContexts: WidgetBindingContext<WidgetBase>[] = [];


	constructor(template: WindowTemplate<TDescription>, ...viewModels: unknown[])
	{
		this.id = (template.params.onlyOneInstance) ? template.id : createUniqueId();

		this._params = template.params as WindowDesc;
		this._viewModels = viewModels;

		if (viewModels.length > 0)
		{
			for (let element of template.getBoundElements())
			{
				const context = new WidgetBindingContext(element.widget.name);
				this._widgetContexts.push(context);

				Binder.ApplyAll(context, this._viewModels, element.bindings);
			}
		}
	}

	
	/**
	 * Opens this window.
	 */
	open()
	{
		this._params.classification = this.id;
		const window = ui.openWindow(this._params);
		
		// Bind new window to all widget contexts
		for (let context of this._widgetContexts)
		{
			context.setWindow(window);
		}
	}


	/**
	 * Closes this window.
	 */
	close()
	{
		ui.closeWindows(this.id);

		// Unind old window to all widget contexts
		for (let context of this._widgetContexts)
		{
			context.setWindow(null);
		}
	}


	/**
	 * Brings focus to this window by moving it on top of other active windows.
	 */
	focus()
	{
		const window = ui.getWindow(this.id);
		window.bringToFront();
	}
}