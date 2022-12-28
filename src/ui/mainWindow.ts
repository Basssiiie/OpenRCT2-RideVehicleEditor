import { button, checkbox, colourPicker, compute, dropdown, dropdownSpinner, FlexiblePosition, groupbox, horizontal, label, LabelParams, SpinnerParams, SpinnerWrapMode, toggle, vertical, viewport, WidgetCreator, window } from "openrct2-flexui";
import { isDevelopment, pluginVersion } from "../environment";
import { applyToTargets, CopyFilter, getTargets, getVehicleSettings } from "../services/vehicleCopier";
import { changeSpacing, changeTrackProgress, setMass, setPositionX, setPositionY, setPositionZ, setPoweredAcceleration, setPoweredMaximumSpeed, setPrimaryColour, setRideType, setSeatCount, setSecondaryColour, setTertiaryColour, setVariant } from "../services/vehicleEditor";
import { locate } from "../services/vehicleLocater";
import { toggleVehiclePicker } from "../services/vehiclePicker";
import { VehicleViewModel } from "../viewmodels/vehicleViewModel";
import { model as rideModel, rideWindow } from "./rideWindow";
import { combinedLabelSpinner } from "./utilityControls";


const model = new VehicleViewModel();
model.selectedRide.subscribe(r => rideModel.ride.set((r) ? r[0] : null));
/*
for (const key in model)
{
	const store = model[<keyof typeof model>key];
	if (isStore(store) && ["mass","trackProgress","variant","x","y","z"].indexOf(key) === -1)
	{
		store.subscribe(v =>
		{
			const json = JSON.stringify(v);
			console.log(`> '${key}' updated to ${(json.length < 95) ? json : (`${json.substring(0, 100)}...`)}`);
		});
	}
}
*/
model.selectedRide.subscribe(v => console.log(`selected ride changed to: ${v}`));
model.selectedTrain.subscribe(v => console.log(`selected train changed to: ${v}`));
model.selectedVehicle.subscribe(v => console.log(`selected vehicle changed to: ${v}`));

const buttonSize = 24;
const controlsWidth = 244;
const controlsLabelWidth = 82;
const controlsSpinnerWidth = 146; // controlsWidth - (controlsLabelWidth + 4 + 12); // include spacing
const clampThenWrapMode: SpinnerWrapMode = "clampThenWrap";

// Tips that are used multiple times
const applyOptionsTip = "Copy the selected vehicle settings to a specific set of other vehicles on this ride.";
const multiplierTip = "Multiplies all spinner controls by the specified amount";

let title = `Ride vehicle editor (v${pluginVersion})`;
if (isDevelopment)
{
	title += " [DEBUG]";
}


