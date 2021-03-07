import type { DisabledMessage, Params } from "./parameters";
import Element from "./element";
import { Bindings } from "../binder";


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
		return this;
	}
}
