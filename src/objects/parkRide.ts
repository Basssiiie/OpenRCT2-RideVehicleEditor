import * as Log from "../utilities/logger";
import { RideTrain } from "./rideTrain";


/**
 * Gets a list of all rides in the park.
 */
export function getAllRides(): ParkRide[]
{
	return map
		.rides
		.filter(r => r.classification === "ride")
		.sort((a, b) => a.name.localeCompare(b.name))
		.map(r => new ParkRide(r));
}


/**
 * Represents a ride in the park.
 */
export class ParkRide
{
	readonly id: number;
	private _ride?: Ride | null;
	private _trains?: RideTrain[] | null;


	/**
	 * Creates a new park ride object.
	 */
	constructor(ride: Ride);
	constructor(id: number);
	constructor(param: Ride | number)
	{
		if (typeof param === "number")
		{
			this.id = param;
			this.refresh();
		}
		else
		{
			this.id = param.id;
			this._ride = param;
		}
	}


	refresh(): void
	{
		const obj = map.getRide(this.id);
		if (obj)
		{
			this._ride = obj;
			this._trains = null;
		}
		else
		{
			this._ride = null;
		}
	}


	/**
	 * Gets the associated ride data from the game.
	 */
	ride(): Ride
	{
		Log.assert(!!this._ride, `Selected ride with id '${this.id}' is missing.`);
		return <Ride>this._ride;
	}


	/**
	 * Get all trains on this ride.
	 */
	trains(): RideTrain[]
	{
		if (!this._trains)
		{
			const missingTrain = (): void => this.refresh();
			this._trains = this.ride().vehicles.map(r => new RideTrain(r, missingTrain));
		}
		return this._trains;
	}
}