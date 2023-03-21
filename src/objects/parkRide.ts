import { orderByName } from "../utilities/array";
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
		.sort(orderByName)
		.map(r => new ParkRide(r));
}


/**
 * Represents a ride in the park.
 */
export class ParkRide
{
	readonly _id: number;
	private _rideObj?: Ride | null;
	private _trainsObj?: RideTrain[] | null;


	/**
	 * Creates a new park ride object.
	 */
	constructor(ride: Ride);
	constructor(id: number);
	constructor(param: Ride | number)
	{
		if (typeof param === "number")
		{
			this._id = param;
			this._refresh();
		}
		else
		{
			this._id = param.id;
			this._rideObj = param;
		}
	}


	/**
	 * Refresh the internal ride reference object.
	 */
	_refresh(): boolean
	{
		Log.debug("Park ride refresh()");
		this._trainsObj = null;
		const ride = map.getRide(this._id);
		if (ride)
		{
			this._rideObj = ride;
			return true;
		}
		this._rideObj = null;
		return false;
	}


	/**
	 * Gets the associated ride data from the game.
	 */
	_ride(): Ride
	{
		Log.assert(!!this._rideObj, "Selected ride with id", this._id, "is missing.");
		return <Ride>this._rideObj;
	}


	/**
	 * Get all trains on this ride.
	 */
	_trains(): RideTrain[]
	{
		if (!this._trainsObj)
		{
			const trainIds = this._ride().vehicles;
			if (trainIds.indexOf(0xFFFF) >= 0)
			{
				return [];
			}
			this._trainsObj = trainIds.map(r => new RideTrain(r));
		}
		return this._trainsObj;
	}
}