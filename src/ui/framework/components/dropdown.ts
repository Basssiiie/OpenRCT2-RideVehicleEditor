import type { DisabledMessage, Params } from './parameters';
import Element from './element';


export type DropdownParams = Params<DropdownWidget> & DisabledMessage & 
{ 
	disableOnSingleItem?: boolean 
};


export default class Dropdown extends Element<DropdownParams>
{
	constructor(params: DropdownParams)
	{
		const widget = params as DropdownWidget;
		widget.type = "dropdown";

		super(params);
		if (params.disabledMessage)
		{
			//this.binding<Dropdown>({}) ??
		}
	}
}
