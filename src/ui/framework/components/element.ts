import { Bindings } from "../binder";


let widgetIdUpperBound: number = 0;

type Named<T> = T & { name: string };


export default class Element<TWidget extends WidgetBase>
{
	readonly widget: Named<TWidget>;
	readonly bindings: Bindings<unknown, TWidget>[] = [];


	constructor(params: TWidget)
	{
		if (!params.name)
		{
			params.name = `w-${widgetIdUpperBound.toString(36)}`;
			widgetIdUpperBound++;
		}
		this.widget = params as Named<TWidget>;
	}



	binding<TViewModel>(bindings: Bindings<TViewModel, TWidget>)
	{
		this.bindings.push(bindings);
		return this;
	}
}
