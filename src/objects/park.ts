import RideTrain from "./rideTrain";


/**
 * Module helper to get information about the park.
 */
module Park
{
	/**
	 * Gets a list of all rides in the park.
	 */
	export function getRides(): ParkRide[]
	{
		return map
			.rides
			.filter(r => r.classification === "ride")
			.map(r => new ParkRide(r.id, r.name))
			.sort((a, b) => a.name.localeCompare(b.name));
	}
}
export default Park;


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
}