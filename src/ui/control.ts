/**
 * Configurable settings for a custom widget.
 */
export interface ControlParams
{
	name: string;
	tooltip?: string;
	x: number;
	y: number;
	width: number;
	height: number;
}


/**
 * Base class for managing and binding a widget controller to a window.
 */
export default abstract class Control<TParams extends ControlParams>
{
	/**
	 * Gets the parameters for this control.
	 */
	get params(): Required<TParams>
	{
		return this._params;
	}


	protected _window: (Window | null) = null;
	protected _isActive: boolean = true;
	protected _params: Required<TParams>;


	/**
	 * Create a base control with the specified parameters.
	 * @param params The parameters for the control.
	 */
	constructor(params: TParams)
	{
		this._params = params as Required<TParams>;
	}


	/**
	 * Binds the window which this control.
	 */
	bind(window: Window): void
	{
		this._window = window;
		this.refresh();
	}


	/**
	 * Toggles whether the control is currently active.
	 * @param toggle True if active, or false if disabled.
	 */
	active(toggle: boolean): void
	{
		this._isActive = toggle;

		const widget = this.getWidget();
		widget.isDisabled = !toggle;

		this.refreshWidget(widget);
	}


	/**
	 * Refreshes the widget related to this control.
	 */
	refresh(): void
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
		const name = this._params.name;

		if (!this._window)
			throw new Error(`(${name}) The window is not bound, or gone.`);

		return this._window.findWidget<TWidget>(name);
	}
}
