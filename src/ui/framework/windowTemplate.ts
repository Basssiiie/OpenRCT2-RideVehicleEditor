import Element from "./components/element";
import WidgetBuilder from "./widgetBuilder";


/**
 * Parameters available for creating windows.
 */
type WindowParams = Omit<WindowDesc, "classification" | "id" | "widgets" | "tabs" | "tabIndex"> &
{
	onlyOneInstance?: boolean;
};


/**
 * Creates a unique window id.
 */
export function createUniqueId()
{
	return `bui-${(Math.random() * Number.MAX_SAFE_INTEGER).toString(36)}`;
}


/**
 * A template of a window that adheres to its model and allows binding 
 * to its widgets.
 */
export default class WindowTemplate<TDescription>
{
	readonly id = createUniqueId();
	readonly params: WindowParams;
	readonly description: TDescription;


	private readonly _elements: Element<WidgetBase>[] = [];


	/**
	 * Creates a new template that can be used to create windows.
	 * 
	 * @param params The generic parameters for the window.
	 * @param widgets A builder function that helps constructing all the widgets.
	 */
	constructor(params: WindowParams, widgets: (builder: WidgetBuilder) => TDescription)
	{
		this.params = params;
		
		// Build all selected widgets...
		const builder = new WidgetBuilder();
		this.description = widgets(builder);
		const views = builder.build();

		const allWidgets: WidgetBase[] = [];
		for (let view of views)
		{
			allWidgets.push(view.widget);
			this._elements.push(view);
		}

		// Finish up params...
		const widgetParams = params as WindowDesc;
		widgetParams.widgets = allWidgets as Widget[];
	}


	/**
	 * Get all elements on this window, including the ones without bindings.
	 */
	getElements(): readonly Element<WidgetBase>[]
	{
		return this._elements;
	}
}



