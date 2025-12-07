/* eslint-disable @stylistic/spaced-comment */
import { button, compute, dropdownSpinner, groupbox, horizontal, label, OpenWindow, toggle, vertical, viewport, window, WindowTemplate, WritableStore } from "openrct2-flexui";
import { isDevelopment, pluginVersion } from "../environment";
import { VehicleViewModel } from "../viewmodels/vehicleViewModel";
import { editorWindow } from "./editorWindow";
import { synchronizationWindow } from "./synchronizationWindow";
import { getWindowColours } from "./widgets/constants";
import { credits } from "./widgets/credits";

const buttonSize = 24;

let title = ("Ride vehicle editor (v" + pluginVersion + ")");
if (isDevelopment)
{
	title += " [DEBUG]";
}

export const viewportWindow = window<VehicleViewModel>(model =>
({
	title,
	colours: getWindowColours(),
	width: { value: 315, min: 315, max: 1280 },
	height: { value: 234, min: 234, max: 800 },
	//spacing: 5,
	onOpen()
	{
		model._open();
		model._editorWindow.set(editorWindow.open(model));
	},
	onClose()
	{
		const editorWindow = model._editorWindow.get();
		const synchronizationWindow = model._synchronizationWindow.get();

		if (editorWindow)
		{
			editorWindow.close();
			model._editorWindow.set(null);
		}
		if (synchronizationWindow)
		{
			synchronizationWindow.close();
			model._synchronizationWindow.set(null);
		}

		model._close();
	},
	content: [
		horizontal([
			vertical({
				//spacing: 8,
				content: [
					groupbox({
						text: "Pick a ride:",
						content: [
							dropdownSpinner({ // ride list
								items: compute(model._rides, c => c.map(r => r._ride().name)),
								tooltip: "List of rides in the park",
								disabledMessage: "No rides in this park",
								autoDisable: "empty",
								selectedIndex: compute(model._selectedRide, r => (r ? r[1] : 0)),
								onChange: idx => model._selectRide(idx)
							}),
							horizontal([
								dropdownSpinner({ // train list
									items: compute(model._trains, c => c.map((t, i) => ("Train " + (t._special ? "?" : (i + 1))))),
									tooltip: "List of trains on the currently selected ride",
									disabledMessage: "No trains available",
									autoDisable: "single",
									selectedIndex: compute(model._selectedTrain, t => (t ? t[1] : 0)),
									onChange: idx => model._selectTrain(idx)
								}),
								dropdownSpinner({ // vehicle list
									items: compute(model._vehicles, c => c.map((_, i) => ("Vehicle " + (i + 1)))),
									tooltip: "List of vehicles on the currently selected train",
									disabledMessage: "No vehicles available",
									autoDisable: "single",
									selectedIndex: compute(model._selectedVehicle, v => (v ? v[1] : 0)),
									onChange: idx => model._selectVehicle(idx)
								})
							])
						]
					}),
					viewport({
						tooltip: "I can see my house from here!",
						target: compute(model._selectedVehicle, c => (c ? c[0]._id : null)),
						disabled: model._isEditDisabled
					})
				]
			}),
			vertical({ // toolbar
				//padding: ["1w", 0],
				padding: { top: 4 },
				spacing: 3,
				content: [ // buttons,
					toggle({
						width: buttonSize,
						height: buttonSize,
						tooltip: "I edit, therefore I am.",
						image: 5164, // SPR_CONSTRUCTION,
						isPressed: compute(model._editorWindow, window => !!window),
						disabled: model._isEditDisabled,
						onChange: pressed => toggleWindow(pressed, editorWindow, model._editorWindow, model)
					}),
					toggle({
						width: buttonSize,
						height: buttonSize,
						tooltip: "Copy and paste to, or edit, multiple vehicles at the same time.",
						image: 5186, // SPR_SHOW_GUESTS_ON_THIS_RIDE_ATTRACTION,
						isPressed: compute(model._synchronizationWindow, window => !!window),
						disabled: model._isEditDisabled,
						onChange: pressed => toggleWindow(pressed, synchronizationWindow, model._synchronizationWindow, model)
					}),
					label({
						width: buttonSize + 10,
						padding: [-5, -5, -4, -5],
						text: "{SMALLFONT}-----",
						alignment: "centred",
						disabled: true
					}),
					toggle({
						width: buttonSize,
						height: buttonSize,
						tooltip: "Use the picker to select a vehicle by clicking it",
						image: "eyedropper", // SPR_G2_EYEDROPPER
						isPressed: model._isPicking,
						onChange: pressed => model._setPicker(pressed)
					}),
					toggle({
						width: buttonSize,
						height: buttonSize,
						tooltip: "Drag stationary vehicles to new places on the map",
						image: 5174, // SPR_PICKUP_BTN
						disabled: model._isPositionDisabled,
						isPressed: model._isDragging,
						onChange: pressed => model._setDragger(pressed)
					}),
					toggle({
						width: buttonSize,
						height: buttonSize,
						tooltip: "Copies the current vehicle settings to your clipboard, so you can use it on another ride",
						image: "copy", // SPR_G2_COPY,
						disabled: model._isEditDisabled,
						isPressed: compute(model._clipboard, clip => !!clip),
						onChange: pressed => model._copy(pressed)
					}),
					button({
						width: buttonSize,
						height: buttonSize,
						tooltip: "Pastes the previously copied vehicle settings over the currently selected vehicle",
						image: "paste", // SPR_G2_PASTE,
						disabled: compute(model._isEditDisabled, model._clipboard, (edit, clip) => edit || !clip),
						onClick: () => model._paste()
					}),
					button({
						width: buttonSize,
						height: buttonSize,
						tooltip: "Locate your vehicle when you've lost it (again)",
						image: 5167, // SPR_LOCATE,
						disabled: model._isEditDisabled,
						onClick: () => model._locate()
					})
				]
			})
		]),
		credits("github.com/Basssiiie/OpenRCT2-RideVehicleEditor", "Go to this URL to check for the latest updates")
	]
}));


function toggleWindow(pressed: boolean, template: WindowTemplate<VehicleViewModel>, store: WritableStore<OpenWindow | null>, model: VehicleViewModel)
{
	if (pressed)
	{
		store.set(template.open(model));
		return;
	}

	const window = store.get();
	if (window)
	{
		window.close();
		store.set(null);
	}
}
