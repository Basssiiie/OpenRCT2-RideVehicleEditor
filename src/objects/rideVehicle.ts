import * as Log from "../utilities/logger";
import { isPowered } from "./rideVehicleVariant";


/**
 * A single vehicle on a train currently in the park.
 */
export class RideVehicle
{
	readonly _id: number;
	private _entity?: Car | null;
	private _vehicleObject?: RideObjectVehicle | null;
	private _typeHash?: number;


	/**
	 * Creates a new ride vehicle to wrap a car.
	 */
	constructor(car: Car);
	constructor(id: number);
	constructor(param: Car | number)
	{
		if (typeof param === "number")
		{
			this._id = param;
			this._refresh();
		}
		else
		{
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			this._id = param.id!;
			this._entity = param;
		}
		Log.assert(typeof this._id === "number", "Ride vehicle entity is invalid.");
	}


	/**
	 * Refreshes the referenced entity for this vehicle, in case it got respawned.
	 */
	_refresh(): boolean
	{
		const car = map.getEntity(this._id);
		if (car && car.type === "car")
		{
			this._entity = <Car>car;
			return true;
		}

		Log.debug("Ride vehicle refresh(): selected car with id", this._id, "went missing.");
		this._entity = null;
		return false;
	}


	/**
	 * Gets the associated vehicle data from the game.
	 */
	_car(): Car
	{
		Log.assert(!!this._entity, "Selected car with id", this._id, "is missing.");
		Log.assert(this._entity?.type === "car", "Selected car with id", this._id, "is not of type 'car', but of type", this._entity?.type);
		return <Car>this._entity;
	}


	/**
	 * Returns the object definition for this car.
	 */
	_type(): RideObjectVehicle | null
	{
		const entity = this._car();
		const rideObj = entity.rideObject;
		const vehicleObj = entity.vehicleObject;
		const hash = ((rideObj << 2) | vehicleObj); // ensure ride type and vehicle are unchanged

		if (!this._vehicleObject || hash !== this._typeHash)
		{
			const rideObject = context.getObject("ride", rideObj);
			if (!rideObject)
			{
				return null;
			}
			this._vehicleObject = rideObject.vehicles[vehicleObj];
			this._typeHash = hash;
		}
		return this._vehicleObject;
	}


	/**
	 * Returns true if this car does use powered acceleration.
	 * Currently not all vehicle types support this property in
	 * the openrct2 source code.
	 */
	_isPowered(): boolean
	{
		const type = this._type();
		return !type || isPowered(type);
	}


	/**
	 * Returns the total amount of mass the guests on the vehicle take up.
	 * @param car The car to calculate the guest mass of.
	 */
	/* // This doesn't work yet because the peep array does not get refreshed properly..
	static massOfPeeps(car: Car): number
	{
		const guests = car.peeps;
		let totalGuestMass = 0;
		for (let i = 0; i < guests.length; i++)
		{
			const peepId = guests[i];
			if (peepId !== null)
			{
				const guest = map.getEntity(peepId) as Guest;
				if (guest)
				{
					totalGuestMass += guest.mass;
				}
			}
		}
		return totalGuestMass;
	}
	*/
}