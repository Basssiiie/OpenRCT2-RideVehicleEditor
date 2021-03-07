import Log from "../../../helpers/logger";
import BindingContext from "./bindingContext";


/**
 * Wrapper for a created widget on an active window.
 */
export default class WidgetBindingContext<TWidget extends WidgetBase> implements BindingContext<TWidget>
{
	private _window: Window | null = null;
	private _widget: TWidget;

	
	/**
	 * Creates a new binding context for the specified widget.
	 * 
	 * @param widget The name of the widget.
	 */
	 constructor(widget: TWidget)
	 {
		 this._widget = widget;
	 }


	/**
	 * Sets the currently active window.
	 * 
	 * @param window The window to bind to, or 'null' if the window has been closed.
	 */
	setWindow(window: Window | null)
	{
		this._window = window;
	}


	/** @inheritdoc */
	setField<TField extends keyof TWidget>(key: keyof TWidget, value: TWidget[TField])
	{
		if (value === undefined || value === null)
		{
			Log.debug(`Value for widget '${this._widget.name}' cannot be '${value}'`);
			return;
		}

		// Update internal widget (in case window is not open)
		this._widget[key] = value;
		
		if (this._window)
		{
			// @ts-expect-error // Widget != WidgetBase for some reason
			const activeWidget = this._window.findWidget<TWidget>(this._widget.name);
			if (!activeWidget)
			{
				Log.error(`Could not find widget '${this._widget.name}' on window '${this._window.classification}'`);
				return;
			}

			activeWidget[key] = value;
		}
	}
}