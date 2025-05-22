import { button, checkbox, CheckboxParams, colourPicker, compute, dropdown, dropdownSpinner, DropdownSpinnerParams, FlexiblePosition, groupbox, horizontal, label, spinner, SpinnerParams, toggle, twoway, vertical, viewport, WidgetCreator, window } from "openrct2-flexui";
import { isDevelopment, pluginVersion } from "../environment";
import { RideType } from "../objects/rideType";
import { RideVehicleVariant, VehicleVisibility } from "../objects/rideVehicleVariant";
import { invoke, refreshRide } from "../services/events";
import { getDistanceFromProgress } from "../services/spacingEditor";
import { applyToTargets, CopyFilter, getTargets, getVehicleSettings } from "../services/vehicleCopier";
import { changeSpacing, changeTrackProgress, setMass, setPositionX, setPositionY, setPositionZ, setPoweredAcceleration, setPoweredMaximumSpeed, setPrimaryColour, setReversed, setRideType, setSeatCount, setSecondaryColour, setSpin, setTertiaryColour, setVariant } from "../services/vehicleEditor";
import { VehicleSpan } from "../services/vehicleSpan";
import { isValidGameVersion } from "../services/versionChecker";
import * as Log from "../utilities/logger";
import { floor } from "../utilities/math";
import { VehicleViewModel } from "../viewmodels/vehicleViewModel";
import { model as rideModel, rideWindow } from "./rideWindow";
import { labelled, labelledSpinner, LabelledSpinnerParams, multiplier } from "./utilityControls";


/**
 * Opens the ride editor window.
 */
export function openEditorWindow(): void
{
	// Check if game is up-to-date...
	if (isValidGameVersion())
	{
		// Show the current instance if one is active.
		mainWindow.open();
	}
}

/**
 * The viewmodel for the vehicle editor.
 */
export const model = new VehicleViewModel();

const buttonSize = 24;
const controlsWidth = 244;
const controlsLabelWidth = 82;
const controlsSpinnerWidth = controlsWidth - (controlsLabelWidth + 4 + 12); // include spacing

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

