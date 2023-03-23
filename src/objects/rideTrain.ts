import * as Log from "../utilities/logger";
import { isNull, isNumber } from "../utilities/type";
import { getCarById, RideVehicle } from "./rideVehicle";


/**
 * Creates a train from any car regardless at what index it is.
 * @returns The train and the index where the original car is.
 */
export function createTrainFromAnyCar(car: Car): [RideTrain, number]
{
	const vehicles: RideVehicle[] = [];

	// Insert all vehicles in front
	let currentCar: Car | null = car, currentCarId: number | null;
	while(!isNull(currentCarId = currentCar.previousCarOnRide))
	{
		currentCar = getCarById(currentCarId);
		if (!currentCar || isNull(currentCar.nextCarOnTrain))
		{
			break;
		}
		vehicles.unshift(new RideVehicle(currentCar));
	}

	const carIndex = vehicles.length;
	vehicles.push(new RideVehicle(car));

	// Insert all vehicles behind
	for (currentCar = car; !isNull(currentCarId = currentCar.nextCarOnTrain);)
	{
		currentCar = getCarById(currentCarId);
		if (!currentCar)
		{
			break;
		}
		vehicles.push(new RideVehicle(currentCar));
	}
	return [new RideTrain(vehicles, true), carIndex];
}


/**
 * Represents a train with one or more vehicles on a ride in the park.
 */
export class RideTrain
{
	readonly _carId: number;
	readonly _special?: boolean;
	private _rideVehicles?: RideVehicle[] | null;


	/**
	 * Creates a new train for a ride.
	 * @param frontCarId The entity id for the first car of this train.
	 * @param vehicles The list of all vehicles in the train.
	 * @param special Sets it as a special hidden train, which does not show up in
	 * the regular ride window (like Giga lifthill entities).
	 */
	constructor(frontCarId: number, special?: boolean);
	constructor(vehicles: RideVehicle[], special?: boolean);
	constructor(param: number | RideVehicle[], special?: boolean)
	{
		if (isNumber(param))
		{
			Log.assert(param !== 0xFFFF, "Invalid car id");
			this._carId = param;
			this._refresh();
		}
		else
		{
			Log.assert(param.length > 0, "Invalid train length");
			this._carId = param[0]._id;
			this._rideVehicles = param;
		}
		this._special = special;
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
			&& (car = getCarById(currentId)))
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