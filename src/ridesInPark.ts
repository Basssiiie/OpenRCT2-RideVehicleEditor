/**
 * Gets a list of all rides in the park.
 */
export function getRidesInPark(): ParkRide[] {
	console.log("Get ride names");

	return map
		.rides
		.map(r => new ParkRide(r.id, r.name))
		.sort((a, b) => a.name.localeCompare(b.name));
}


/**
 * Represents a ride in the park.
 */
export class ParkRide {
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
	getRide(): Ride {
		return map.getRide(this.rideId);
	}


	/**
	 * Get all trains on this ride.
	 */
	getTrains(): ParkRideTrain[] {
		const ride = this.getRide();

		return ride
			.vehicles
			.map((r, i) => new ParkRideTrain(i, r));
	}
}


/**
 * Represents a train on a ride in the park.
 */
export class ParkRideTrain {
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
	getHeadCar(): Car {
		return map.getEntity(this.headCarId) as Car;
	}


	/**
	 * Gets a list of all cars in this train, from front to back.
	 */
	getVehicles(): ParkRideVehicle[] {
		const vehicles: ParkRideVehicle[] = [];
		let currentId = this.headCarId;

		while (currentId) {
			vehicles.push(new ParkRideVehicle(currentId));

			const vehicle = map.getEntity(currentId) as Car;
			currentId = vehicle.nextCarOnTrain;
		}
		return vehicles;
	}
}


export class ParkRideVehicle {
	/**
	 * @param entityId Gets the id of the associated entity in the park.
	 */
	constructor(
		readonly entityId: number
	) { }


	/**
	 * Gets the associated vehicle data from the game.
	 */
	getCar(): Car {
		return map.getEntity(this.entityId) as Car;
	}
}
