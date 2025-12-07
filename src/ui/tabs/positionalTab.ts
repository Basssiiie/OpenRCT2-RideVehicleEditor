import { Colour, compute, groupbox, Store, twoway } from "openrct2-flexui";
import { credits } from "../widgets/credits";
import { labelSpinner } from "../widgets/labelSpinner";
import { positionSpinner } from "../widgets/positionSpinner";
import { createAnimatedIcon } from "./icons";
import { Axis, PositionalViewModel } from "../../viewmodels/positionalViewModel";
import { createTab } from "../../viewmodels/tabViewModel";
import { SelectionViewModel } from "../../viewmodels/selectionViewModel";


export function createPositionalTab(selection: SelectionViewModel, positional: PositionalViewModel, multiplier: Store<number>)
{
	// todo temp
	// eslint-disable-next-line @typescript-eslint/prefer-find
	// const offset = objectManager.getAllObjects("ride").filter(o => o.vehicles[0].spriteGroups.slopesLoop?.spriteNumImages)[0].baseImageId;
	// const image = createAnimatedIcon(offset + 4, 710, 2);
	// image.offset = { x: 12, y: 12 };
	// image.primaryColour = Colour.LightBlue;
	// image.secondaryColour = Colour.White;
	// image.tertiaryColour = Colour.SaturatedRed;
	// console.log(offset);

	const image = createAnimatedIcon(29404, 8, 4); // todo g2 name
	image.primaryColour = Colour.Invisible;
	image.offset = { x: 0, y: 1 };

	const formatPosition = positional._formatPosition.bind(positional);

	return createTab( // maybe have this one go through all vehicle sprites? also check what happens with submarine ride lol
		image,
		positional,
		[
			groupbox({
				text: "Positioning",
				content: [
					labelSpinner({
						_label: { text: "Track progress:" },
						tooltip: "Distance in steps of how far the vehicle has progressed along the current track piece",
						disabled: selection._isDisabled,
						step: multiplier,
						value: twoway(positional._trackProgress),
						onChange: (_, incr) => positional._setTrackProgress(incr)
					}),
					labelSpinner({
						_label: { text: "Spacing:" },
						tooltip: "Choose whether either tailgating or social distancing is the best for your vehicle",
						disabled: positional._isSpacingDisabled,
						step: multiplier,
						value: compute(positional._spacing, v => v || 0),
						format: positional._formatSpacing.bind(positional),
						onChange: (_, incr) => positional._setSpacing(incr)
					}),
					positionSpinner({
						_label: { text: "X position:" },
						disabled: positional._isPositionDisabled,
						step: multiplier,
						value: positional._x,
						format: formatPosition,
						onChange: (_, incr) => positional._setAxis(Axis.X, incr)
					}),
					positionSpinner({
						_label: { text: "Y position:" },
						disabled: positional._isPositionDisabled,
						step: multiplier,
						value: positional._y,
						format: formatPosition,
						onChange: (_, incr) => positional._setAxis(Axis.Y, incr)
					}),
					positionSpinner({
						_label: { text: "Z position:" },
						disabled: positional._isPositionDisabled,
						step: multiplier,
						value: positional._z,
						format: formatPosition,
						onChange: (_, incr) => positional._setAxis(Axis.Z, incr)
					}),
					labelSpinner({
						_label: { text: "Spin angle:" },
						minimum: 0,
						maximum: compute(positional._spinFrames, frames => (frames > 0 ? frames - 1 : 0)),
						disabled: positional._isSpinDisabled,
						step: multiplier,
						value: positional._spin,
						onChange: (_, incr) => positional._setSpin(incr)
					})
				]
			}),
			credits()
		]
	);
}
