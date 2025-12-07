import { Colour, compute, groupbox, tab, twoway } from "openrct2-flexui";
import { getDistanceFromProgress } from "../../services/spacingEditor";
import { CopyFilter } from "../../services/vehicleCopier";
import { changeSpacing, changeTrackProgress, setPositionX, setPositionY, setPositionZ, setSpin } from "../../services/vehicleEditor";
import { VehicleSpan } from "../../services/vehicleSpan";
import { floor } from "../../utilities/math";
import { VehicleViewModel } from "../../viewmodels/vehicleViewModel";
import { credits } from "../widgets/credits";
import { labelSpinner } from "../widgets/labelSpinner";
import { positionSpinner } from "../widgets/positionSpinner";
import { createAnimatedIcon } from "./icons";


export function createPositionalTab(model: VehicleViewModel)
{
	// todo temp
	// eslint-disable-next-line @typescript-eslint/prefer-find
	const offset = objectManager.getAllObjects("ride").filter(o => o.vehicles[0].spriteGroups.slopesLoop?.spriteNumImages)[0].baseImageId;
	const image = createAnimatedIcon(offset + 4, 710, 2);
	image.offset = { x: 12, y: 12 };
	image.primaryColour = Colour.LightBlue;
	image.secondaryColour = Colour.White;
	image.tertiaryColour = Colour.SaturatedRed;
	console.log(offset);

	return tab({ // maybe have this one go through all vehicle sprites? also check what happens with submarine ride lol
		image: image,
		content:
		[
			groupbox({
				text: "Positioning",
				spacing: 3,
				content: [
					labelSpinner({
						_label: { text: "Track progress:" },
						tooltip: "Distance in steps of how far the vehicle has progressed along the current track piece",
						disabled: model._isEditDisabled,
						step: model._multiplier,
						value: twoway(model._trackProgress),
						onChange: (_, incr) => applyTrackProgressChange(model, changeTrackProgress, incr, CopyFilter.TrackProgress)
					}),
					labelSpinner({
						_label: { text: "Spacing:" },
						tooltip: "Choose whether either tailgating or social distancing is the best for your vehicle",
						disabled: compute(model._isEditDisabled, model._selectedVehicle, (noEdit, vehicle) => (noEdit || !vehicle || vehicle[1] === 0)),
						step: model._multiplier,
						value: compute(model._spacing, v => v || 0),
						format: () =>
						{
							const spacing = model._spacing.get();
							return (spacing === null) ? "Too far away" : spacing.toString();
						},
						onChange: (_, incr) => applyTrackProgressChange(model, changeSpacing, incr, CopyFilter.Spacing)
					}),
					positionSpinner({
						_label: { text: "X position:" },
						disabled: model._isPositionDisabled,
						step: model._multiplier,
						value: model._x,
						format: model._formatPosition,
						onChange: (_, incr) => model._modifyVehicle(setPositionX, incr, CopyFilter.Position)
					}),
					positionSpinner({
						_label: { text: "Y position:" },
						disabled: model._isPositionDisabled,
						step: model._multiplier,
						value: model._y,
						format: model._formatPosition,
						onChange: (_, incr) => model._modifyVehicle(setPositionY, incr, CopyFilter.Position)
					}),
					positionSpinner({
						_label: { text: "Z position:" },
						disabled: model._isPositionDisabled,
						step: model._multiplier,
						value: model._z,
						format: model._formatPosition,
						onChange: (_, incr) => model._modifyVehicle(setPositionZ, incr, CopyFilter.Position)
					}),
					labelSpinner({
						_label: { text: "Spin angle:" },
						minimum: 0,
						maximum: compute(model._spinFrames, frames => (frames > 0 ? frames - 1 : 0)),
						disabled: model._isSpinDisabled,
						step: model._multiplier,
						value: compute(model._spin, model._spinFrames, (spin, frames) => floor((spin * frames) / 256)),
						onChange: (_, incr) => model._modifyVehicle(setSpin, floor((incr * 256) / model._spinFrames.get()), CopyFilter.Spin)
					})
				]
			}),
			credits()
		]
	});
}

/**
 * Apply the same amount of track progress to all selected vehicles based on the currently selected car.
 */
function applyTrackProgressChange(model: VehicleViewModel, action: (vehicles: VehicleSpan[], value: number) => void, increment: number, filter: CopyFilter): void
{
	const selectedVehicle = model._selectedVehicle.get();
	if (selectedVehicle)
	{
		const distance = getDistanceFromProgress(selectedVehicle[0]._car(), increment);
		model._modifyVehicle(action, distance, filter);
	}
}
