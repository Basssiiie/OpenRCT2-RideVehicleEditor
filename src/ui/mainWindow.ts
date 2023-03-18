import { button, checkbox, colourPicker, compute, dropdown, dropdownSpinner, DropdownSpinnerParams, FlexiblePosition, groupbox, horizontal, label, SpinnerParams, SpinnerWrapMode, toggle, vertical, viewport, WidgetCreator, window } from "openrct2-flexui";
import { isDevelopment, pluginVersion } from "../environment";
import { RideVehicleVariant, VehicleVisibility } from "../objects/rideVehicleVariant";
import { invoke, refreshRide } from "../services/events";
import { applyToTargets, CopyFilter, getTargets, getVehicleSettings } from "../services/vehicleCopier";
import { dragToolId, toggleVehicleDragger } from "../services/vehicleDragger";
import { changeSpacing, changeTrackProgress, setMass, setPositionX, setPositionY, setPositionZ, setPoweredAcceleration, setPoweredMaximumSpeed, setPrimaryColour, setRideType, setSeatCount, setSecondaryColour, setTertiaryColour, setVariant } from "../services/vehicleEditor";
import { locate } from "../services/vehicleLocater";
import { pickerToolId, toggleVehiclePicker } from "../services/vehiclePicker";
import { cancelTools } from "../utilities/tools";
import { VehicleViewModel } from "../viewmodels/vehicleViewModel";
import { model as rideModel, rideWindow } from "./rideWindow";
import { labelledSpinner, LabelledSpinnerParams, multiplier } from "./utilityControls";
import * as Log from "../utilities/logger";


const model = new VehicleViewModel();
const buttonSize = 24;
const controlsWidth = 244;
const controlsLabelWidth = 82;
const controlsSpinnerWidth = controlsWidth - (controlsLabelWidth + 4 + 12); // include spacing
const clampThenWrapMode: SpinnerWrapMode = "clampThenWrap";

// Tips that are used multiple times
const applyOptionsTip = "Copy the selected vehicle settings to a specific set of other vehicles on this ride.";

let title = ("Ride vehicle editor (v" + pluginVersion + ")");
if (isDevelopment)
{
	title += " [DEBUG]";
}
model._selectedRide.subscribe(r =>
{
	rideModel._ride.set((r) ? r[0] : null);
	rideWindow.focus();
});


