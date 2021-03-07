import type { Params } from "./components/parameters";
import Dropdown, { DropdownParams } from "./components/dropdown";
import { SpinnerParams } from "./components/spinner";
import Element from "./components/element";



export default class WidgetBuilder
{
	private readonly _widgets: Widget[] = []
	private readonly _views: Element<WidgetBase>[] = []


	button(params: Params<ButtonWidget>): Element<ButtonWidget>
	{
		const widget = params as ButtonWidget;
		widget.type = "button";
		return this.add(widget);
	}

	
	checkbox(params: Params<CheckboxWidget>): Element<CheckboxWidget>
	{
		const widget = params as CheckboxWidget;
		widget.type = "checkbox";
		return this.add(widget);
	}


	dropdown(params: DropdownParams): Dropdown
	{
		const widget = params as DropdownWidget;
		widget.type = "dropdown";
		this._widgets.push(widget);

		const view = new Dropdown(widget);
		this._views.push(view);
		return view;
	}


	dropdownSpinner(params: any): any
	{
		return params;
	}


	groupbox(params: Params<GroupBoxWidget>): Element<GroupBoxWidget>
	{
		const widget = params as GroupBoxWidget;
		widget.type = "groupbox";
		return this.add(widget);
	}


	label(params: Params<LabelWidget>): Element<LabelWidget>
	{
		const widget = params as LabelWidget;
		widget.type = "label";
		return this.add(widget);
	}


	spinner(params: SpinnerParams): Element<SpinnerWidget>
	{
		const widget = params as SpinnerWidget;
		widget.type = "spinner";
		return this.add(widget);
	}


	viewport(params: Params<ViewportWidget>): Element<ViewportWidget>
	{
		const widget = params as ViewportWidget;
		widget.type = "viewport";
		return this.add(widget);
	}

	
	/**
	 * Add a custom widget to this window.
	 * 
	 * @param params Flat widget parameters for the specified widget.
	 */
	add<TWidget extends Widget>(params: TWidget): Element<TWidget>
	{
		const view = new Element(params);
		this._views.push(view);
		return view;
	}


	build(): Element<WidgetBase>[]
	{
		return this._views;
	}
}