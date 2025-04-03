import { Colour, compute, store, WritableStore } from "openrct2-flexui";
import { getAllRides, ParkRide } from "../objects/parkRide";
import { createTrainFromAnyCar, RideTrain } from "../objects/rideTrain";
import { getAllRideTypes, gigaCableLiftHillType, gigaCableLiftHillTypeId, RideType } from "../objects/rideType";
import { RideVehicle } from "../objects/rideVehicle";
import { refreshVehicle } from "../services/events";
import { getSpacingToPrecedingVehicle } from "../services/spacingEditor";
import { applyToTargets, CopyFilter, CopyOptions, getTargets, getVehicleSettings, VehicleSettings } from "../services/vehicleCopier";
import { dragToolId, toggleVehicleDragger } from "../services/vehicleDragger";
import { locate } from "../services/vehicleLocater";
import { pickerToolId, toggleVehiclePicker } from "../services/vehiclePicker";
import { VehicleSpan } from "../services/vehicleSpan";
import { find, findIndex, orderByNameThenByIdentifier } from "../utilities/array";
import * as Log from "../utilities/logger";
import { cancelTools } from "../utilities/tools";
import { isNull } from "../utilities/type";


/**
 * Viewmodel for the currently selected vehicle.
 */
export class VehicleViewModel
{
	readonly _selectedRide = store<[ParkRide, number] | null>(null);
	readonly _selectedTrain = store<[RideTrain, number] | null>(null);
	readonly _selectedVehicle = store<[RideVehicle, number] | null>(null);

	readonly _rideTypes = store<RideType[]>([]);
	readonly _rides = store<ParkRide[]>([]);
	readonly _trains = compute(this._selectedRide, r => (r) ? r[0]._trains() : []);
	readonly _vehicles = compute(this._selectedTrain, t => (t) ? t[0]._vehicles() : []);

	readonly _type = store<[RideType, number] | null>(null);
	readonly _variants = compute(this._type, t => (t) ? t[0]._variants() : []);
	readonly _variant = store<number>(0);
	readonly _isReversed = store<boolean>(false);
	readonly _seats = store<number>(0);
	readonly _mass = store<number>(0);
	readonly _poweredAcceleration = store<number>(0);
	readonly _poweredMaxSpeed = store<number>(0);
	readonly _trackProgress = store<number>(0);
	readonly _trackLocation = store<CarTrackLocation | null>(null);
	readonly _spacing = store<number | null>(0);
	readonly _x = store<number>(0);
	readonly _y = store<number>(0);
	readonly _z = store<number>(0);
	readonly _spin = store<number>(0);

	readonly _primaryColour = store<Colour>(0);
	readonly _secondaryColour = store<Colour>(0);
	readonly _tertiaryColour = store<Colour>(0);

	readonly _isMoving = store(false);
	readonly _isUnpowered = compute(this._selectedVehicle, this._type, this._variant, v => !v || !v[0]._isPowered());
	readonly _isPicking = store<boolean>(false);
	readonly _isDragging = store<boolean>(false);
	readonly _isEditDisabled = compute(this._selectedVehicle, v => !v);
	readonly _isSpinDisabled = compute(this._selectedVehicle, v => !v || !v[0]._isSpinning());
	readonly _isPositionDisabled = compute(this._isMoving, this._isEditDisabled, (m, e) => m || e);
	readonly _formatPosition = (pos: number): string => (this._isEditDisabled.get() ? "Not available" : pos.toString());
	readonly _multiplierIndex = store<number>(0);
	readonly _multiplier = compute(this._multiplierIndex, idx => (10 ** idx));

	readonly _copyFilters = store(CopyFilter.Default);
	readonly _copyTargetOption = store<CopyOptions>(0);
	readonly _copyTargets = compute(this._copyTargetOption, this._selectedVehicle, (o, v) => getTargets(o, this._selectedRide.get(), this._selectedTrain.get(), v));
	readonly _synchronizeTargets = store<boolean>(false);
	readonly _clipboard = store<VehicleSettings | null>(null);

	_isOpen?: boolean;
	private _isRefreshing?: boolean;
	private _onPlayerAction?: IDisposable;
	private _onGameTick?: IDisposable;

