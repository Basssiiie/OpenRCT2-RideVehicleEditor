import * as Log from "../utilities/logger";
import { RideVehicle } from "./rideVehicle";


/**
 * Represents a train with one or more vehicles on a ride in the park.
 */
export class RideTrain
{
	readonly _carId: number;
	private _rideVehicles?: RideVehicle[] | null;


	/**
	 * Creates a new train for a ride.
	 * @param carId Gets the entity id for the first car of this train.
	 */
	constructor(carId: number)
	{
		Log.assert(carId !== 0xFFFF, "Invalid car id");
		this._carId = carId;
		this._refresh();
	}


	/**
	 * Refreshes the vehicle entities for this train, in case they got respawned.
	 */
	_refresh(): boolean
	{
		const vehicleList: RideVehicle[] = [];

		let currentId: (number | null) = this._carId;
		let car: Car | null = null;

		while (currentId != null
			&& currentId != 0xFFFF // = invalid vehicle
			&& (car = <Car>map.getEntity(currentId))
			&& car.type === "car")
		{
			vehicleList.push(new RideVehicle(car));
			currentId = car.nextCarOnTrain;
		}

		if (vehicleList.length > 0)
		{
			this._rideVehicles = vehicleList;
			return true;
		}

		Log.debug("Ride train refresh(): selected train with id", this._carId, "went missing.");
		this._rideVehicles = null;
		return false;
	}


	/**
	 * Gets a list of all cars in this train, from front to back.
	 */
	_vehicles(): RideVehicle[]
	{
		Log.assert(!!this._rideVehicles, "Selected train with car id", this._carId, "is missing.");
		return <RideVehicle[]>this._rideVehicles;
	}


	/**
	 * Gets the vehicle at the specific index.
	 */
	_at(index: number): RideVehicle
	{
		const vehicles = this._vehicles();
		Log.assert(0 <= index && index < vehicles.length, "Vehicle index", index, "out of range for train of length", vehicles.length);
		return vehicles[index];
	}
}