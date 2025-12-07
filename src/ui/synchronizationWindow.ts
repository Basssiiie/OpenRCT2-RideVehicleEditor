import { button, checkbox, compute, dropdown, groupbox, horizontal, OpenWindow, toggle, vertical, window, WindowTemplate, WritableStore } from "openrct2-flexui";
import { CopyFilter } from "../services/vehicleCopier";
import { buttonSize, getWindowColours } from "./widgets/constants";
import { credits } from "./widgets/credits";
import { SynchronizationViewModel } from "../viewmodels/synchronizationViewModel";


// Tips that are used multiple times
const applyOptionsTip = "Copy the selected vehicle settings to a specific set of other vehicles on this ride.";

let synchronizationWindow: WindowTemplate<SynchronizationViewModel> | undefined;

export function openSynchronizationWindow(store: WritableStore<OpenWindow | null>, synchronization: SynchronizationViewModel): void
{
	synchronizationWindow ||= createSynchronizationWindow();

	const window = synchronizationWindow.open(synchronization);
	store.set(window);
}

function createSynchronizationWindow()
{
	return window<SynchronizationViewModel>(model =>
	({
		title: "Apply & synchronize",
		colours: getWindowColours(),
		width: { value: 220, min: 220, max: 400 },
		height: "auto",
		onClose: model._close.bind(model),
		content: [
			groupbox({
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
							"All vehicles on all trains",
							"Preceding vehicles on all trains",
							"Following vehicles on all trains",
							"Same vehicle number on all trains"
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
							onClick: model._applySelectedSettings.bind(model)
						}),
						toggle({
							text: "Synchronize",
							tooltip: "Enable this and every change you make, will be made to the other vehicles as well. It's like synchronized swimming!",
							height: buttonSize,
							isPressed: model._synchronizeTargets,
							onChange: enabled => model._synchronizeTargets.set(enabled)
						})
					])
				]
			}),
			credits()
		]
	}));
}

