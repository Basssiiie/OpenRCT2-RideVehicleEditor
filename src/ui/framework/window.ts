import Binder from "./binder";
import WidgetBindingContext from "./contexts/widgetBindingContext";
import WindowTemplate, { createUniqueId } from "./windowTemplate";


/**
 * The active window instance. This is the view in MVVM.
 */
export default class Window<TDescription>
{
	/**
	 * Unique id of this window. Will equal the id of its template if the template
	 * only allows one single instance.
	 */
	readonly id: string;

	private readonly _params: WindowDesc;
	private readonly _widgetContexts: WidgetBindingContext<WidgetBase>[] = [];


	/**
	 * Creates a new window instance from a template and binds the specified 
	 * viewmodels to it.
	 * 
	 * @param template The template to use for the user interface.
	 * @param viewModels The viewmodels to bind to this window.
	 */
	constructor(template: WindowTemplate<TDescription>, ...viewModels: unknown[])
	{
		this.id = (template.params.onlyOneInstance) ? template.id : createUniqueId();
		this._params = template.params as WindowDesc;

		if (viewModels.length > 0)
		{
			for (let element of template.getElements())
			{
				if (!element.bindings)
				{
					continue;
				}

				const context = new WidgetBindingContext(element.widget);
				this._widgetContexts.push(context);

				Binder.applyAll(context, viewModels, element.bindings);
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