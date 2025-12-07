import { groupbox, Store } from "openrct2-flexui";
import { credits } from "../widgets/credits";
import { labelSpinner } from "../widgets/labelSpinner";
import { createAnimatedIcon } from "./icons";
import { PropertiesViewModel } from "../../viewmodels/propertiesViewModel";
import { createTab } from "../../viewmodels/tabViewModel";
import { SelectionViewModel } from "../../viewmodels/selectionViewModel";

export function createPropertiesTab(selection: SelectionViewModel, properties: PropertiesViewModel, multiplier: Store<number>)
{
	return createTab(
		createAnimatedIcon(5229, 8, 4),
		properties,
		[
			groupbox({
				text: "Properties",
				//spacing: 3,
				content: [
					labelSpinner({
						_label: { text: "Seats:" },
						tooltip: "Total amount of passengers that can cuddle up in this vehicle",
						minimum: 0,
						maximum: 32, // vehicles refuse more than 32 guests, leaving them stuck just before entering.
						disabled: selection._isDisabled,
						step: multiplier,
						value: properties._seats,
						onChange: properties._setSeats.bind(properties)
					}),
					labelSpinner({
						_label: { text: "Mass:" },
						tooltip: "Total amount of mass (weight) of this vehicle, including all its passengers and your mom",
						minimum: 0,
						maximum: 65_535,
						disabled: selection._isDisabled,
						step: multiplier,
						value: properties._mass,
						onChange: properties._setMass.bind(properties)
					}),
					labelSpinner({
						_label: { text: "Acceleration:" },
						tooltip: "Cranks up the engines to accelerate faster, self-powered vehicles only",
						disabledMessage: "Powered vehicles only",
						minimum: 0,
						maximum: 255,
						disabled: properties._isUnpowered,
						step: multiplier,
						value: properties._poweredAcceleration,
						onChange: properties._setPoweredAcceleration.bind(properties)
					}),
					labelSpinner({
						_label: { text: "Max. speed:" },
						tooltip: "The (il)legal speed limit for your vehicle, self-powered vehicles only",
						disabledMessage: "Powered vehicles only",
						minimum: 1,
						maximum: 255,
						disabled: properties._isUnpowered,
						step: multiplier,
						value: properties._poweredMaxSpeed,
						onChange: properties._setPoweredMaxSpeed.bind(properties)
					})
				]
			}),
			credits()
		]
	);
}
