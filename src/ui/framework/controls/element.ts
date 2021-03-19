import { Bindings } from "../binder";


// The name of the widget is generated from this id.
let widgetIdUpperBound: number = 0;


// Type that ensures T has the required name.
type WidgetTemplate<T> = Readonly<T>;


/**
 * An element is generally tied to a specific widget in the window. The element part 
 * allows this widget to accept bindings to specified viewmodels.
 */
export default class Element<TWidget extends WidgetBase>
{
	/**
	 * The widget template for this element.
	 */
	get template(): WidgetTemplate<TWidget>
	{
		return this._template;
	}


	protected readonly _template: TWidget

	private _internalBindings?: Bindings<any, TWidget>;


	/**
	 * Create a new element for the specified widget.
	 * 
	 * @param params The parameters for the widget.
	 */
	constructor(params: TWidget)
	{
		if (!params.name)
		{
			params.name = `w[${widgetIdUpperBound.toString(36)}]${params.type}`;
			widgetIdUpperBound++;
		}
		this._template = params as WidgetTemplate<TWidget>;
	}


	/**
	 * Gets all bindings attached to this element, if it has any.
	 */
	get bindings(): Bindings<any, TWidget> | undefined
	{
		return this._internalBindings;
	}


	/**
	 * Bind the specified viewmodel to this element.
	 * 
	 * @param bindings The bindings between the properties on the viewmodel, and the properties 
	 * on the element.
	 * @returns The element itself.
	 */
	bind<TViewModel>(bindings: Bindings<TViewModel, TWidget>)
	{
		if (!this._internalBindings)
		{
			this._internalBindings = bindings;
		}
		else
		{
			this._internalBindings = 
			{ 
				...bindings, // new bindings
				...this._internalBindings, // old overwrites any duplicate new ones
			}
		}
		return this;
	}
}
