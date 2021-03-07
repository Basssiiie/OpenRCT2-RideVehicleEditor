import type { DropdownParams } from "./dropdown";
import type { SpinnerParams } from "./spinner";
import Element from "./element";


export type DropdownSpinnerParams = DropdownParams & SpinnerParams;


export default class DropdownSpinner extends Element<DropdownSpinnerParams>
{
	constructor(params: DropdownSpinnerParams)
	{
		const widget = params as DropdownWidget;
		widget.type = "dropdown";

		super(params);
	}
}
