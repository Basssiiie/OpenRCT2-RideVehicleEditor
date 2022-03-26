import { ParkRide } from "../objects/parkRide";
import { RideTrain } from "../objects/rideTrain";
import { RideVehicle } from "../objects/rideVehicle";
import * as ArrayHelper from "../utilities/arrayHelper";
import * as Log from "../utilities/logger";
import * as MathHelper from "../utilities/mathHelper";
import Observable from "../utilities/observable";


/**
 * Service that allows to select a single vehicle in the park.
 */
export default class VehicleSelector
{
	readonly ridesInPark = new Observable<ParkRide[]>([]);
	readonly trainsOnRide = new Observable<RideTrain[]>([]);
	readonly vehiclesOnTrain = new Observable<RideVehicle[]>([]);


	/**
	 * Returns the currently selected ride, if any was selected.
	 */
	readonly ride = new Observable<ParkRide | null>(null);


	/**
	 * Returns the currently selected train, if any was selected.
	 */
	readonly train = new Observable<RideTrain | null>(null);


	/**
	 * Returns the currently selected vehicle, if any was selected.
	 */
	readonly vehicle = new Observable<RideVehicle | null>(null);


	/**
	 * Index into the 'ridesInPark' array for the selected ride.
	 */
	get rideIndex(): number | null
	{
		return this._rideIndex;
	}
	private _rideIndex: number | null = null;


	/**
	 * Returns the currently selected train, if any was selected.
	 */
	get trainIndex(): number | null
	{
		return this._trainIndex;
	}
	private _trainIndex: number | null = null;


	/**
	 * Returns the currently selected vehicle, if any was selected.
	 */
	get vehicleIndex(): number | null
	{
		return this._vehicleIndex;
	}
	private _vehicleIndex: number | null = null;


	/**
	 * Reloads the list with rides in the park.
	 */
	reloadRideList(): void
	{
		const lastSelectedRide = this.ride.get();
		Log.debug(`(selector) Reloading the list of rides in the park. (last selected: '${lastSelectedRide?.ride().name}', idx: ${this._rideIndex})`);

		const rides = ParkRide.getAllRides();
		this.ridesInPark.set(rides);

		if (lastSelectedRide && this._rideIndex !== null)
		{
			const newlySelectedRide = rides[this._rideIndex];
			if (newlySelectedRide && newlySelectedRide.id === lastSelectedRide.id)
			{
				// Position is still the same in the new list.
				return;
			}

			// Ride index has changed; find the new index.
			const rideIndex = ArrayHelper.findIndex(rides, r => r.id === lastSelectedRide.id);
			if (rideIndex === null)
			{
				// Not found, reset to ride at index 0.
				Log.debug(`(selector) Last selected ride not found, reset to first in list.`);
				this.selectRide(0);
				return;
			}

			// Only need to update the dropdown, rest of UI needs no refresh.
			Log.debug(`(selector) Last selected ride has moved: idx ${this._rideIndex} -> idx ${rideIndex}.`);
			this._rideIndex = rideIndex;
			this.ride.set(rides[rideIndex]);
		}
	}


	/**
	 * Select a ride from the list in the park.
	 * @param rideIndex The index into the ride list.
	 * @param trainIndex The index of the train in the train list.
	 * @param vehicleIndex The index of the vehicle in the vehicle list.
	 */
	selectRide(rideIndex: number, trainIndex: number = 0, vehicleIndex: number = 0): void
	{
		const ridesInPark = this.ridesInPark.get();

		if (ridesInPark.length === 0)
		{
			Log.debug("(selector) Cannot select ride, this park has no rides.");
			this._rideIndex = null;
			this.ride.set(null);
			this.deselect();
			return;
		}

		this._rideIndex = rideIndex = MathHelper.clamp(rideIndex, 0, ridesInPark.length);

		const ride = this.ridesInPark.get()[rideIndex];
		Log.debug(`(selector) Selected ride '${ride.ride().name}' (index: ${rideIndex}, range: 0<->${ridesInPark.length}))`);
		this.ride.set(ride);

		this.trainsOnRide.set(ride.trains());
		this.selectTrain(trainIndex, vehicleIndex);
	}


	/**
	 * Selects a train from the list of trains of the selected ride.
	 * @param trainIndex The index of the train in the train list.
	 * @param vehicleIndex The index of the vehicle in the vehicle list.
	 */
	selectTrain(trainIndex: number, vehicleIndex: number = 0): void
	{
		const trains = this.trainsOnRide.get();

		if (trains.length === 0)
		{
			Log.debug("(selector) Cannot select train, this ride has no trains.");
			this.deselect();
			return;
		}

		this._trainIndex = trainIndex = MathHelper.clamp(trainIndex, 0, trains.length);

		const train = trains[trainIndex];
		Log.debug(`(selector) Selected train at index ${trainIndex} (range: 0<->${trains.length}).`);
		this.train.set(train);

		this.vehiclesOnTrain.set(train.vehicles());
		this.selectVehicle(vehicleIndex);
	}


	/**
	 * Selects a vehicle from the list of vehicles of the selected train.
	 * @param vehicleIndex The index of the vehicle in the vehicle list.
	 */
	selectVehicle(vehicleIndex: number): void
	{
		const vehicles = this.vehiclesOnTrain.get();

		if (vehicles.length === 0)
		{
			Log.debug("(selector) This train has no vehicles.");
			this.deselect();
			return;
		}

		this._vehicleIndex = vehicleIndex = MathHelper.clamp(vehicleIndex, 0, vehicles.length);

		const vehicle = vehicles[vehicleIndex];
		Log.debug(`(selector) Selected vehicle at index ${vehicleIndex}. (range: 0<->${vehicles.length})`);
		this.vehicle.set(vehicle);
	}


	/**
	 * Selects a vehicle from an entity id.
	 * @param entityId The id of the entity in the game.
	 */
	selectEntity(entityId: number): void
	{
		const entity = map.getEntity(entityId);
		if (!entity || entity.type !== "car")
		{
			Log.debug(`(selector) Invalid entity id selected: ${entityId}.`);
			return;
		}

		const car = entity as Car;
		const rideId = car.ride;

		const carRideIndex = ArrayHelper.findIndex(this.ridesInPark.get(), r => r.id === rideId);
		if (carRideIndex === null)
		{
			Log.debug(`(selector) Could not find ride id ${carRideIndex} for selected entity id ${entityId}.`);
			return;
		}

		this.selectRide(carRideIndex);

		let trainIndex = 0, vehicleIndex: number | null = null;
		for (const train of this.trainsOnRide.get())
		{
			vehicleIndex = train.getCarIndex(entityId);
			if (vehicleIndex !== null)
			{
				this.selectTrain(trainIndex, vehicleIndex);
				break;
			}
			trainIndex++;
		}
	}


	/**
	 * Disables the editor controls and sets the selected train and vehicle to null.
	 */
	deselect(): void
	{
		Log.debug(`(selector) Deselect vehicle.`);

		this.trainsOnRide.set([]);
		this.vehiclesOnTrain.set([]);

		this._trainIndex = null;
		this._vehicleIndex = null;

		this.train.set(null);
		this.vehicle.set(null);
	}
}
