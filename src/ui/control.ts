/**
 * Configurable settings for a custom widget.
 */
export interface ControlParams
{
	/**
	 * Internal identifying name of the control.
	 */
	name: string;

	/**
	 * An optional tooltip to show by this control, by hovering over it.
	 * @default undefined
	 */
	tooltip?: string;


	/**
	 * Whether or not the control starts active.
	 * @default true
	 */
	isActive?: boolean;

	x: number;
	y: number;
	width: number;
	height: number;
}


/**
 * Allows a window to be bound to this control. Any related widgets in this
 * window will be updated when the control is updated.
 */
export interface BindableControl
{
	/**
	 * Binds a window which contains one or more widgets from this control.
	 */
	bind(window: Window): void;
}


/**
 * Base class for managing and binding a widget controller to a window.
 */
export default abstract class Control<TParams extends ControlParams> implements BindableControl
{
	/**
	 * Gets the parameters for this control.
	 */
	get params(): Required<TParams>
	{
		return this._params;
	}


	protected _window: (Window | null) = null;
	protected _params: Required<TParams>;


	/**
	 * Create a base control with the specified parameters.
	 * @param params The parameters for the control.
	 */
	constructor(params: TParams)
	{
		params.isActive ??= true;
		this._params = params as Required<TParams>;
	}


	/**
	 * Binds a window which contains one or more widgets from this control.
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
		this._params.isActive = toggle;

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
