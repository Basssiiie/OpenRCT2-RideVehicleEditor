/* eslint-disable @typescript-eslint/no-empty-function */
import { box, button, compute, dropdown, dropdownButton, dropdownSpinner, FlexibleLayoutContainer, FlexiblePosition, horizontal, isStore, label, LabelParams, spinner, SpinnerParams, toggle, vertical, viewport, WidgetCreator, window } from "openrct2-flexui";
import { isDevelopment, pluginVersion } from "../environment";
import { RideVehicle } from "../objects/rideVehicle";
import { ViewModel } from "../objects/viewModel";
import { changeTrackProgress, setMass, setPoweredAcceleration, setPoweredMaximumSpeed, setRideType, setSeatCount, setVariant } from "../services/editor";
import * as Log from "../utilities/logger";


const model = new ViewModel();
for (const key in model)
{
	const store = model[<keyof typeof model>key];
	if (isStore(store) && ["mass","trackProgress","variant"].indexOf(key) === -1)
	{
		store.subscribe(v => console.log(`> '${key}' updated to: ${JSON.stringify(v)}`));
	}
}


const buttonSize = 24;

let title = `Ride vehicle editor (v${pluginVersion})`;
if (isDevelopment)
{
	title += " [DEBUG]";
}


export const editorWindow = window({
	title,
	width: 375, minWidth: 375, maxWidth: 500,
	height: 245, minHeight: 245, maxHeight: 280,
	spacing: 5,
	onOpen: () => model.reload(),
	onUpdate: () => model.update(),
	content: [
		box(
			vertical([ // selection top bar
				label({
					text: "Pick a ride:"
				}),
				dropdown({ // ride list
					items: compute(model.rides, c => c.map(r => r.ride().name)),
					tooltip: "List of rides in the park",
					disabledMessage: "No rides in this park",
					autoDisable: "empty",
					onChange: i => model.selectedRide.set([model.rides.get()[i], i]),
				}),
				horizontal([
					dropdownSpinner({ // train list
						items: compute(model.trains, c => c.map((_, i) => `Train ${i + 1}`)),
						tooltip: "List of trains on the currently selected ride",
						disabledMessage: "No trains available",
						autoDisable: "single",
						onChange: i => model.selectedTrain.set([model.trains.get()[i], i]),
					}),
					dropdownSpinner({ // vehicle list
						items: compute(model.vehicles, c => c.map((_, i) => `Vehicle ${i + 1}`)),
						tooltip: "List of vehicles on the currently selected train",
						disabledMessage: "No vehicles available",
						autoDisable: "single",
						onChange: i => model.selectedVehicle.set([model.vehicles.get()[i], i]),
					})
				])
			])
		),
		horizontal([
			vertical({
				spacing: 8,
				content: [ // toolbar
					viewport({
						target: compute(model.selectedVehicle, c => (c) ? c[0].id : null),
						disabled: model.isEditDisabled,
					}),
					horizontal({
						padding: [ 0, "1w" ],
						spacing: 1,
						content: [ // buttons
							button({
								width: buttonSize, height: buttonSize,
								tooltip: "Locate your vehicle when you've lost it (again)",
								image: 5167, // SPR_LOCATE,
								disabled: model.isEditDisabled,
							}),
							button({
								width: buttonSize, height: buttonSize,
								tooltip: "Use the picker to select a vehicle by clicking it",
								image: 29467, // SPR_G2_EYEDROPPER
							}),
							toggle({
								width: buttonSize, height: buttonSize,
								tooltip: "Copies the current vehicle settings to your clipboard",
								image: 29434, // SPR_G2_COPY,
								disabled: model.isEditDisabled,
							}),
							button({
								width: buttonSize, height: buttonSize,
								tooltip: "Pastes the previously copied vehicle settings over the currently selected vehicle",
								image: 29435, // SPR_G2_PASTE,
								disabled: model.isEditDisabled,
							}),
						]
					})
				]
			}),
			vertical({
				// control part
				width: 260,
				spacing: 3,
				content: [
					dropdown({ // vehicle type editor
						items: compute(model.rideTypes, c => c.map(t => t.object().name)),
						tooltip: "All ride types currently available in the park",
						disabledMessage: "No ride types available",
						disabled: model.isEditDisabled,
						autoDisable: "empty",
						selectedIndex: compute(model.type, t => (t) ? t[1] : 0),
						onChange: idx => modifyVehicle(setRideType, model.rideTypes.get()[idx])
					}),
					labelledSpinner({
						text: "Variant:",
						tooltip: "Sprite variant to use from the selected ride type",
						maximum: compute(model.type, c => (c) ? c[0].variants() : 4),
						wrapMode: "wrap",
						disabled: model.isEditDisabled,
						value: model.variant,
						onChange: value => modifyVehicle(setVariant, value)
					}),
					labelledSpinner({
						text: "Seats:",
						tooltip: "Total amount of passengers that can cuddle up in this vehicle",
						maximum: 33, // vehicles refuse more than 32 guests, leaving them stuck just before entering.
						disabled: model.isEditDisabled,
						step: model.multiplier,
						value: model.seats,
						onChange: value => modifyVehicle(setSeatCount, value)
					}),
					labelledSpinner({
						text: "Mass:",
						tooltip: "Total amount of mass (weight) of this vehicle, including all its passengers and your mom",
						maximum: 65_536,
						disabled: model.isEditDisabled,
						step: model.multiplier,
						value: model.mass,
						onChange: value => modifyVehicle(setMass, value)
					}),
					labelledSpinner({
						text: "Acceleration:",
						tooltip: "Cranks up the engines to accelerate faster, self-powered vehicles only",
						disabledMessage: "Only on powered vehicles",
						maximum: 256,
						disabled: model.isUnpowered,
						step: model.multiplier,
						value: model.poweredAcceleration,
						onChange: value => modifyVehicle(setPoweredAcceleration, value)
					}),
					labelledSpinner({
						text: "Max. speed:",
						tooltip: "The (il)legal speed limit for your vehicle, self-powered vehicles only",
						disabledMessage: "Only on powered vehicles",
						maximum: 256,
						disabled: model.isUnpowered,
						step: model.multiplier,
						value: model.poweredMaxSpeed,
						onChange: value => modifyVehicle(setPoweredMaximumSpeed, value)
					}),
					labelledSpinner({
						text: "Track progress:",
						tooltip: "Distance in steps of how far the vehicle has progressed along the current track piece",
						maximum: 1,
						disabled: model.isEditDisabled,
						step: model.multiplier,
						value: model.trackProgress,
						onChange: (_, incr) => modifyVehicle(changeTrackProgress, incr)
					}),
					horizontal([
						dropdownButton({
							buttons: [
								{ text: "Apply to all vehicles", onClick: (): void => {} },
								{ text: "Apply to preceding vehicles", onClick: (): void => {} },
								{ text: "Apply to following vehicles", onClick: (): void => {} },
								{ text: "Apply to all vehicles on all trains", onClick: (): void => {} },
								{ text: "Apply to preceding vehicles on all trains", onClick: (): void => {} },
								{ text: "Apply to following vehicles on all trains", onClick: (): void => {} },
								{ text: "Apply to same vehicle on all trains", onClick: (): void => {} }
							],
							tooltip: "Apply the current vehicle settings to a specific set of other vehicles on this ride",
						}),
						dropdown({
							width: 45,
							items: ["x1", "x10", "x100"],
							tooltip: "Multiplies all spinner controls by the specified amount",
							onChange: idx => model.multiplier.set(10 ** idx),
						})
					])
				]
			})
		]),
		label({ // credits
			padding: [ 0, 15 ], // do not cover the resize corner
			text: "github.com/Basssiiie/OpenRCT2-RideVehicleEditor",
			tooltip: "Go to this URL to check for the latest updates",
			alignment: "centred",
			disabled: true
		})
	]
});


function labelledSpinner(params: LabelParams & SpinnerParams): WidgetCreator<FlexibleLayoutContainer & FlexiblePosition>
{
	(<FlexiblePosition>params).width = "65%";
	params.disabledMessage ||= "Not available";
	params.wrapMode ||= "clampThenWrap";

	return horizontal([
		label({
			width: "35%",
			disabled: params.disabled,
			text: params.text,
			tooltip: params.tooltip
		}),
		spinner(params)
	]);
}


function modifyVehicle<T>(action: (vehicle: RideVehicle, value: T) => void, value: T): void
{
	const vehicle = model.selectedVehicle.get();
	if (vehicle)
	{
		action(vehicle[0], value);
	}
	else
	{
		Log.debug(`Failed to modify vehicle with '${action}' to '${value}'; none is selected.`);
	}
}
