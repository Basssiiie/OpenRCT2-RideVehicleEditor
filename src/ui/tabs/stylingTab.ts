import { checkbox, CheckboxParams, colourPicker, compute, dropdown, dropdownSpinner, DropdownSpinnerParams, groupbox, horizontal, label, tab, twoway } from "openrct2-flexui";
import { labelled } from "../utilityControls";
import { credits } from "../widgets/credits";
import { labelSpinner } from "../widgets/labelSpinner";
import { createAnimatedIcon } from "./icons";
import { ColourPart, StylingViewModel } from "../../viewmodels/stylingViewModel";
import { SelectionViewModel } from "../../viewmodels/selectionViewModel";

export function createStylingTab(selection: SelectionViewModel, styling: StylingViewModel)
{
	return tab({
		image: createAnimatedIcon(5221, 8, 4),
		content: [
			groupbox({
				text: "Visuals",
				content: [
					dropdown({ // vehicle type editor
						items: styling._rideTypeNames,
						tooltip: "All ride types currently available in the park",
						disabledMessage: "No ride types available",
						disabled: compute(selection._isDisabled, styling._type, (noEdit, type) => (noEdit || !type)),
						autoDisable: "empty",
						selectedIndex: twoway(compute(styling._type, t => (t ? t[1] : 0))),
						onChange: idx => styling._setType(idx)
					}),
					labelSpinner<DropdownSpinnerParams>({
						_label: { text: "Variant:" },
						_control: dropdownSpinner,
						tooltip: "Sprite variant to use from the selected ride type",
						items: styling._variants,
						wrapMode: "wrap",
						disabled: compute(selection._isDisabled, styling._variants, (noEdit, variants) => (noEdit || variants.length < 2)),
						selectedIndex: styling._variant,
						onChange: styling._setVariant.bind(styling)
					}),
					labelled<CheckboxParams>({
						_control: checkbox,
						_label: { text: "Reversed:" },
						tooltip: "Look behind you!",
						disabled: selection._isDisabled,
						isChecked: styling._isReversed,
						onChange: styling._setReversed.bind(styling)
					}),
					horizontal([
						label({
							text: "Colours:",
							tooltip: "The three important boxes that make the vehicle pretty on demand.",
							disabled: selection._isDisabled
						}),
						colourPicker({
							tooltip: "The primary (body) colour of the vehicle.",
							colour: styling._primaryColour,
							disabled: selection._isDisabled,
							onChange: idx => styling._setColour(ColourPart.Primary, idx)
						}),
						colourPicker({
							tooltip: "The secondary (trim) colour of the vehicle.",
							colour: styling._secondaryColour,
							disabled: selection._isDisabled,
							onChange: idx => styling._setColour(ColourPart.Secondary, idx)
						}),
						colourPicker({
							tooltip: "The tertiary (detail) colour of the vehicle.",
							colour: styling._tertiaryColour,
							disabled: selection._isDisabled,
							onChange: idx => styling._setColour(ColourPart.Tertiary, idx)
						})
					])
				]
			}),
			credits()
		]
	});
}

