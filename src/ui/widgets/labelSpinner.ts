/* eslint-disable @stylistic/multiline-comment-style */
import { DropdownSpinnerParams, FlexiblePosition, SpinnerParams, WidgetCreator } from "openrct2-flexui";
import { LabelledSpinnerParams, labelledSpinner } from "../utilityControls";

/**
 * Combines a label and a spinner into one widget creator.
 */
export function labelSpinner<T extends (SpinnerParams | DropdownSpinnerParams) = SpinnerParams>(params: LabelledSpinnerParams<T> & FlexiblePosition): WidgetCreator<FlexiblePosition>
{
	//params.width = controlsSpinnerWidth; // todo
	//params._label.width = controlsLabelWidth;
	return labelledSpinner(params);
}
