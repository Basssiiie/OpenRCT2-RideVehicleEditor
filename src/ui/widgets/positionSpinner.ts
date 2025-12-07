import { FlexiblePosition, WidgetCreator } from "openrct2-flexui";
import { LabelledSpinnerParams } from "../utilityControls";
import { labelSpinner } from "./labelSpinner";

/**
 * Combines a label and a spinner into one widget creator, with the same tooltip for the location spinners.
 */
export function positionSpinner(params: LabelledSpinnerParams & FlexiblePosition): WidgetCreator<FlexiblePosition>
{
	params.tooltip = "The fantastic map location of your vehicle and where to find it. Only works when the vehicle is not moving.";
	params.minimum = 0;
	params.wrapMode = "clamp";
	params._noDisabledMessage = true;
	return labelSpinner(params);
}
