/* eslint-disable @stylistic/spaced-comment */
import { button, compute, dropdownSpinner, groupbox, horizontal, label, toggle, vertical, viewport, window, WindowTemplate } from "openrct2-flexui";
import { isDevelopment, pluginVersion } from "../environment";
import { getWindowColours } from "./widgets/constants";
import { credits } from "./widgets/credits";
import { ViewportViewModel } from "../viewmodels/viewportViewModel";
import { SelectionViewModel } from "../viewmodels/selectionViewModel";

const buttonSize = 24;

let title: string | undefined;
let viewportWindow: WindowTemplate<ViewportViewModel> | undefined;

export function openViewportWindow(): void
{
	if (!title)
	{
		title = ("Ride vehicle editor (v" + pluginVersion + ")");
		if (isDevelopment)
		{
			title += " [DEBUG]";
		}
	}

	viewportWindow ||= createViewportWindow();

	const selection = new SelectionViewModel();
	const viewport = new ViewportViewModel(selection);
	viewportWindow.open(viewport);

	if (selection._vehicle.get())
	{
		viewport._setEditorWindow(true);
	}
}

function createViewportWindow(): WindowTemplate<ViewportViewModel>
{
	return window<ViewportViewModel>(model =>
	({
		title,
		colours: getWindowColours(),
		width: { value: 315, min: 315, max: 1280 },
		height: { value: 234, min: 234, max: 800 },
		onClose: model._close.bind(model),
		content: [
			horizontal([
				vertical([
					groupbox({
						text: "Pick a ride",
						content: [
							dropdownSpinner({ // ride list
								items: compute(model._selection._allRides, c => c.map(r => r._ride().name)),
								tooltip: "List of rides in the park",
								disabledMessage: "No rides in this park",
								autoDisable: "empty",
								selectedIndex: compute(model._selection._ride, r => (r ? r[1] : 0)),
								onChange: idx => model._selection._setRide(idx)
							}),
							horizontal([
								dropdownSpinner({ // train list
									items: compute(model._selection._allTrains, c => c.map((t, i) => ("Train " + (t._special ? "?" : (i + 1))))),
									tooltip: "List of trains on the currently selected ride",
									disabledMessage: "No trains available",
									autoDisable: "single",
									selectedIndex: compute(model._selection._train, t => (t ? t[1] : 0)),
									onChange: idx => model._selection._setTrain(idx)
								}),
								dropdownSpinner({ // vehicle list
									items: compute(model._selection._allVehicles, c => c.map((_, i) => ("Vehicle " + (i + 1)))),
									tooltip: "List of vehicles on the currently selected train",
									disabledMessage: "No vehicles available",
									autoDisable: "single",
									selectedIndex: compute(model._selection._vehicle, v => (v ? v[1] : 0)),
									onChange: idx => model._selection._setVehicle(idx)
								})
							])
						]
					}),
					viewport({
						tooltip: "I can see my house from here!",
						target: compute(model._selection._vehicle, c => (c ? c[0]._id : null)),
						disabled: model._selection._isDisabled
					})
				]),
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
							disabled: model._selection._isDisabled, // todo: allow ride editing?
							onChange: model._setEditorWindow.bind(model)
						}),
						toggle({
							width: buttonSize,
							height: buttonSize,
							tooltip: "Copy and paste to, or edit, multiple vehicles at the same time.",
							image: 5186, // SPR_SHOW_GUESTS_ON_THIS_RIDE_ATTRACTION,
							isPressed: compute(model._synchronizationWindow, window => !!window),
							disabled: model._selection._isDisabled,
							onChange: model._setSynchronizationWindow.bind(model)
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
							//disabled: model._isPositionDisabled,
							isPressed: model._isDragging,
							onChange: pressed => model._setDragger(pressed)
						}),
						toggle({
							width: buttonSize,
							height: buttonSize,
							tooltip: "Copies the current vehicle settings to your clipboard, so you can use it on another ride",
							image: "copy", // SPR_G2_COPY,
							disabled: model._selection._isDisabled,
							isPressed: compute(model._clipboard, clip => !!clip),
							onChange: pressed => model._copy(pressed)
						}),
						button({
							width: buttonSize,
							height: buttonSize,
							tooltip: "Pastes the previously copied vehicle settings over the currently selected vehicle",
							image: "paste", // SPR_G2_PASTE,
							disabled: compute(model._selection._isDisabled, model._clipboard, (edit, clip) => edit || !clip),
							onClick: () => model._paste()
						}),
						button({
							width: buttonSize,
							height: buttonSize,
							tooltip: "Locate your vehicle when you've lost it (again)",
							image: 5167, // SPR_LOCATE,
							disabled: model._selection._isDisabled,
							onClick: () => model._locate()
						})
					]
				})
			]),
			credits("github.com/Basssiiie/OpenRCT2-RideVehicleEditor", "Go to this URL to check for the latest updates")
		]
	}));
}
