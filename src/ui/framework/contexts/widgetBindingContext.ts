import BindingContext from "./bindingContext";


export default class WidgetBindingContext<TWidget extends WidgetBase> implements BindingContext<TWidget>
{
	private _window: Window | null = null;
	private _widgetName: string;


	constructor(widgetName: string)
	{
		this._widgetName = widgetName;
	}


	setWindow(window: Window | null)
	{
		this._window = window;
	}


	setField<TField extends keyof TWidget>(key: keyof TWidget, value: TWidget[TField]): void
	{
		if (!this._window)
		{
			throw new Error(`Window for widget '${this._widgetName}' gone!`);
		}

		// @ts-expect-error // Widget != WidgetBase for some reason
		const widget = this._window.findWidget<TWidget>(this._widgetName);

		if (!widget)
		{
			throw new Error(`Could not find '${this._widgetName}' on window '${this._window.classification}'!`);
		}

		widget[key] = value;
	}
}