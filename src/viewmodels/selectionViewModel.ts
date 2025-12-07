import { compute, store } from "openrct2-flexui";
import { getAllRides, ParkRide } from "../objects/parkRide";
import { createTrainFromAnyCar, RideTrain } from "../objects/rideTrain";
import { RideVehicle } from "../objects/rideVehicle";
import { findIndex } from "../utilities/array";
import * as Log from "../utilities/logger";
import { isNull } from "../utilities/type";


/**
 * View model for managing the currently selected vehicle.
 */
export class SelectionViewModel
{
	readonly _ride = store<[ParkRide, number] | null>(null);
	readonly _train = store<[RideTrain, number] | null>(null);
	readonly _vehicle = store<[RideVehicle, number] | null>(null);

	readonly _allRides = store<ParkRide[]>([]);
	readonly _allTrains = compute(this._ride, r => (r ? r[0]._trains() : []));
	readonly _allVehicles = compute(this._train, t => (t ? t[0]._vehicles() : []));

	_isOpen?: boolean;
	private _missingRideEntity?: ParkRide;

	constructor()
	{
		this._allRides.set(getAllRides());
	}

	/**
	 * Select a specific ride by index.
	 */
	_setRide(index: number): void
	{
		const rides = this._allRides.get();
		const count = rides.length;
		const idx = (index + count) % count;

		if (!this._isOpen || !count)
		{
			return;
		}

		this._ride.set([rides[idx], idx]);
		this._checkMissingRideEntry(this._missingRideEntity, rides);
	}

	/**
	 * Select a specific train by index.
	 */
	_setTrain(index: number): void
	{
		const trains = this._allTrains.get();
		const count = trains.length;
		const idx = (index + count) % count;

		if (!this._isOpen || !count)
		{
			return;
		}

		this._train.set([trains[idx], idx]);
	}

	/**
	 * Select a specific vehicle by index.
	 */
	_setVehicle(index: number): void
	{
		const vehicles = this._allVehicles.get();
		const count = vehicles.length;
		const idx = (index + count) % count;

		if (!this._isOpen || !count)
		{
			return;
		}

		this._vehicle.set([vehicles[idx], idx]);
	}

	/**
	 * Select a specific car entity.
	 */
	_setFromCar(car: Car): void
	{
		const rides = this._allRides.get();
		const carId = car.id;
		const rideId = car.ride;
		const carRideIndex = findIndex(rides, r => r._id === rideId);
		const selectedRide = this._ride;
		let trains: RideTrain[];

		if (isNull(carRideIndex)) // Fallback for missing ride id.
		{
			Log.debug("Could not find ride id", rideId, "for selected entity id", carId, ", adding special ride");
			const missingRide = this._missingRideEntity ||= new ParkRide(<never>{
				id: -1,
				name: "(missing ride)",
				vehicles: []
			});
			const missingRideIdx = rides.indexOf(missingRide);
			missingRide._missing = true;

			if (missingRideIdx === -1) // Add to rides list, if not there yet.
			{
				this._allRides.set(rides.concat(missingRide));
				selectedRide.set([missingRide, rides.length]);
			}
			else // Else try to select it if not yet selected
			{
				const selected = selectedRide.get();
				if (!selected || selected[0] !== missingRide)
				{
					selectedRide.set([missingRide, missingRideIdx]);
				}
			}

			trains = [];
		}
		else
		{
			this._checkMissingRideEntry(this._missingRideEntity, rides);

			selectedRide.set([rides[carRideIndex], carRideIndex]);
			trains = this._allTrains.get();

			for (let t = 0; t < trains.length; t++)
			{
				const vehicles = trains[t]._vehicles();
				for (let v = 0; v < vehicles.length; v++)
				{
					if (vehicles[v]._id === carId)
					{
						this._train.set([trains[t], t]);
						this._vehicle.set([vehicles[v], v]);
						return;
					}
				}
			}

			Log.debug("Could not find vehicle entity id", carId, "on ride id", rideId, ", adding special train");
		}

		// Fallback for creating unknown train.
		const [specialTrain, carIndex] = createTrainFromAnyCar(car);
		const vehicle = specialTrain._vehicles()[carIndex];

		this._allTrains.set(trains.concat(specialTrain));
		this._train.set([specialTrain, trains.length]);
		this._vehicle.set([vehicle, carIndex]);
	}

	/**
	 * Removes the missing ride entry if it is present in the rides list.
	 */
	private _checkMissingRideEntry(missingRide: ParkRide | undefined, rides: ParkRide[]): void
	{
		if (missingRide && rides.indexOf(missingRide) != -1)
		{
			Log.debug("Clearing missing ride entry from rides list");
			this._allRides.set(rides.filter(ride => ride !== missingRide));
		}
	}
}
