import { error, log } from "./utilityHelpers";

/**
 * Gets a list of all rides in the park.
 */
export function getRidesInPark(): ParkRide[]
{
	log("Get ride names");

	return map
		.rides
		.filter(r => r.classification == "ride")
		.map(r => new ParkRide(r.id, r.name))
		.sort((a, b) => a.name.localeCompare(b.name));
}


/**
 * Represents a ride in the park.
 */
export class ParkRide
{
	/**
	 * @param index Gets the id of this ride in the current park.
	 * @param name Gets the name of the ride.
	 */
	constructor(
		readonly rideId: number,
		readonly name: string
	) { }


	/**
	 * Gets the associated ride data from the game.
	 */
	getRide(): Ride
	{
		return map.getRide(this.rideId);
	}


	/**
	 * Get all trains on this ride.
	 */
	getTrains(): RideTrain[]
	{
		const ride = this.getRide();

		return ride
			.vehicles
			.map((r, i) => new RideTrain(i, r));
	}
}


/**
 * Represents a train on a ride in the park.
 */
export class RideTrain
{
	/**
	 * @param index Gets the index of the train for this ride (0-3).
	 * @param headCarId Gets the entity id for the first car of this train.
	 */
	constructor(
		readonly index: number,
		readonly headCarId: number
	) { }


	/**
	 * Gets the first car of this train.
	 */
	getHeadCar(): Car
	{
		return map.getEntity(this.headCarId) as Car;
	}


	/**
	 * Gets a list of all cars in this train, from front to back.
	 */
	getVehicles(): RideVehicle[]
	{
		const vehicles: RideVehicle[] = [];
		let currentId: (number | null) = this.headCarId;

		while (currentId != null && currentId != 0xFFFF)
		{
			const vehicle = this.getCarEntity(currentId);
			if (!vehicle)
			{
				break;
			}

			vehicles.push(new RideVehicle(currentId));
			currentId = vehicle.nextCarOnTrain;
		}
		return vehicles;
	}


	// Get the entity for this car id, or print an error if it is not found.
	private getCarEntity(carId: number): (Car | null)
	{
		const entity = map.getEntity(carId);
		if (!entity)
		{
			error(`Entity ${carId} could not be found.`, "getVehicles");
			return null;
		}
		const vehicle = entity as Car;
		if (!vehicle)
		{
			error(`Entity ${entity} is not a car.`, "getVehicles");
			return null;
		}
		return vehicle;
	}
}


export class RideVehicle
{
	/**
	 * @param entityId Gets the id of the associated entity in the park.
	 */
	constructor(
		readonly entityId: number
	) { }


	/**
	 * Gets the associated vehicle data from the game.
	 */
	getCar(): Car
	{
		return map.getEntity(this.entityId) as Car;
	}
}