const mainWindow = window({
	title,
	width: { value: 515, min: 515, max: 560 },
	height: 430,
	spacing: 5,
	onOpen: () => model._open(),
	onClose: () =>
	{
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
					disabled: compute(model._selectedRide, r => !r || !!r[0]._missing),
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
					onChange: idx => model._selectRide(idx)
				}),
				dropdownSpinner({ // train list
					items: compute(model._trains, c => c.map((t, i) => ("Train " + (t._special ? "?" : (i + 1))))),
					width: "30%",
					tooltip: "List of trains on the currently selected ride",
					disabledMessage: "No trains available",
					autoDisable: "single",
					selectedIndex: compute(model._selectedTrain, t => t ? t[1] : 0),
					onChange: idx => model._selectTrain(idx)
				}),
				dropdownSpinner({ // vehicle list
					items: compute(model._vehicles, c => c.map((_, i) => ("Vehicle " + (i + 1)))),
					width: "30%",
					tooltip: "List of vehicles on the currently selected train",
					disabledMessage: "No vehicles available",
					autoDisable: "single",
					selectedIndex: compute(model._selectedVehicle, v => v ? v[1] : 0),
					onChange: idx => model._selectedVehicle.set([model._vehicles.get()[idx], idx])
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
									onChange: pressed => model._setPicker(pressed)
								}),
								toggle({
									width: buttonSize, height: buttonSize,
									tooltip: "Drag stationary vehicles to new places on the map",
									image: 5174, // SPR_PICKUP_BTN
									disabled: model._isPositionDisabled,
									isPressed: model._isDragging,
									onChange: pressed => model._setDragger(pressed)
								}),
								toggle({
									width: buttonSize, height: buttonSize,
									tooltip: "Copies the current vehicle settings to your clipboard, so you can use it on another ride",
									image: "copy", // SPR_G2_COPY,
									disabled: model._isEditDisabled,
									isPressed: compute(model._clipboard, clip => !!clip),
									onChange: pressed => model._copy(pressed)
								}),
								button({
									width: buttonSize, height: buttonSize,
									tooltip: "Pastes the previously copied vehicle settings over the currently selected vehicle",
									image: "paste", // SPR_G2_PASTE,
									disabled: compute(model._isEditDisabled, model._clipboard, (edit, clip) => edit || !clip),
									onClick: () => model._paste()
								}),
								button({
									width: buttonSize, height: buttonSize,
									tooltip: "Locate your vehicle when you've lost it (again)",
									image: 5167, // SPR_LOCATE,
									disabled: model._isEditDisabled,
									onClick: () => model._locate()
								})
							]
						}),
						viewport({
							tooltip: "I can see my house from here!",
							target: compute(model._selectedVehicle, c => (c) ? c[0]._id : null),
							disabled: model._isEditDisabled
						})
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
										tooltip: "Synchronize the selected track progress changes to other vehicles (apply not supported).",
										isChecked: compute(model._copyFilters, f => !!(f & CopyFilter.TrackProgress)),
										onChange: c => model._setFilter(CopyFilter.TrackProgress, c)
									}),
									checkbox({
										text: "Spacing",
										tooltip: "Synchronize the selected spacing changes to other vehicles (apply not supported).",
										isChecked: compute(model._copyFilters, f => !!(f & CopyFilter.Spacing)),
										onChange: c => model._setFilter(CopyFilter.Spacing, c)
									}),
									checkbox({
										text: "Position",
										tooltip: "Synchronize the selected position changes to other vehicles (apply not supported).",
										isChecked: compute(model._copyFilters, f => !!(f & CopyFilter.Position)),
										onChange: c => model._setFilter(CopyFilter.Position, c)
									})
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
									checkbox({
										text: "Spin",
										tooltip: "Copy the selected spin to other vehicles.",
										isChecked: compute(model._copyFilters, f => !!(f & CopyFilter.Spin)),
										onChange: c => model._setFilter(CopyFilter.Spin, c)
									})
								])
							]),
							dropdown({
								items: [
									"All vehicles on this train",
									"Preceding vehicles on this train",
									"Following vehicles on this train",
									"Specific vehicles on this train",
									"All vehicles on all trains",
									"Preceding vehicles on all trains",
									"Following vehicles on all trains",
									"Same vehicle number on all trains"
								],
								tooltip: applyOptionsTip,
								selectedIndex: model._copyTargetOption,
								onChange: idx =>
								{
									model._setSequence(idx);
									model._copyTargetOption.set(idx);
								}
							}),
							horizontal({
								padding: { top: -4, right: 1 },								
								content: [
									label({
										text: "Apply to every # vehicle(s):",
										tooltip: "Applies settings to every selected number of vehicles",
										width: 180,
										visibility: compute(model._isSequence, s => s ? "visible" : "none")
									}),
									spinner({
										tooltip: "Applies settings to every selected number of vehicles",
										width: 60,
										value: 1,
										minimum: 1,
										maximum: compute(model._vehicles, c => c.length || 1),
										step: model._multiplier,
										visibility: compute(model._isSequence, s => s ? "visible" : "none"),
										onChange: v => model._sequenceValue.set(v)
									})
								]
							}),
							horizontal({
								padding: { top: -4, right: 1 },								
								content: [
									label({
										text: "Last vehicle of train to modify",
										tooltip: "Selects which vehicle of the train is the last to modify",
										width: 180,
										visibility: compute(model._isSequence, s => s ? "visible" : "none")
									}),
									spinner({
										tooltip: "Selects which vehicle of the train is the last to modify",
										width: 60,
										value: compute(model._vehicles, c => c.length || 1),
										minimum: 1,
										maximum: compute(model._vehicles, c => c.length || 1),
										step: model._multiplier,
										visibility: compute(model._isSequence, s => s ? "visible" : "none"),
										onChange: v => model._lastVehicle.set(v)
									})
								]
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
								items: compute(model._rideTypes, getUniqueRideTypeNames),
								tooltip: "All ride types currently available in the park",
								disabledMessage: "No ride types available",
								disabled: compute(model._isEditDisabled, model._type, (noEdit, type) => (noEdit || !type)),
								autoDisable: "empty",
								selectedIndex: twoway(compute(model._type, t => (t) ? t[1] : 0)),
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
								onChange: value => model._modifyVehicle(setVariant, value, CopyFilter.TypeAndVariant)
							}),
							labelled<CheckboxParams>({
								_control: checkbox,
								_label: { text: "Reversed:", width: controlsLabelWidth },
								tooltip: "Look behind you!",
								disabled: model._isEditDisabled,
								isChecked: model._isReversed,
								onChange: value => model._modifyVehicle(setReversed, value, CopyFilter.TypeAndVariant)
							}),
							horizontal([
								label({
									text: "Colours:",
									tooltip: "The three important boxes that make the vehicle pretty on demand.",
									width: controlsLabelWidth,
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
								onChange: (_, incr) => applyTrackProgressChange(changeTrackProgress, incr, CopyFilter.TrackProgress)
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
								onChange: (_, incr) => applyTrackProgressChange(changeSpacing, incr, CopyFilter.Spacing)
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
								maximum: compute(model._spinFrames, frames => frames > 0 ? frames - 1 : 0),
								disabled: model._isSpinDisabled,
								step: model._multiplier,
								value: compute(model._spin, model._spinFrames, (spin, frames) => floor((spin * frames) / 256)),
								onChange: (_, incr) => model._modifyVehicle(setSpin, floor((incr * 256) / model._spinFrames.get()), CopyFilter.Spin)
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
					multiplier(model._multiplierIndex)
				]
			})
		]),
		label({ // credits
			padding: [ -1, 80, 0, 80 ], // do not cover the resize corner
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
	model._modifyVehicle(setRideType, type, CopyFilter.TypeAndVariant);
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
			getTargets(model._copyTargetOption.get(), model._selectedRide.get(), model._selectedTrain.get(), vehicle, model._sequenceValue.get(), model._lastVehicle.get())
		);
	}
}

/**
 * Apply the same amount of track progress to all selected vehicles based on the currently selected car.
 */
function applyTrackProgressChange(action: (vehicles: VehicleSpan[], value: number) => void, increment: number, filter: CopyFilter): void
{
	const selectedVehicle = model._selectedVehicle.get();
	if (selectedVehicle)
	{
		const distance = getDistanceFromProgress(selectedVehicle[0]._car(), increment);
		model._modifyVehicle(action, distance, filter);
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
	params.minimum = 0;
	params.wrapMode = "clamp";
	params._noDisabledMessage = true;
	return labelSpinner(params);
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