	constructor()
	{
		this._rides.subscribe(r => updateSelectionOrNull(this._selectedRide, r));
		this._trains.subscribe(t => updateSelectionOrNull(this._selectedTrain, t));
		this._vehicles.subscribe(v => updateSelectionOrNull(this._selectedVehicle, v));

		this._selectedVehicle.subscribe(vehicle =>
		{
			cancelTools(dragToolId);
			if (vehicle && this._isOpen)
			{
				this._updateVehicleInfo(vehicle[0], vehicle[1]);
			}
		});
		refreshVehicle.push(id =>
		{
			if (!this._isOpen)
			{
				Log.debug("[VehicleViewModel] Refresh ignored, window not open.");
				return;
			}
			Log.debug("[VehicleViewModel] Refresh vehicle!");
			const vehicle = this._selectedVehicle.get();
			if (vehicle && vehicle[0]._id === id)
			{
				this._updateVehicleInfo(vehicle[0], vehicle[1]);
			}
		});
	}

	/**
	 * Reload available rides and ride types when the window opens.
	 */
	_open(): void
	{
		Log.debug("[VehicleViewModel] Window opened!");
		this._isOpen = true;
		this._rideTypes.set(getAllRideTypes());
		this._rides.set(getAllRides());

		this._onPlayerAction ||= context.subscribe("action.execute", e => this._onPlayerActionExecuted(e));
		this._onGameTick ||= context.subscribe("interval.tick", () => this._onGameTickExecuted());
	}

	/**
	 * Disposes events that were being listened for.
	 */
	_close(): void
	{
		Log.debug("[VehicleViewModel] Window closed!");
		cancelTools(pickerToolId, dragToolId);

		this._isOpen = false;
		if (this._onPlayerAction)
		{
			this._onPlayerAction.dispose();
		}
		if (this._onGameTick)
		{
			this._onGameTick.dispose();
		}
		this._onPlayerAction = undefined;
		this._onGameTick = undefined;

		// Reset values
		this._multiplierIndex.set(0);
		this._synchronizeTargets.set(false);
	}

	/**
	 * Select a specific ride by index.
	 */
	_selectRide(index: number): void
	{
		const rides = this._rides.get();
		const count = rides.length;
		const idx = (index + count) % count;

		if (!this._isOpen || !count)
		{
			return;
		}

		this._selectedRide.set([rides[idx], idx]);
	}

	/**
	 * Select a specific train by index.
	 */
	_selectTrain(index: number): void
	{
		const trains = this._trains.get();
		const count = trains.length;
		const idx = (index + count) % count;

		if (!this._isOpen || !count)
		{
			return;
		}

		this._selectedTrain.set([trains[idx], idx]);
	}

	/**
	 * Select a specific vehicle by index.
	 */
	_selectVehicle(index: number): void
	{
		const vehicles = this._vehicles.get();
		const count = vehicles.length;
		const idx = (index + count) % count;

		if (!this._isOpen || !count)
		{
			return;
		}

		this._selectedVehicle.set([vehicles[idx], idx]);
	}

	/**
	 * Select a specific car entity.
	 */
	_selectCar(car: Car): void
	{
		const
			rides = this._rides.get(),
			carId = car.id,
			rideId = car.ride,
			carRideIndex = findIndex(rides, r => r._id === rideId);

		if (isNull(carRideIndex))
		{
			Log.debug("Could not find ride id", rideId, "for selected entity id", carId);
			return;
		}

		this._selectedRide.set([ rides[carRideIndex], carRideIndex ]);

		const trains = this._trains.get();
		for (let t = 0; t < trains.length; t++)
		{
			const vehicles = trains[t]._vehicles();
			for (let v = 0; v < vehicles.length; v++)
			{
				if (vehicles[v]._id === carId)
				{
					this._selectedTrain.set([ trains[t], t ]);
					this._selectedVehicle.set([ vehicles[v], v ]);
					return;
				}
			}
		}

		Log.debug("Could not find vehicle entity id", carId, "on ride id", rideId, ", adding special train");
		const [specialTrain, carIndex] = createTrainFromAnyCar(car);
		const vehicle = specialTrain._vehicles()[carIndex];

		this._trains.set(trains.concat(specialTrain));
		this._selectedTrain.set([ specialTrain, trains.length ]);
		this._selectedVehicle.set([ vehicle, carIndex ]);
	}

