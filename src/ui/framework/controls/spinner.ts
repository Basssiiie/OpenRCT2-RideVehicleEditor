import type { DisabledMessage, Params } from "./parameters";
import Element from "./element";
import Binder, { Bindings } from "../binder";
import Event from "../event";
import Log from "../../../helpers/logger";


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

		Event.register<SpinnerParams>(widget, "onChange", function(this:Required<SpinnerParams>)
		{
			Log.debug(`Update text to value ${this.value}`);
			this.text = this.value.toString();
		});

		super(params);

	}


	bind<TViewModel>(bindings: Bindings<TViewModel, SpinnerParams>)
	{
		super.bind(bindings);

		// Custom bindings...
		for (let key in bindings)
		{
			const binding = Binder.getBindingToTarget<SpinnerParams>(bindings[key]);
			const widget = this.template as SpinnerParams;

			switch (binding)
			{
				case "value":
					Event.register<SpinnerParams>(widget, "onChange", function(this:Required<SpinnerParams>)
					{
						this.text = this.value.toString();
					});
					break;

				case "onChange":
					// onChange is non-default; wire it up to the increment + decrement events.
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
					break;
			}
		}
		return this;
	}
}