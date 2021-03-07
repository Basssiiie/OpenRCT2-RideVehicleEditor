import type { DisabledMessage, Params } from './parameters';
import Element from './element';


export type DropdownParams = Params<DropdownWidget> & DisabledMessage & 
{ 
	disableOnSingleItem?: boolean 
};


export default class Dropdown extends Element<DropdownParams>
{
	constructor(widget: DropdownParams)
	{
		super(widget);
		if (widget.disabledMessage)
		{
			//this.binding<Dropdown>({}) ??
		}
	}
}
