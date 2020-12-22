import WidgetDesc from "./widgetDesc";


/**
 * Base class for managing and binding a widget controller to a window.
 */
abstract class Component
{
	protected _window: (Window | null) = null;
	protected _description: WidgetDesc;
	protected _isActive: boolean = true;


	/**
	 * Shortcut to the name of the component.
	 */
	protected get _name()
	{
		return this._description.name;
	}


	/**
	 * Gets the widget description for this component.
	 */
	get description()
	{
		return this._description;
	}


	constructor(description: WidgetDesc)
	{
		this._description = description;
	}


	/**
	 * Binds the window which this component.
	 */
	bind(window: Window)
	{
		this._window = window;
		this.refresh();
	}


	/**
	 * Toggles whether the component is currently active.
	 * @param toggle True if active, or false if disabled.
	 */
	active(toggle: boolean)
	{
		this._isActive = toggle;

		const widget = this.getWidget();
		widget.isDisabled = !toggle;

		this.refreshWidget(widget);
	}


	/**
	 * Refreshes the widget related to this component.
	 */
	refresh()
	{
		const widget = this.getWidget();
		this.refreshWidget(widget);
	}


	/**
	 * Updates the internal widget with the appropiate values.
	 */
	protected abstract refreshWidget(widget: Widget): void;



	/**
	 * Gets the underlying widget from the attached window.
	 */
	protected getWidget<TWidget extends Widget>(): TWidget
	{
		if (!this._window)
			throw new Error(`(${this._name}) The window is not bound, or gone.`);

		return this._window.findWidget<TWidget>(this._name);
	}
}

export default Component;
