import { Colour, compute, Store, store } from "openrct2-flexui";
import { getAllRides, ParkRide } from "../objects/parkRide";
import { RideTrain } from "../objects/rideTrain";
import { getAllRideTypes, RideType } from "../objects/rideType";
import { RideVehicle } from "../objects/rideVehicle";
import { getSpacingToPrecedingVehicle } from "../services/spacingEditor";
import { CopyFilter, CopyOptions, getTargets, VehicleSettings } from "../services/vehicleCopier";
import { VehicleSpan } from "../services/vehicleSpan";
import { findIndex } from "../utilities/arrayHelper";
import * as Log from "../utilities/logger";


/**
 * Viewmodel for the currently selected vehicle.
 */
export class VehicleViewModel
{
	readonly selectedRide = store<[ParkRide, number] | null>(null);
	readonly selectedTrain = store<[RideTrain, number] | null>(null);
	readonly selectedVehicle = store<[RideVehicle, number] | null>(null);

	readonly rideTypes = store<RideType[]>([]);
	readonly rides = store<ParkRide[]>([]);
	readonly trains = compute(this.selectedRide, r => (r) ? r[0].trains() : []);
	readonly vehicles = compute(this.selectedTrain, t => (t) ? t[0].vehicles() : []);

	readonly isMoving = store(false);
	readonly isUnpowered = compute(this.selectedVehicle, v => !v || !v[0].isPowered());
	readonly isPicking = store<boolean>(false);
	readonly isEditDisabled = compute(this.selectedVehicle, v => !v);
	readonly isPositionDisabled = compute(this.isMoving, this.isEditDisabled, (m, e) => m || e);
	readonly formatPosition = (pos: number): string => (this.isEditDisabled.get() ? "Not available" : pos.toString());
	readonly multiplier = store<number>(1);

	readonly type = store<[RideType, number] | null>(null);
	readonly maximumVariants = compute(this.type, t => (t) ? t[0].variants() : 4);
	readonly variant = store<number>(0);
	readonly seats = store<number>(0);
	readonly mass = store<number>(0);
	readonly poweredAcceleration = store<number>(0);
	readonly poweredMaxSpeed = store<number>(0);
	readonly trackProgress = store<number>(0);
	readonly spacing = store<number | null>(0);
	readonly x = store<number>(0);
	readonly y = store<number>(0);
	readonly z = store<number>(0);

	readonly primaryColour = store<Colour>(0);
	readonly secondaryColour = store<Colour>(0);
	readonly tertiaryColour = store<Colour>(0);

	readonly copyFilters = store<CopyFilter>(0);
	readonly copyTargetOption = store<CopyOptions>(0);
	readonly copyTargets = compute(this.copyTargetOption, this.selectedVehicle, (o, v) => getTargets(o, this.selectedRide.get(), this.selectedTrain.get(), v));
	readonly synchronizeTargets = store<boolean>(false);
	readonly clipboard = store<VehicleSettings | null>(null);

	private _onPlayerAction?: IDisposable;

	constructor()
	{
		this.rides.subscribe(r => updateSelectionOrNull(this.selectedRide, r));
		this.trains.subscribe(t => updateSelectionOrNull(this.selectedTrain, t));
		this.vehicles.subscribe(v => updateSelectionOrNull(this.selectedVehicle, v));

		this.selectedVehicle.subscribe(v =>
		{
			if (v)
			{
				const vehicle = v[0], car = vehicle.car(), types = this.rideTypes.get();
				const typeIdx = findIndex(types, t => t.id === car.rideObject);
				const colours = car.colours;

				this.type.set((typeIdx === null) ? null : [ types[typeIdx], typeIdx ]);
				this.seats.set(car.numSeats);
				this.poweredAcceleration.set(car.poweredAcceleration);
				this.poweredMaxSpeed.set(car.poweredMaxSpeed);
				this.primaryColour.set(colours.body);
				this.secondaryColour.set(colours.trim);
				this.tertiaryColour.set(colours.tertiary);
				updateFromCar(this, car, v[1]);
			}
		});
	}

	/**
	 * Reload available rides and ride types when the window opens.
	 */
	open(): void
	{
		this.rideTypes.set(getAllRideTypes());
		this.rides.set(getAllRides());

		this._onPlayerAction ||= context.subscribe("action.execute", e => this._onPlayerActionExecuted(e));
	}