export const mainWindow = window({
	title,
	width: 500, minWidth: 465, maxWidth: 560,
	height: 401,
	spacing: 5,
	onOpen: () => model.open(),
	onUpdate: () => model.update(),
	onClose: () => rideWindow.close(),
	content: [
		groupbox([ // selection top bar
			horizontal([
				label({
					text: "Pick a ride:"
				}),
				button({
					text: "Edit ride...",
					tooltip: "Changes properties of the ride, that are not related to its vehicles.",
					width: 100,
					height: 14,
					disabled: model.isEditDisabled,
					onClick: () => rideWindow.open()
				})
			]),
			dropdown({ // ride list
				items: compute(model.rides, c => c.map(r => r.ride().name)),
				tooltip: "List of rides in the park",
				disabledMessage: "No rides in this park",
				autoDisable: "empty",
				selectedIndex: compute(model.selectedRide, r => r ? r[1] : 0),
				onChange: i => model.selectedRide.set([model.rides.get()[i], i]),
			}),
			horizontal([
				dropdownSpinner({ // train list
					items: compute(model.trains, c => c.map((_, i) => `Train ${i + 1}`)),
					tooltip: "List of trains on the currently selected ride",
					disabledMessage: "No trains available",
					autoDisable: "single",
					selectedIndex: compute(model.selectedTrain, t => t ? t[1] : 0),
					onChange: i => model.selectedTrain.set([model.trains.get()[i], i]),
				}),
				dropdownSpinner({ // vehicle list
					items: compute(model.vehicles, c => c.map((_, i) => `Vehicle ${i + 1}`)),
					tooltip: "List of vehicles on the currently selected train",
					disabledMessage: "No vehicles available",
					autoDisable: "single",
					selectedIndex: compute(model.selectedVehicle, v => v ? v[1] : 0),
					onChange: i => model.selectedVehicle.set([model.vehicles.get()[i], i]),
				})
			])
		]),
		horizontal([
			vertical({
				spacing: 8,
				content: [ // toolbar
					horizontal([
						vertical({
							padding: [ "1w", 0 ],
							spacing: 8,
							content: [ // buttons
								toggle({
									width: buttonSize, height: buttonSize,
									tooltip: "Use the picker to select a vehicle by clicking it",
									image: 29467, // SPR_G2_EYEDROPPER
									isPressed: model.isPicking,
									onChange: pressed => toggleVehiclePicker(pressed, c => model.select(c), () => model.isPicking.set(false))
								}),
								toggle({
									width: buttonSize, height: buttonSize,
									tooltip: "Copies the current vehicle settings to your clipboard, so you can use it on another ride",
									image: 29434, // SPR_G2_COPY,
									disabled: model.isEditDisabled,
									isPressed: compute(model.clipboard, clip => !!clip),
									onChange: pressed =>
									{
										const vehicle = model.selectedVehicle.get();
										model.clipboard.set((pressed && vehicle) ? getVehicleSettings(vehicle[0], CopyFilter.All) : null);
									}
								}),
								button({
									width: buttonSize, height: buttonSize,
									tooltip: "Pastes the previously copied vehicle settings over the currently selected vehicle",
									image: 29435, // SPR_G2_PASTE,
									disabled: compute(model.isEditDisabled, model.clipboard, (edit, clip) => edit || !clip),
									onClick: () =>
									{
										const vehicle = model.selectedVehicle.get(), settings = model.clipboard.get();
										if (vehicle && settings)
										{
											applyToTargets(settings, [[ vehicle[0].id, 1 ]]);
										}
									}
								}),
								button({
									width: buttonSize, height: buttonSize,
									tooltip: "Locate your vehicle when you've lost it (again)",
									image: 5167, // SPR_LOCATE,
									disabled: model.isEditDisabled,
									onClick: () =>
									{
										const vehicle = model.selectedVehicle.get();
										if (vehicle)
										{
											locate(vehicle[0]);
										}
									}
								}),
							]
						}),
						viewport({
							tooltip: "I can see my house from here!",
							target: compute(model.selectedVehicle, c => (c) ? c[0].id : null),
							disabled: model.isEditDisabled,
						}),
					]),
					groupbox({
						text: "Apply & synchronize",
						content: [
							horizontal([
								vertical([
									checkbox({
										text: "Type & variant",
										tooltip: "Copy the selected ride type and variant to other vehicles.",
										isChecked: compute(model.copyFilters, f => !!(f & CopyFilter.TypeAndVariant)),
										onChange: c => model.setFilter(CopyFilter.TypeAndVariant, c)
									}),
									checkbox({
										text: "Colours",
										tooltip: "Copy the selected vehicle colours to other vehicles.",
										isChecked: compute(model.copyFilters, f => !!(f & CopyFilter.Colours)),
										onChange: c => model.setFilter(CopyFilter.Colours, c)
									}),
									checkbox({
										text: "Track progress",
										tooltip: "Copy the selected track progress to other vehicles.",
										isChecked: compute(model.copyFilters, f => !!(f & CopyFilter.TrackProgress)),
										onChange: c => model.setFilter(CopyFilter.TrackProgress, c)
									}),
									checkbox({
										text: "Spacing",
										tooltip: "Copy the selected spacing to other vehicles.",
										isChecked: compute(model.copyFilters, f => !!(f & CopyFilter.Spacing)),
										onChange: c => model.setFilter(CopyFilter.Spacing, c)
									}),
								]),
								vertical([
									checkbox({
										text: "Seats",
										tooltip: "Copy the selected seat count to other vehicles.",
										isChecked: compute(model.copyFilters, f => !!(f & CopyFilter.Seats)),
										onChange: c => model.setFilter(CopyFilter.Seats, c)
									}),
									checkbox({
										text: "Mass",
										tooltip: "Copy the selected mass (weight) to other vehicles.",
										isChecked: compute(model.copyFilters, f => !!(f & CopyFilter.Mass)),
										onChange: c => model.setFilter(CopyFilter.Mass, c)
									}),
									checkbox({
										text: "Acceleration",
										tooltip: "Copy the selected powered acceleration to other vehicles.",
										isChecked: compute(model.copyFilters, f => !!(f & CopyFilter.PoweredAcceleration)),
										onChange: c => model.setFilter(CopyFilter.PoweredAcceleration, c)
									}),
									checkbox({
										text: "Max. speed",
										tooltip: "Copy the selected maximum powered speed to other vehicles.",
										isChecked: compute(model.copyFilters, f => !!(f & CopyFilter.PoweredMaxSpeed)),
										onChange: c => model.setFilter(CopyFilter.PoweredMaxSpeed, c)
									}),
								])
							]),
							dropdown({
								items: [
									"All vehicles on this train",
									"Preceding vehicles on this train",
									"Following vehicles on this train",
									"All vehicles on all trains",
									"Preceding vehicles on all trains",
									"Following vehicles on all trains",
									"Same vehicle number on all trains",
								],
								tooltip: applyOptionsTip,
								selectedIndex: model.copyTargetOption,
								onChange: idx => model.copyTargetOption.set(idx)
							}),
							horizontal([
								button({
									text: "Apply",
									tooltip: applyOptionsTip,
									height: buttonSize,
									disabled: model.isEditDisabled,
									onClick: () => applySelectedSettingsToRide()
								}),
								toggle({
									text: "Synchronize",
									tooltip: "Enable this and every change you make, will be made to the other vehicles as well. It's like synchronized swimming!",
									height: buttonSize,
									disabled: model.isEditDisabled,
									isPressed: model.synchronizeTargets,
									onChange: enabled => model.synchronizeTargets.set(enabled)
								})
							])
						]
					})
				]
			}),
			vertical({
				// control part
				width: controlsWidth,
				spacing: 8,
				content: [
					groupbox({
						text: "Visuals",
						content: [
							dropdown({ // vehicle type editor
								items: compute(model.rideTypes, c => c.map(t => t.object().name)),
								tooltip: "All ride types currently available in the park",
								disabledMessage: "No ride types available",
								disabled: model.isEditDisabled,
								autoDisable: "empty",
								selectedIndex: compute(model.type, t => (t) ? t[1] : 0),
								onChange: idx => updateVehicleType(idx)
							}),
							labelSpinner({
								text: "Variant:",
								tooltip: "Sprite variant to use from the selected ride type",
								minimum: 0,
								maximum: model.maximumVariants,
								wrapMode: "wrap",
								disabled: compute(model.isEditDisabled, model.maximumVariants, (noEdit, max) => (noEdit || max < 2)),
								value: model.variant,
								onChange: value => model.modifyVehicle(setVariant, value)
							}),
							horizontal([
								label({
									text: "Colours:",
									tooltip: "The three important boxes that make the vehicle pretty on demand.",
									width: controlsLabelWidth,
									disabled: model.isEditDisabled,
								}),
								colourPicker({
									tooltip: "The primary (body) colour of the vehicle.",
									colour: model.primaryColour,
									disabled: model.isEditDisabled,
									onChange: value => model.modifyVehicle(setPrimaryColour, value)
								}),
								colourPicker({
									tooltip: "The secondary (trim) colour of the vehicle.",
									colour: model.secondaryColour,
									disabled: model.isEditDisabled,
									onChange: value => model.modifyVehicle(setSecondaryColour, value)
								}),
								colourPicker({
									tooltip: "The tertiary (detail) colour of the vehicle.",
									colour: model.tertiaryColour,
									disabled: model.isEditDisabled,
									onChange: value => model.modifyVehicle(setTertiaryColour, value)
								})
							]),
						]
					}),
					groupbox({
						text: "Positioning",
						spacing: 3,
						content: [
							labelSpinner({
								text: "Track progress:",
								tooltip: "Distance in steps of how far the vehicle has progressed along the current track piece",
								minimum: 0,
								disabled: model.isEditDisabled,
								step: model.multiplier,
								value: model.trackProgress,
								onChange: (_, incr) => model.modifyVehicle(changeTrackProgress, incr)
							}),
							labelSpinner({
								text: "Spacing:",
								tooltip: "Choose whether either tailgating or social distancing is the best for your vehicle",
								minimum: 0,
								disabled: compute(model.isEditDisabled, model.selectedVehicle, (noEdit, vehicle) => (noEdit || !vehicle || vehicle[1] === 0)),
								step: model.multiplier,
								value: compute(model.spacing, v => v || 0),
								format: v => (v) ? v.toString() : "Too far away",
								onChange: (_, incr) => model.modifyVehicle(changeSpacing, incr)
							}),
							positionSpinner({
								text: "X position:",
								minimum: 0,
								disabled: model.isPositionDisabled,
								step: model.multiplier,
								value: model.x,
								format: model.formatPosition,
								onChange: value => model.modifyVehicle(setPositionX, value),
							}),
							positionSpinner({
								text: "Y position:",
								minimum: 0,
								disabled: model.isPositionDisabled,
								step: model.multiplier,
								value: model.y,
								format: model.formatPosition,
								onChange: value => model.modifyVehicle(setPositionY, value)
							}),
							positionSpinner({
								text: "Z position:",
								minimum: 0,
								disabled: model.isPositionDisabled,
								step: model.multiplier,
								value: model.z,
								format: model.formatPosition,
								onChange: value => model.modifyVehicle(setPositionZ, value)
							})
						]
					}),
					groupbox({
						text: "Properties",
						spacing: 3,
						content: [
							labelSpinner({
								text: "Seats:",
								tooltip: "Total amount of passengers that can cuddle up in this vehicle",
								minimum: 0,
								maximum: 33, // vehicles refuse more than 32 guests, leaving them stuck just before entering.
								wrapMode: clampThenWrapMode,
								disabled: model.isEditDisabled,
								step: model.multiplier,
								value: model.seats,
								onChange: value => model.modifyVehicle(setSeatCount, value)
							}),
							labelSpinner({
								text: "Mass:",
								tooltip: "Total amount of mass (weight) of this vehicle, including all its passengers and your mom",
								minimum: 0,
								maximum: 65_536,
								wrapMode: clampThenWrapMode,
								disabled: model.isEditDisabled,
								step: model.multiplier,
								value: model.mass,
								onChange: value => model.modifyVehicle(setMass, value)
							}),
							labelSpinner({
								text: "Acceleration:",
								tooltip: "Cranks up the engines to accelerate faster, self-powered vehicles only",
								disabledMessage: "Powered vehicles only",
								minimum: 0,
								maximum: 256,
								wrapMode: clampThenWrapMode,
								disabled: model.isUnpowered,
								step: model.multiplier,
								value: model.poweredAcceleration,
								onChange: value => model.modifyVehicle(setPoweredAcceleration, value)
							}),
							labelSpinner({
								text: "Max. speed:",
								tooltip: "The (il)legal speed limit for your vehicle, self-powered vehicles only",
								disabledMessage: "Powered vehicles only",
								minimum: 0,
								maximum: 256,
								wrapMode: clampThenWrapMode,
								disabled: model.isUnpowered,
								step: model.multiplier,
								value: model.poweredMaxSpeed,
								onChange: value => model.modifyVehicle(setPoweredMaximumSpeed, value)
							})
						]
					}),
					horizontal([
						label({
							text: "Multiplier:",
							tooltip: multiplierTip,
							width: 60,
							padding: { left: "1w" }
						}),
						dropdown({
							tooltip: multiplierTip,
							width: 45,
							padding: { top: -2, right: 6 },
							items: ["x1", "x10", "x100"],
							onChange: idx => model.multiplier.set(10 ** idx),
						})
					])
				]
			})
		]),
		label({ // credits
			height: 11,
			padding: [ 0, 20 ], // do not cover the resize corner
			text: "github.com/Basssiiie/OpenRCT2-RideVehicleEditor",
			tooltip: "Go to this URL to check for the latest updates",
			alignment: "centred",
			disabled: true
		})
	]
});


function updateVehicleType(typeIdx: number): void
{
	const type = model.rideTypes.get()[typeIdx];
	model.modifyVehicle(setRideType, type);
	model.maximumVariants.set(type.variants());
}

function applySelectedSettingsToRide(): void
{
	const vehicle = model.selectedVehicle.get();
	if (vehicle)
	{
		applyToTargets(
			getVehicleSettings(vehicle[0], model.copyFilters.get()),
			getTargets(model.copyTargetOption.get(), model.selectedRide.get(), model.selectedTrain.get(), vehicle)
		);
	}
}

function labelSpinner(params: LabelParams & SpinnerParams): WidgetCreator<FlexiblePosition>
{
	return combinedLabelSpinner(controlsLabelWidth, controlsSpinnerWidth, params);
}

function positionSpinner(params: LabelParams & SpinnerParams): WidgetCreator<FlexiblePosition>
{
	params.tooltip = "The fantastic map location of your vehicle and where to find it. Only works when the vehicle is not moving.";
	return combinedLabelSpinner(controlsLabelWidth, controlsSpinnerWidth, params, false);
}