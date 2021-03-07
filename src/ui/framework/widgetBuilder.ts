import type { Params } from "./components/parameters";
import Dropdown, { DropdownParams } from "./components/dropdown";
import DropdownSpinner, { DropdownSpinnerParams } from "./components/dropdownSpinner";
import Element from "./components/element";
import Spinner, { SpinnerParams } from "./components/spinner";



export default class WidgetBuilder
{
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
		const view = new Dropdown(params);
		this._views.push(view);
		return view;
	}


	dropdownSpinner(params: DropdownSpinnerParams): DropdownSpinner
	{
		const view = new DropdownSpinner(params);
		this._views.push(view);
		return view;
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


	spinner(params: SpinnerParams): Spinner
	{
		const view = new Spinner(params);
		this._views.push(view);
		return view;
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