	/**
	 * Attempt to modify the vehicle with the specified action, if a vehicle is selected.
	 */
	_modifyVehicle<T>(action: (vehicles: VehicleSpan[], value: T) => void, value: T): void
	{
		if (this._isRefreshing)
		{
			Log.debug("Vehicle modify ignored, is refreshing!");
			return;
		}
		const vehicle = this._selectedVehicle.get();
		if (vehicle)
		{
			if (this._synchronizeTargets.get())
			{
				action(this._copyTargets.get(), value);
			}
			else
			{
				action([[ vehicle[0]._id, 1 ]], value);
			}
		}
		else
		{
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			Log.debug("Failed to modify vehicle with", (<any>action).name, "to", value, "; none is selected.");
		}
	}

	/**
	 * Toggle a filter on or off.
	 */
	_setFilter(filter: CopyFilter, toggle: boolean): void
	{
		const enabledFilters = this._copyFilters.get();

		this._copyFilters.set((toggle)
			? (enabledFilters | filter)
			: (enabledFilters & ~filter)
		);
	}

	/**
	 * Toggle the vehicle picker on or off.
	 */
	_setPicker(active: boolean, onSelect?: () => void): void
	{
		this._isPicking.set(true);
		toggleVehiclePicker(active, c =>
			{
				if (onSelect)
				{
					onSelect();
				}
				this._selectCar(c);
			},
			() => this._isPicking.set(false)
		);
	}

	/**
	 * Toggle the vehicle dragger on or off.
	 */
	_setDragger(active: boolean): void
	{
		if (this._isOpen)
		{
			toggleVehicleDragger(active, this._selectedVehicle, this._x, this._y, this._z, this._trackLocation, this._trackProgress, () => this._isDragging.set(false));
		}
	}

	/**
	 * Copies the currently selected vehicle to the clipboard, or clears clipboard.
	 */
	_copy(active: boolean): void
	{
		if (this._isOpen)
		{
			const vehicle = this._selectedVehicle.get();
			this._clipboard.set((active && vehicle) ? getVehicleSettings(vehicle[0], CopyFilter.All) : null);
		}
	}

	/**
	 * Pastes the vehicle settings on the clipboard to the currently selected vehicle.
	 */
	_paste(): void
	{
		if (!this._isOpen)
		{
			return;
		}

		const vehicle = this._selectedVehicle.get();
		const settings = this._clipboard.get();
		if (vehicle && settings)
		{
			applyToTargets(settings, [[ vehicle[0]._id, 1 ]]);
		}
	}

	/**
	 * Locates the currently selected vehicle on the main viewport.
	 */
	_locate(): void
	{
		const vehicle = this._selectedVehicle.get();
		if (this._isOpen && vehicle)
		{
			locate(vehicle[0]);
		}
	}

	/**
	 * Updates the viewmodel with refreshed information from a ride vehicle.
	 */
	private _updateVehicleInfo(vehicle: RideVehicle, index: number): void
	{
		this._isRefreshing = true;
		const car = vehicle._car();
		const rideObjectId = car.rideObject;
		const colours = car.colours;
		let types = this._rideTypes.get();
		let typeIdx = findIndex(types, t => t._id === car.rideObject);
		let type: [RideType, number] | null;

		if (!isNull(typeIdx))
		{
			type = [ types[typeIdx], typeIdx ];
		}
		else if (rideObjectId === gigaCableLiftHillTypeId) // Special Giga Lifthill
		{
			Log.debug("Adding special Giga cable lift ride type");
			types = types
				.concat(gigaCableLiftHillType)
				.sort((l, r) => orderByNameThenByIdentifier(l._object(), r._object()));

			typeIdx = findIndex(types, t => t._id === gigaCableLiftHillTypeId);
			Log.assert(!isNull(typeIdx));

			type = [ gigaCableLiftHillType, <number>typeIdx ];
			this._rideTypes.set(types);
		}
		else
		{
			type = null;
		}

		this._type.set(type);
		this._updateDynamicDataFromCar(car, index);
		this._isReversed.set(car.isReversed);
		this._seats.set(car.numSeats);
		this._poweredAcceleration.set(car.poweredAcceleration);
		this._poweredMaxSpeed.set(car.poweredMaxSpeed);
		this._primaryColour.set(colours.body);
		this._secondaryColour.set(colours.trim);
		this._tertiaryColour.set(colours.tertiary);
		this._isRefreshing = false;
	}

