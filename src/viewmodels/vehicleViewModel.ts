import { Colour, compute, Store, store } from "openrct2-flexui";
import { getAllRides, ParkRide } from "../objects/parkRide";
import { RideTrain } from "../objects/rideTrain";
import { getAllRideTypes, RideType } from "../objects/rideType";
import { RideVehicle } from "../objects/rideVehicle";
import { getSpacingToPrecedingVehicle } from "../services/spacingEditor";
import { findIndex } from "../utilities/arrayHelper";
import * as Log from "../utilities/logger";



export class VehicleViewModel
{
	readonly selectedRide = store<[ParkRide, number] | null>(null);
	readonly selectedTrain = store<[RideTrain, number] | null>(null);
	readonly selectedVehicle = store<[RideVehicle, number] | null>(null);

	readonly rideTypes = store<RideType[]>([]);
	readonly rides = store<ParkRide[]>([]);
	readonly trains = compute(this.selectedRide, r => (r) ? r[0].trains() : []);
	readonly vehicles = compute(this.selectedTrain, t => (t) ? t[0].vehicles() : []);

	readonly status = store<VehicleStatus | null>(null);
	readonly isPicking = store<boolean>(false);
	readonly isEditDisabled = compute(this.selectedVehicle, v => !v);
	readonly isUnpowered = compute(this.selectedVehicle, v => !v || !v[0].isPowered());
	readonly isPositionDisabled = compute(this.status, this.isEditDisabled, (s, e) => e || !s || isMoving(s));
	readonly multiplier = store<number>(1);

	readonly type = store<[RideType, number] | null>(null);
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
	 * Reload available rides and ride types.
	 */
	reload(): void
	{
		this.rideTypes.set(getAllRideTypes());
		this.rides.set(getAllRides());
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
	modifyVehicle<T>(action: (vehicle: RideVehicle, value: T) => void, value: T): void
	{
		const vehicle = this.selectedVehicle.get();
		if (vehicle)
		{
			action(vehicle[0], value);
		}
		else
		{
			Log.debug(`Failed to modify vehicle with '${action}' to '${value}'; none is selected.`);
		}
	}
}




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


function updateFromCar(model: VehicleViewModel, car: Car, index: number): void
{
	model.status.set(car.status);
	model.variant.set(car.vehicleObject);
	model.mass.set(car.mass);
	model.trackProgress.set(car.trackProgress);
	model.x.set(car.x);
	model.y.set(car.y);
	model.z.set(car.z);

	const train = model.selectedTrain.get();
	if (train)
	{
		model.spacing.set(getSpacingToPrecedingVehicle(train[0], car, index));
	}
}