	/**
	 * Disposes events that were being listened for.
	 */
	close(): void
	{
		if (this._onPlayerAction)
		{
			this._onPlayerAction.dispose();
		}
		this._onPlayerAction = undefined;
	}

	/**
	 * Synchronise the data of the model with the car.
	 */
	update(): void
	{
		const vehicle = this.selectedVehicle.get();
		if (vehicle)
		{
			updateFromCar(this, vehicle[0].car(), vehicle[1]);
		}
	}

	/**
	 * Select a specific car entity.
	 */
	select(car: Car): void
	{
		const
			rides = this.rides.get(),
			carId = car.id,
			rideId = car.ride,
			carRideIndex = findIndex(rides, r => r.id === rideId);

		if (carRideIndex === null)
		{
			Log.debug(`Could not find ride id ${rideId} for selected entity id ${carId}.`);
			return;
		}

		this.selectedRide.set([ rides[carRideIndex], carRideIndex ]);

		const trains = this.trains.get();
		for (let t = 0; t < trains.length; t++)
		{
			const vehicles = trains[t].vehicles();
			for (let v = 0; v < vehicles.length; v++)
			{
				if (vehicles[v].id === carId)
				{
					this.selectedTrain.set([ trains[t], t ]);
					this.selectedVehicle.set([ vehicles[v], v ]);
					return;
				}
			}
		}
	}

	/**
	 * Attempt to modify the vehicle with the specified action, if a vehicle is selected.
	 */
	modifyVehicle<T>(action: (vehicles: VehicleSpan[], value: T) => void, value: T): void
	{
		const vehicle = this.selectedVehicle.get();
		if (vehicle)
		{
			if (this.synchronizeTargets.get())
			{
				action(this.copyTargets.get(), value);
			}
			else
			{
				action([[ vehicle[0].id, 1 ]], value);
			}
		}
		else
		{
			Log.debug(`Failed to modify vehicle with '${action}' to '${value}'; none is selected.`);
		}
	}

	/**
	 * Toggle a filter on or off.
	 */
	setFilter(filter: CopyFilter, toggle: boolean): void
	{
		const enabledFilters = this.copyFilters.get();

		this.copyFilters.set((toggle)
			? (enabledFilters | filter)
			: (enabledFilters & ~filter)
		);
	}


	/**
	 * Triggers for every executed player action.
	 * @param event The arguments describing the executed action.
	 */
	private _onPlayerActionExecuted(event: GameActionEventArgs): void
	{
		const action = event.action as ActionType;
		switch (action)
		{
			case "ridecreate":
			case "ridedemolish":
			case "ridesetname":
			{
				this.rides.set(getAllRides());
				break;
			}
			/* case "ridesetstatus": // close/reopen ride
			{
				const index = this.selector.rideIndex;
				if (index !== null)
				{
					const ride = this.selector.ride.get();
					const statusUpdate = (event.args as RideSetStatusArgs);

					if (ride !== null && ride.rideId === statusUpdate.ride)
					{
						Log.debug("(watcher) Ride status changed.");
						this.selector.selectRide(index, this.selector.trainIndex ?? 0, this.selector.vehicleIndex ?? 0);
					}
				}
				break;
			} */
		}

		Log.debug(`<${action}>\n\t- type: ${event.type}\n\t- args: ${JSON.stringify(event.args)}\n\t- result: ${JSON.stringify(event.result)}`);
	}
}



/**
 * Selects the correct entity based on the specified index, or null if anything was deselected.
 */
function updateSelectionOrNull<T>(value: Store<[T, number] | null>, items: T[]): void
{
	let selection: [T, number] | null = null;
	if (items.length > 0)
	{
		const previous = value.get();
		const selectedIdx = (previous && previous[1] < items.length) ? previous[1] : 0;
		selection = [ items[selectedIdx], selectedIdx ];
	}
	value.set(selection);
}


/**
 * Updates the viewmodel with refreshed information from a car entity.
 */
function updateFromCar(model: VehicleViewModel, car: Car, index: number): void
{
	model.variant.set(car.vehicleObject);
	model.mass.set(car.mass);
	model.trackProgress.set(car.trackProgress);
	model.x.set(car.x);
	model.y.set(car.y);
	model.z.set(car.z);

	const train = model.selectedTrain.get();
	if (train)
	{
		const status = train[0].at(0).car().status;
		model.isMoving.set(isMoving(status));
		model.spacing.set(getSpacingToPrecedingVehicle(train[0], car, index));
	}
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