	/**
	 * Updates the viewmodel with refreshed information from a car entity.
	 */
	private _updateDynamicDataFromCar(car: Car, index: number): void
	{
		this._variant.set(car.vehicleObject);
		this._mass.set(car.mass);
		this._trackProgress.set(car.trackProgress);
		this._trackLocation.set(car.trackLocation);
		this._x.set(car.x);
		this._y.set(car.y);
		this._z.set(car.z);
		this._spin.set(car.spin);

		const train = this._selectedTrain.get();
		if (train)
		{
			const status = train[0]._at(0)._car().status;
			this._isMoving.set(isMoving(status));
			this._spacing.set(getSpacingToPrecedingVehicle(train[0], car, index));
		}
	}

	/**
	 * Synchronise the data of the model with the car.
	 */
	private _onGameTickExecuted(): void
	{
		const vehicle = this._selectedVehicle.get();
		if (vehicle)
		{
			this._updateDynamicDataFromCar(vehicle[0]._car(), vehicle[1]);
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
		const action = event.action as ActionType;
		switch (action)
		{
			case "ridecreate":
			case "ridedemolish":
			{
				this._rides.set(getAllRides());
				break;
			}
			case "ridesetname":
			{
				const currentRide = this._selectedRide.get();
				const currentVehicle = this._selectedVehicle.get();
				const allRides = getAllRides();
				this._rides.set(allRides);
				if (currentVehicle)
				{
					// Reselect same vehicle
					this._selectCar(currentVehicle[0]._car());
				}
				else if (currentRide)
				{
					// No vehicles were spawned, try to find the same ride again.
					const rideId = currentRide[0]._id;
					const rideIdx = findIndex(allRides, r => r._id === rideId);
					if (!isNull(rideIdx))
					{
						this._selectedRide.set([allRides[rideIdx], rideIdx]);
					}
				}
				break;
			}
			case "ridesetstatus": // close/reopen ride
			{
				const args = <RideSetStatusArgs>event.args;
				const rideId = args.ride;
				const rides = this._rides.get();
				const ride = find(rides, r => r._id === rideId);
				if (!isNull(ride))
				{
					const rideExists = ride._refresh();
					const selectedRide = this._selectedRide.get();
					if (selectedRide && selectedRide[0]._id === rideId)
					{
						const selectedTrain = this._selectedTrain.get();
						if (rideExists && !selectedTrain)
						{
							Log.debug("Selected ride: status changed to", args.status, ", get newly spawned trains");
							this._trains.set(ride._trains());
						}
						else if (!rideExists || (selectedTrain && !selectedTrain[0]._refresh()))
						{
							Log.debug("Selected ride: status changed to", args.status, ", all trains removed");
							this._trains.set([]);
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


/**
 * Selects the correct entity based on the specified index in the store, or null if anything was deselected.
 */
function updateSelectionOrNull<T>(value: WritableStore<[T, number] | null>, items: T[]): void
{
	let selection: [T, number] | null = null;
	if (items.length > 0)
	{
		const previous = value.get();
		const selectedIdx = (previous && previous[1] < items.length) ? previous[1] : 0;
		selection = [ items[selectedIdx], selectedIdx ];
	}
	Log.debug("[updateSelectionOrNull] =>", selection);
	value.set(selection);
}



/**
 * If the vehicle is in a moving state, the xyz positions cannot be edited, because
 * the game will automatically discard all change attempts.
 */
function isMoving(status: VehicleStatus): boolean
{
	switch (status)
	{
		case "arriving":
		case "crashing":
		case "departing":
		case "moving_to_end_of_station":
		case "travelling_boat":
		case "travelling_cable_lift":
		case "travelling_dodgems":
		case "travelling":
			return true;
	}
	return false;
}
