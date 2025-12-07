import { checkbox, CheckboxParams, colourPicker, compute, dropdown, dropdownSpinner, DropdownSpinnerParams, groupbox, horizontal, label, tab, twoway } from "openrct2-flexui";
import { RideType } from "../../objects/rideType";
import { RideVehicleVariant, VehicleVisibility } from "../../objects/rideVehicleVariant";
import { CopyFilter } from "../../services/vehicleCopier";
import { setPrimaryColour, setReversed, setRideType, setSecondaryColour, setTertiaryColour, setVariant } from "../../services/vehicleEditor";
import * as Log from "../../utilities/logger";
import { VehicleViewModel } from "../../viewmodels/vehicleViewModel";
import { labelled } from "../utilityControls";
import { credits } from "../widgets/credits";
import { labelSpinner } from "../widgets/labelSpinner";
import { createAnimatedIcon } from "./icons";

export function createStylingTab(model: VehicleViewModel)
{
	return tab({
		image: createAnimatedIcon(5221, 8, 4),
		content: [
			groupbox({
				text: "Visuals",
				content: [
					dropdown({ // vehicle type editor
						items: compute(model._rideTypes, getUniqueRideTypeNames),
						tooltip: "All ride types currently available in the park",
						disabledMessage: "No ride types available",
						disabled: compute(model._isEditDisabled, model._type, (noEdit, type) => (noEdit || !type)),
						autoDisable: "empty",
						selectedIndex: twoway(compute(model._type, t => (t ? t[1] : 0))),
						onChange: idx => updateVehicleType(model, idx)
					}),
					labelSpinner<DropdownSpinnerParams>({
						_label: { text: "Variant:" },
						_control: dropdownSpinner,
						tooltip: "Sprite variant to use from the selected ride type",
						items: compute(model._variants, c => c.map((v, i) => formatVariant(v, i))),
						wrapMode: "wrap",
						disabled: compute(model._isEditDisabled, model._variants, (noEdit, variants) => (noEdit || variants.length < 2)),
						selectedIndex: model._variant,
						onChange: value => model._modifyVehicle(setVariant, value, CopyFilter.TypeAndVariant)
					}),
					labelled<CheckboxParams>({
						_control: checkbox,
						_label: { text: "Reversed:" },
						tooltip: "Look behind you!",
						disabled: model._isEditDisabled,
						isChecked: model._isReversed,
						onChange: value => model._modifyVehicle(setReversed, value, CopyFilter.TypeAndVariant)
					}),
					horizontal([
						label({
							text: "Colours:",
							tooltip: "The three important boxes that make the vehicle pretty on demand.",
							disabled: model._isEditDisabled
						}),
						colourPicker({
							tooltip: "The primary (body) colour of the vehicle.",
							colour: model._primaryColour,
							disabled: model._isEditDisabled,
							onChange: value => model._modifyVehicle(setPrimaryColour, value, CopyFilter.Colours)
						}),
						colourPicker({
							tooltip: "The secondary (trim) colour of the vehicle.",
							colour: model._secondaryColour,
							disabled: model._isEditDisabled,
							onChange: value => model._modifyVehicle(setSecondaryColour, value, CopyFilter.Colours)
						}),
						colourPicker({
							tooltip: "The tertiary (detail) colour of the vehicle.",
							colour: model._tertiaryColour,
							disabled: model._isEditDisabled,
							onChange: value => model._modifyVehicle(setTertiaryColour, value, CopyFilter.Colours)
						})
					])
				]
			}),
			credits()
		]
	});
}

/**
 * Updates the viewmodel with the new vehicle type.
 */
function updateVehicleType(model: VehicleViewModel, typeIdx: number): void
{
	const type = model._rideTypes.get()[typeIdx];
	model._modifyVehicle(setRideType, type, CopyFilter.TypeAndVariant);
}

/**
 * Format function that labels variants invisible if they are.
 */
function formatVariant(variant: RideVehicleVariant, index: number): string
{
	const visibility = variant._visibility;
	if (visibility === VehicleVisibility.Visible)
	{
		return index.toString();
	}
	const visibilityLabel = (!visibility) ? "green square" : "invisible";
	return (index + "  (" + visibilityLabel + ")");
}


/**
 * Hack: make ride type names unique so they don't get mixed up.
 */
function getUniqueRideTypeNames(rideTypes: RideType[]): string[]
{
	const length = rideTypes.length;
	const array = Array<string>(length);
	let streak: string | undefined;
	let last: string | undefined;
	let current: string | undefined;
	let idx = 0;

	for (; idx < length; idx++)
	{
		current = rideTypes[idx]._object().name;

		if (current === streak)
		{
			last += " "; // Add invisible space to add difference.
		}
		else
		{
			streak = last = current;
		}

		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		array[idx] = last!;
	}

	Log.debug("getUniqueRideTypeNames():", array);
	return array;
}
