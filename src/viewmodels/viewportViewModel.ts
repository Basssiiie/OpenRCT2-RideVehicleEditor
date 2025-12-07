import { OpenWindow, store, WritableStore } from "openrct2-flexui";
import { applyToTargets, CopyFilter, getVehicleSettings, VehicleSettings } from "../services/vehicleCopier";
import { locate } from "../services/vehicleLocater";
import { pickerToolId, toggleVehiclePicker } from "../services/vehiclePicker";
import { SelectionViewModel } from "./selectionViewModel";
import { dragToolId, toggleVehicleDragger } from "../services/vehicleDragger";
import * as Log from "../utilities/logger";
import { cancelTools } from "../utilities/tools";
import { SynchronizationViewModel } from "./synchronizationViewModel";
import { getAllRides } from "../objects/parkRide";
import { find, findIndex } from "../utilities/array";
import { isNull } from "../utilities/type";
import { openEditorWindow } from "../ui/editorWindow";
import { openSynchronizationWindow } from "../ui/synchronizationWindow";

export class ViewportViewModel
{
	readonly _selection: SelectionViewModel;
	readonly _synchronization: SynchronizationViewModel;

	readonly _editorWindow;
	readonly _synchronizationWindow;

	readonly _isPicking = store<boolean>(false);
	readonly _isDragging = store<boolean>(false);
	readonly _clipboard = store<VehicleSettings | null>(null);

	private readonly _onPlayerAction;


	constructor(selection: SelectionViewModel)
	{
		Log.debug("[ViewportViewModel] Window opened!");
		const editorWindow = store<OpenWindow | null>(null);
		const synchronizationWindow = store<OpenWindow | null>(null);
		const synchronization = new SynchronizationViewModel(synchronizationWindow, selection);

		this._selection = selection;
		this._synchronization = synchronization;

		this._editorWindow = editorWindow;
		this._synchronizationWindow = synchronizationWindow;
		this._onPlayerAction = context.subscribe("action.execute", e => this._onPlayerActionExecuted(e));
	}

	_close(): void
	{
		Log.debug("[ViewportViewModel] Window closed!");

		const editorStore = this._editorWindow;
		const editorWindow = editorStore.get();
		const synchronizationStore = this._synchronizationWindow;
		const synchronizationWindow = synchronizationStore.get();

		if (editorWindow)
		{
			editorWindow.close();
			editorStore.set(null);
		}
		if (synchronizationWindow)
		{
			synchronizationWindow.close();
			synchronizationStore.set(null);
		}

		cancelTools(pickerToolId, dragToolId);
		this._onPlayerAction.dispose();
	}

	_setEditorWindow(open: boolean): void
	{
		this._setWindow(open, this._editorWindow, store => openEditorWindow(store, this._selection, this._synchronization));
	}

	_setSynchronizationWindow(open: boolean): void
	{
		this._setWindow(open, this._synchronizationWindow, store => openSynchronizationWindow(store, this._synchronization));
	}


	/**
	 * Toggle the vehicle picker on or off.
	 */
	_setPicker(active: boolean, onSelect?: () => void): void
	{
		this._isPicking.set(active);
		toggleVehiclePicker(
			active,
			car =>
			{
				if (onSelect)
				{
					onSelect();
				}
				this._selection._setFromCar(car);
			},
			() => this._isPicking.set(false)
		);
	}

	/**
	 * Toggle the vehicle dragger on or off.
	 */
	_setDragger(active: boolean): void
	{
		this._isDragging.set(active);
		toggleVehicleDragger(active, this._selection._vehicle, () => this._isDragging.set(false));
	}

	/**
	 * Copies the currently selected vehicle to the clipboard, or clears clipboard.
	 */
	_copy(active: boolean): void
	{
		const vehicle = this._selection._vehicle.get();
		this._clipboard.set((active && vehicle) ? getVehicleSettings(vehicle[0], CopyFilter.All) : null);
	}

	/**
	 * Pastes the vehicle settings on the clipboard to the currently selected vehicle.
	 */
	_paste(): void
	{
		const vehicle = this._selection._vehicle.get();
		const settings = this._clipboard.get();
		if (vehicle && settings)
		{
			applyToTargets(settings, [[vehicle[0]._id, 1]]);
		}
	}
	/**
	 * Locates the currently selected vehicle on the main viewport.
	 */
	_locate(): void
	{
		const vehicle = this._selection._vehicle.get();
		if (vehicle)
		{
			locate(vehicle[0]);
		}
	}

	private _setWindow(open: boolean, store: WritableStore<OpenWindow | null>, opener: (store: WritableStore<OpenWindow | null>) => void): void
	{
		const window = store.get();
		if (open)
		{
			if (window && window.isOpen())
			{
				window.focus();
			}
			else
			{
				opener(store);
			}
		}
		else if (window)
		{
			window.close();
			store.set(null);
		}
	}


	/**
	 * Triggers for every executed player action.
	 * @param event The arguments describing the executed action.
	 */
	private _onPlayerActionExecuted(event: GameActionEventArgs): void
	{
		if (event.isClientOnly)
		{
			return;
		}
		const action = <ActionType>event.action;
		const selection = this._selection;
		switch (action)
		{
			case "ridecreate":
			case "ridedemolish":
			{
				selection._allRides.set(getAllRides());
				break;
			}
			case "ridesetname":
			{
				const currentRide = selection._ride.get();
				const currentVehicle = selection._vehicle.get();
				const allRides = getAllRides();
				selection._allRides.set(allRides);
				if (currentVehicle)
				{
					// Reselect same vehicle
					selection._setFromCar(currentVehicle[0]._car());
				}
				else if (currentRide)
				{
					// No vehicles were spawned, try to find the same ride again.
					const rideId = currentRide[0]._id;
					const rideIdx = findIndex(allRides, r => r._id === rideId);
					if (!isNull(rideIdx))
					{
						selection._ride.set([allRides[rideIdx], rideIdx]);
					}
				}
				break;
			}
			case "ridesetstatus": // close/reopen ride
			{
				const args = <RideSetStatusArgs>event.args;
				const rideId = args.ride;
				const rides = selection._allRides.get();
				const ride = find(rides, r => r._id === rideId);
				if (!isNull(ride))
				{
					const rideExists = ride._refresh();
					const selectedRide = selection._ride.get();
					if (selectedRide && selectedRide[0]._id === rideId)
					{
						const selectedTrain = selection._train.get();
						if (rideExists && !selectedTrain)
						{
							Log.debug("Selected ride: status changed to", args.status, ", get newly spawned trains");
							selection._allTrains.set(ride._trains());
						}
						else if (!rideExists || (selectedTrain && !selectedTrain[0]._refresh()))
						{
							Log.debug("Selected ride: status changed to", args.status, ", all trains removed");
							selection._allTrains.set([]);
						}
					}
				}
				break;
			}
			default: return;
		}

		Log.debug("<", action, ">\n\t- type:", event.type, "(client:", event.isClientOnly, ")\n\t- args:", JSON.stringify(event.args), "\n\t- result:", JSON.stringify(event.result));
	}
}