export const mainWindow = window({
	title,
	width: 500, minWidth: 465, maxWidth: 560,
	height: 389,
	spacing: 5,
	onOpen: () => model._open(),
	onClose: () =>
	{
		cancelTools(pickerToolId, dragToolId);
		rideWindow.close();
		model._close();
	},
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
					disabled: model._isEditDisabled,
					onClick: () =>
					{
						const ride = model._selectedRide.get();
						if (ride)
						{
							rideWindow.open();
							invoke(refreshRide, ride[0]._id);
						}
					}
				})
			]),
			horizontal([
				dropdownSpinner({ // ride list
					items: compute(model._rides, c => c.map(r => r._ride().name)),
					tooltip: "List of rides in the park",
					disabledMessage: "No rides in this park",
					autoDisable: "empty",
					selectedIndex: compute(model._selectedRide, r => r ? r[1] : 0),
					onChange: idx => model._selectedRide.set([model._rides.get()[idx], idx]),
				}),
				dropdownSpinner({ // train list
					items: compute(model._trains, c => c.map((t, i) => ("Train " + (t._special ? "?" : (i + 1))))),
					width: "30%",
					tooltip: "List of trains on the currently selected ride",
					disabledMessage: "No trains available",
					autoDisable: "single",
					selectedIndex: compute(model._selectedTrain, t => t ? t[1] : 0),
					onChange: idx => model._selectedTrain.set([model._trains.get()[idx], idx]),
				}),
				dropdownSpinner({ // vehicle list
					items: compute(model._vehicles, c => c.map((_, i) => ("Vehicle " + (i + 1)))),
					width: "30%",
					tooltip: "List of vehicles on the currently selected train",
					disabledMessage: "No vehicles available",
					autoDisable: "single",
					selectedIndex: compute(model._selectedVehicle, v => v ? v[1] : 0),
					onChange: idx => model._selectedVehicle.set([model._vehicles.get()[idx], idx]),
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
							spacing: 6,
							content: [ // buttons
								toggle({
									width: buttonSize, height: buttonSize,
									tooltip: "Use the picker to select a vehicle by clicking it",
									image: "eyedropper", // SPR_G2_EYEDROPPER
									isPressed: model._isPicking,
									onChange: pressed => toggleVehiclePicker(pressed, c => model._select(c), () => model._isPicking.set(false))
								}),
								toggle({
									width: buttonSize, height: buttonSize,
									tooltip: "Drag stationary vehicles to new places on the map",
									image: 5174, // SPR_PICKUP_BTN
									isPressed: model._isDragging,
									disabled: model._isPositionDisabled,
									onChange: pressed => toggleVehicleDragger(pressed, model._selectedVehicle, model._x, model._y, model._z, () => model._isDragging.set(false))
								}),
								toggle({
									width: buttonSize, height: buttonSize,
									tooltip: "Copies the current vehicle settings to your clipboard, so you can use it on another ride",
									image: "copy", // SPR_G2_COPY,
									disabled: model._isEditDisabled,
									isPressed: compute(model._clipboard, clip => !!clip),
									onChange: pressed =>
									{
										const vehicle = model._selectedVehicle.get();
										model._clipboard.set((pressed && vehicle) ? getVehicleSettings(vehicle[0], CopyFilter.All) : null);
									}
								}),
								button({
									width: buttonSize, height: buttonSize,
									tooltip: "Pastes the previously copied vehicle settings over the currently selected vehicle",
									image: "paste", // SPR_G2_PASTE,
									disabled: compute(model._isEditDisabled, model._clipboard, (edit, clip) => edit || !clip),
									onClick: () =>
									{
										const vehicle = model._selectedVehicle.get(), settings = model._clipboard.get();
										if (vehicle && settings)
										{
											applyToTargets(settings, [[ vehicle[0]._id, 1 ]]);
										}
									}
								}),
								button({
									width: buttonSize, height: buttonSize,
									tooltip: "Locate your vehicle when you've lost it (again)",
									image: 5167, // SPR_LOCATE,
									disabled: model._isEditDisabled,
									onClick: () =>
									{
										const vehicle = model._selectedVehicle.get();
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
							target: compute(model._selectedVehicle, c => (c) ? c[0]._id : null),
							disabled: model._isEditDisabled,
						}),
					]),
					groupbox({
						text: "Apply & synchronize",
						spacing: 7,
						content: [
							horizontal([
								vertical([
									checkbox({
										text: "Type & variant",
										tooltip: "Copy the selected ride type and variant to other vehicles.",
										isChecked: compute(model._copyFilters, f => !!(f & CopyFilter.TypeAndVariant)),
										onChange: c => model._setFilter(CopyFilter.TypeAndVariant, c)
									}),
									checkbox({
										text: "Colours",
										tooltip: "Copy the selected vehicle colours to other vehicles.",
										isChecked: compute(model._copyFilters, f => !!(f & CopyFilter.Colours)),
										onChange: c => model._setFilter(CopyFilter.Colours, c)
									}),
									checkbox({
										text: "Track progress",
										tooltip: "Copy the selected track progress to other vehicles.",
										isChecked: compute(model._copyFilters, f => !!(f & CopyFilter.TrackProgress)),
										onChange: c => model._setFilter(CopyFilter.TrackProgress, c)
									}),
									checkbox({
										text: "Spacing",
										tooltip: "Copy the selected spacing to other vehicles.",
										isChecked: compute(model._copyFilters, f => !!(f & CopyFilter.Spacing)),
										onChange: c => model._setFilter(CopyFilter.Spacing, c)
									}),
								]),
								vertical([
									checkbox({
										text: "Seats",
										tooltip: "Copy the selected seat count to other vehicles.",
										isChecked: compute(model._copyFilters, f => !!(f & CopyFilter.Seats)),
										onChange: c => model._setFilter(CopyFilter.Seats, c)
									}),
									checkbox({
										text: "Mass",
										tooltip: "Copy the selected mass (weight) to other vehicles.",
										isChecked: compute(model._copyFilters, f => !!(f & CopyFilter.Mass)),
										onChange: c => model._setFilter(CopyFilter.Mass, c)
									}),
									checkbox({
										text: "Acceleration",
										tooltip: "Copy the selected powered acceleration to other vehicles.",
										isChecked: compute(model._copyFilters, f => !!(f & CopyFilter.PoweredAcceleration)),
										onChange: c => model._setFilter(CopyFilter.PoweredAcceleration, c)
									}),
									checkbox({
										text: "Max. speed",
										tooltip: "Copy the selected maximum powered speed to other vehicles.",
										isChecked: compute(model._copyFilters, f => !!(f & CopyFilter.PoweredMaxSpeed)),
										onChange: c => model._setFilter(CopyFilter.PoweredMaxSpeed, c)
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
								selectedIndex: model._copyTargetOption,
								onChange: idx => model._copyTargetOption.set(idx)
							}),
							horizontal([
								button({
									text: "Apply",
									tooltip: applyOptionsTip,
									height: buttonSize,
									disabled: model._isEditDisabled,
									onClick: () => applySelectedSettingsToRide()
								}),
								toggle({
									text: "Synchronize",
									tooltip: "Enable this and every change you make, will be made to the other vehicles as well. It's like synchronized swimming!",
									height: buttonSize,
									disabled: model._isEditDisabled,
									isPressed: model._synchronizeTargets,
									onChange: enabled => model._synchronizeTargets.set(enabled)
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
								items: compute(model._rideTypes, c => c.map(t => t._object().name)),
								tooltip: "All ride types currently available in the park",
								disabledMessage: "No ride types available",
								disabled: compute(model._isEditDisabled, model._type, (noEdit, type) => (noEdit || !type)),
								autoDisable: "empty",
								selectedIndex: compute(model._type, t => (t) ? t[1] : 0),
								onChange: idx => updateVehicleType(idx)
							}),
							labelSpinner<DropdownSpinnerParams>({
								_label: { text: "Variant:" },
								_control: dropdownSpinner,
								tooltip: "Sprite variant to use from the selected ride type",
								items: compute(model._variants, c => c.map((v, i) => formatVariant(v, i))),
								wrapMode: "wrap",
								disabled: compute(model._isEditDisabled, model._variants, (noEdit, variants) => (noEdit || variants.length < 2)),
								selectedIndex: model._variant,
								onChange: value => model._modifyVehicle(setVariant, value),
							}),
							horizontal([
								label({
									text: "Colours:",
									tooltip: "The three important boxes that make the vehicle pretty on demand.",
									width: controlsLabelWidth,
									disabled: model._isEditDisabled,
								}),
								colourPicker({
									tooltip: "The primary (body) colour of the vehicle.",
									colour: model._primaryColour,
									disabled: model._isEditDisabled,
									onChange: value => model._modifyVehicle(setPrimaryColour, value)
								}),
								colourPicker({
									tooltip: "The secondary (trim) colour of the vehicle.",
									colour: model._secondaryColour,
									disabled: model._isEditDisabled,
									onChange: value => model._modifyVehicle(setSecondaryColour, value)
								}),
								colourPicker({
									tooltip: "The tertiary (detail) colour of the vehicle.",
									colour: model._tertiaryColour,
									disabled: model._isEditDisabled,
									onChange: value => model._modifyVehicle(setTertiaryColour, value)
								})
							]),
						]
					}),
					groupbox({
						text: "Positioning",
						spacing: 3,
						content: [
							labelSpinner({
								_label: { text: "Track progress:" },
								tooltip: "Distance in steps of how far the vehicle has progressed along the current track piece",
								minimum: 0,
								disabled: model._isEditDisabled,
								step: model._multiplier,
								value: model._trackProgress,
								onChange: (_, incr) => model._modifyVehicle(changeTrackProgress, incr)
							}),
							labelSpinner({
								_label: { text: "Spacing:" },
								tooltip: "Choose whether either tailgating or social distancing is the best for your vehicle",
								minimum: 0,
								disabled: compute(model._isEditDisabled, model._selectedVehicle, (noEdit, vehicle) => (noEdit || !vehicle || vehicle[1] === 0)),
								step: model._multiplier,
								value: compute(model._spacing, v => v || 0),
								format: (v: number) => (v > 0) ? v.toString() : "Too far away",
								onChange: (_, incr) => model._modifyVehicle(changeSpacing, incr)
							}),
							positionSpinner({
								_label: { text: "X position:" },
								minimum: 0,
								disabled: model._isPositionDisabled,
								step: model._multiplier,
								value: model._x,
								format: model._formatPosition,
								onChange: (_, incr) => model._modifyVehicle(setPositionX, incr),
							}),
							positionSpinner({
								_label: { text: "Y position:" },
								minimum: 0,
								disabled: model._isPositionDisabled,
								step: model._multiplier,
								value: model._y,
								format: model._formatPosition,
								onChange: (_, incr) => model._modifyVehicle(setPositionY, incr)
							}),
							positionSpinner({
								_label: { text: "Z position:" },
								minimum: 0,
								disabled: model._isPositionDisabled,
								step: model._multiplier,
								value: model._z,
								format: model._formatPosition,
								onChange: (_, incr) => model._modifyVehicle(setPositionZ, incr)
							})
						]
					}),
					groupbox({
						text: "Properties",
						spacing: 3,
						content: [
							labelSpinner({
								_label: { text: "Seats:" },
								tooltip: "Total amount of passengers that can cuddle up in this vehicle",
								minimum: 0,
								maximum: 32, // vehicles refuse more than 32 guests, leaving them stuck just before entering.
								wrapMode: clampThenWrapMode,
								disabled: model._isEditDisabled,
								step: model._multiplier,
								value: model._seats,
								onChange: value => model._modifyVehicle(setSeatCount, value)
							}),
							labelSpinner({
								_label: { text: "Mass:" },
								tooltip: "Total amount of mass (weight) of this vehicle, including all its passengers and your mom",
								minimum: 0,
								maximum: 65_535,
								wrapMode: clampThenWrapMode,
								disabled: model._isEditDisabled,
								step: model._multiplier,
								value: model._mass,
								onChange: value => model._modifyVehicle(setMass, value)
							}),
							labelSpinner({
								_label: { text: "Acceleration:" },
								tooltip: "Cranks up the engines to accelerate faster, self-powered vehicles only",
								disabledMessage: "Powered vehicles only",
								minimum: 0,
								maximum: 255,
								wrapMode: clampThenWrapMode,
								disabled: model._isUnpowered,
								step: model._multiplier,
								value: model._poweredAcceleration,
								onChange: value => model._modifyVehicle(setPoweredAcceleration, value)
							}),
							labelSpinner({
								_label: { text: "Max. speed:" },
								tooltip: "The (il)legal speed limit for your vehicle, self-powered vehicles only",
								disabledMessage: "Powered vehicles only",
								minimum: 1,
								maximum: 255,
								wrapMode: clampThenWrapMode,
								disabled: model._isUnpowered,
								step: model._multiplier,
								value: model._poweredMaxSpeed,
								onChange: value => model._modifyVehicle(setPoweredMaximumSpeed, value)
							})
						]
					}),
					multiplier(model._multiplierIndex)
				]
			})
		]),
		label({ // credits
			padding: [ -1, 20, 0, 20 ], // do not cover the resize corner
			text: "github.com/Basssiiie/OpenRCT2-RideVehicleEditor",
			tooltip: "Go to this URL to check for the latest updates",
			alignment: "centred",
			disabled: true
		})
	]
});


/**
 * Updates the viewmodel with the new vehicle type.
 */
function updateVehicleType(typeIdx: number): void
{
	const type = model._rideTypes.get()[typeIdx];
	model._modifyVehicle(setRideType, type);
}

/**
 * Apply settings of current vehicle to other vehicles in the ride.
 */
function applySelectedSettingsToRide(): void
{
	const vehicle = model._selectedVehicle.get();
	if (vehicle)
	{
		applyToTargets(
			getVehicleSettings(vehicle[0], model._copyFilters.get()),
			getTargets(model._copyTargetOption.get(), model._selectedRide.get(), model._selectedTrain.get(), vehicle)
		);
	}
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
 * Combines a label and a spinner into one widget creator.
 */
function labelSpinner<T extends (SpinnerParams | DropdownSpinnerParams) = SpinnerParams>(params: LabelledSpinnerParams<T> & FlexiblePosition): WidgetCreator<FlexiblePosition>
{
	params.width = controlsSpinnerWidth;
	params._label.width = controlsLabelWidth;
	return labelledSpinner(params);
}

/**
 * Combines a label and a spinner into one widget creator, with the same tooltip for the location spinners.
 */
function positionSpinner(params: LabelledSpinnerParams & FlexiblePosition): WidgetCreator<FlexiblePosition>
{
	params.tooltip = "The fantastic map location of your vehicle and where to find it. Only works when the vehicle is not moving.";
	params._noDisabledMessage = true;
	return labelSpinner(params);
}