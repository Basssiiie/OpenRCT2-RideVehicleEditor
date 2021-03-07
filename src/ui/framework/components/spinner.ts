import type { DisabledMessage, Params } from "./parameters";
import Element from "./element";


export type SpinnerParams = Params<SpinnerWidget> & DisabledMessage & 
{ 
	wrapMode?: string, 
	minimum?: number, 
	maximum?: number 
};



export default class Spinner extends Element<SpinnerParams>
{
	constructor(widget: SpinnerParams)
	{
		super(widget);
	}
}
