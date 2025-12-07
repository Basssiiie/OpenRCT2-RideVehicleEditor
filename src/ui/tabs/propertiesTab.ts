import { groupbox, tab } from "openrct2-flexui";
import { CopyFilter } from "../../services/vehicleCopier";
import { setMass, setPoweredAcceleration, setPoweredMaximumSpeed, setSeatCount } from "../../services/vehicleEditor";
import { VehicleViewModel } from "../../viewmodels/vehicleViewModel";
import { credits } from "../widgets/credits";
import { labelSpinner } from "../widgets/labelSpinner";
import { createAnimatedIcon } from "./icons";

export function createPropertiesTab(model: VehicleViewModel)
{
	return tab({
		image: createAnimatedIcon(5229, 8, 4),
		content: [
			groupbox({
				text: "Properties",
				spacing: 3,
				content: [
					labelSpinner({
						_label: { text: "Seats:" },
						tooltip: "Total amount of passengers that can cuddle up in this vehicle",
						minimum: 0,
						maximum: 32, // vehicles refuse more than 32 guests, leaving them stuck just before entering.
						disabled: model._isEditDisabled,
						step: model._multiplier,
						value: model._seats,
						onChange: value => model._modifyVehicle(setSeatCount, value, CopyFilter.Seats)
					}),
					labelSpinner({
						_label: { text: "Mass:" },
						tooltip: "Total amount of mass (weight) of this vehicle, including all its passengers and your mom",
						minimum: 0,
						maximum: 65_535,
						disabled: model._isEditDisabled,
						step: model._multiplier,
						value: model._mass,
						onChange: value => model._modifyVehicle(setMass, value, CopyFilter.Mass)
					}),
					labelSpinner({
						_label: { text: "Acceleration:" },
						tooltip: "Cranks up the engines to accelerate faster, self-powered vehicles only",
						disabledMessage: "Powered vehicles only",
						minimum: 0,
						maximum: 255,
						disabled: model._isUnpowered,
						step: model._multiplier,
						value: model._poweredAcceleration,
						onChange: value => model._modifyVehicle(setPoweredAcceleration, value, CopyFilter.PoweredAcceleration)
					}),
					labelSpinner({
						_label: { text: "Max. speed:" },
						tooltip: "The (il)legal speed limit for your vehicle, self-powered vehicles only",
						disabledMessage: "Powered vehicles only",
						minimum: 1,
						maximum: 255,
						disabled: model._isUnpowered,
						step: model._multiplier,
						value: model._poweredMaxSpeed,
						onChange: value => model._modifyVehicle(setPoweredMaximumSpeed, value, CopyFilter.PoweredMaxSpeed)
					})
				]
			}),
			credits()
		]
	});
}
