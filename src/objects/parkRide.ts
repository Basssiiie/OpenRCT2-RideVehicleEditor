import RideTrain from "./rideTrain";


/**
 * Represents a ride in the park.
 */
export default class ParkRide
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
	getRideData(): Ride
	{
		return map.getRide(this.rideId);
	}


	/**
	 * Get all trains on this ride.
	 */
	getTrains(): RideTrain[]
	{
		const ride = this.getRideData();
		return ride
			.vehicles
			.map((r, i) => new RideTrain(i, r));
	}


	/**
	 * Gets a list of all rides in the park.
	 */
	static getAllRides(): ParkRide[]
	{
		return map
			.rides
			.filter(r => r.classification === "ride")
			.map(r => new ParkRide(r.id, r.name))
			.sort((a, b) => a.name.localeCompare(b.name));
	}
}