import { dropdown, dropdownSpinner, DropdownSpinnerParams, ElementParams, FlexiblePosition, horizontal, label, LabelParams, Scale, spinner, SpinnerParams, twoway, WidgetCreator, WritableStore } from "openrct2-flexui";


/**
 * Creates a small multiplier control that can affect other spinners.
 */
export function multiplier(multiplierIndex: WritableStore<number>): WidgetCreator<FlexiblePosition>
{
	const multiplierTip = "Multiplies all spinner controls by the specified amount";

	return horizontal({
		padding: { left: "1w", top: 9, rest: 6 },
		content: [
			label({
				text: "Multiplier:",
				tooltip: multiplierTip,
				width: 60
			}),
			dropdown({
				tooltip: multiplierTip,
				items: ["x1", "x10", "x100"],
				selectedIndex: twoway(multiplierIndex),
				width: 45
			})
		]
	});
}


/**
 * Parameters for a label-control combination.
 */
export type LabelledControlParams<TParams extends ElementParams = ElementParams> = TParams
	& {
		_control: (params: TParams) => WidgetCreator<FlexiblePosition>;
		_label: { text: string; width?: Scale };
	};

/**
 * A control with a label on the left side.
 */
export function labelled<TParams extends ElementParams>(params: LabelledControlParams<TParams>): WidgetCreator<FlexiblePosition>
{
	const labelParams = <LabelParams>params._label;
	labelParams.disabled = params.disabled;
	labelParams.tooltip = params.tooltip;

	return horizontal([
		label(labelParams),
		params._control(params)
	]);
}


/**
 * Parameters for a label-spinner combination.
 */
export type LabelledSpinnerParams<TParams extends (SpinnerParams | DropdownSpinnerParams) = SpinnerParams> = Omit<LabelledControlParams<TParams>, "_control">
	& {
		_control?: (typeof spinner | typeof dropdownSpinner);
		_noDisabledMessage?: boolean;
	};

/**
 * A spinner with a label on the left side.
 */
export function labelledSpinner<TParams extends (SpinnerParams | DropdownSpinnerParams)>(params: LabelledSpinnerParams<TParams> & FlexiblePosition): WidgetCreator<FlexiblePosition>
{
	params.wrapMode ||= "clampThenWrap";
	params._control ||= spinner;
	if (!params._noDisabledMessage)
	{
		params.disabledMessage ||= "Not available";
	}
	return labelled(<never>params);
}
