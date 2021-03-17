import type { DisabledMessage, Params } from "./parameters";
import Element from "./element";
import Binder, { Bindings } from "../binder";
import Event from "./event";


export type SpinnerParams = Params<SpinnerWidget> & DisabledMessage & 
{ 
	value?: number;
	wrapMode?: string, 
	minimum?: number, 
	maximum?: number,
	onChange?: (value: number) => void;
};



export default class Spinner extends Element<SpinnerParams>
{
	constructor(params: SpinnerParams)
	{
		const widget = params as SpinnerWidget;
		widget.type = "spinner";

		super(params);

	}


	bind<TViewModel>(bindings: Bindings<TViewModel, SpinnerParams>)
	{
		super.bind(bindings);

		// Custom bindings...
		for (let key in bindings)
		{
			const binding = Binder.getBindingToTarget<SpinnerParams>(bindings[key]);
			if (binding === "onChange")
			{
				// onChange is non-default; wire it up to the increment + decrement events.
				const widget = this.template;
				Event.register<SpinnerParams>(widget, "onIncrement", function(this:Required<SpinnerParams>)
				{
					if (widget.onChange)
					{
						widget.onChange(this.value + 1);
					}
				});
				Event.register<SpinnerParams>(widget, "onDecrement", function(this:Required<SpinnerParams>)
				{
					if (widget.onChange)
					{
						widget.onChange(this.value - 1);
					}
				});
			}
		}
		return this;
	}
}