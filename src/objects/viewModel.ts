import { compute, Store, store } from "openrct2-flexui";
import { getAllRides, ParkRide } from "./parkRide";
import { RideTrain } from "./rideTrain";
import { getAllRideTypes, RideType } from "./rideType";
import { RideVehicle } from "./rideVehicle";
import { findIndex } from "../utilities/arrayHelper";



export class ViewModel
{
	readonly selectedRide = store<[ParkRide, number] | null>(null);
	readonly selectedTrain = store<[RideTrain, number] | null>(null);
	readonly selectedVehicle = store<[RideVehicle, number] | null>(null);

	readonly rideTypes = store<RideType[]>([]);
	readonly rides = store<ParkRide[]>([]);
	readonly trains = compute(this.selectedRide, r => (r) ? r[0].trains() : []);
	readonly vehicles = compute(this.selectedTrain, t => (t) ? t[0].vehicles() : []);

	readonly isEditDisabled = compute(this.selectedVehicle, v => !v);
	readonly isUnpowered = compute(this.selectedVehicle, v => !v || !v[0].isPowered());
	readonly multiplier = store<number>(1);

	readonly type = store<[RideType, number] | null>(null);
	readonly variant = store<number>(0);
	readonly trackProgress = store<number>(0);
	readonly seats = store<number>(0);
	readonly mass = store<number>(0);
	readonly poweredAcceleration = store<number>(0);
	readonly poweredMaxSpeed = store<number>(0);

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

				this.type.set((typeIdx === null) ? null : [ types[typeIdx], typeIdx ]);
				this.seats.set(car.numSeats);
				this.poweredAcceleration.set(car.poweredAcceleration);
				this.poweredMaxSpeed.set(car.poweredMaxSpeed);
				updateFromCar(this, car);
			}
		});
	}

	reload(): void
	{
		this.rideTypes.set(getAllRideTypes());
		this.rides.set(getAllRides());
	}

	update(): void
	{
		const vehicle = this.selectedVehicle.get();
		if (vehicle)
		{
			updateFromCar(this, vehicle[0].car());
		}
	}
}




function updateSelectionOrNull<T>(store: Store<[T, number] | null>, items: T[]): void
{
	let selection: [T, number] | null = null;
	if (items.length > 0)
	{
		const previous = store.get();
		const selectedIdx = (previous && previous[1] < items.length) ? previous[1] : 0;
		selection = [ items[selectedIdx], selectedIdx ];
	}
	store.set(selection);
}


function updateFromCar(model: ViewModel, car: Car): void
{
	model.variant.set(car.vehicleObject);
	model.trackProgress.set(car.trackProgress);
	model.mass.set(car.mass);
}