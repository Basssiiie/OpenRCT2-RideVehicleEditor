import * as Log from "../utilities/logger";


/**
 * A single vehicle on a train currently in the park.
 */
export class RideVehicle
{
	readonly id: number;
	private _entity?: Car | null;
	private _type?: RideObjectVehicle | null;


	/**
	 * Creates a new ride vehicle to wrap a car.
	 */
	constructor(car: Car);
	constructor(id: number);
	constructor(param: Car | number)
	{
		if (typeof param === "number")
		{
			this.id = param;
			this.refresh();
		}
		else
		{
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			this.id = param.id!;
			this._entity = param;
		}
		Log.assert(typeof this.id === "number", "Ride vehicle entity is invalid.");
	}


	/**
	 * Refreshes the referenced entity for this vehicle, in case it got respawned.
	 */
	refresh(): boolean
	{
		const car = map.getEntity(this.id);
		if (car && car.type === "car")
		{
			this._entity = <Car>car;
			return true;
		}

		Log.debug(`Ride vehicle refresh(): selected car with id '${this.id}' went missing.`);
		this._entity = null;
		return false;
	}


	/**
	 * Gets the associated vehicle data from the game.
	 */
	car(): Car
	{
		Log.assert(!!this._entity, `Selected car with id '${this.id}' is missing.`);
		Log.assert(this._entity?.type === "car", `Selected car with id '${this.id}' is not of type 'car', but of type '${this._entity?.type}'.`);
		return <Car>this._entity;
	}


	/**
	 * Returns the object definition for this car.
	 */
	type(): RideObjectVehicle
	{
		if (!this._type)
		{
			const entity = this.car();
			const rideObject = context.getObject("ride", entity.rideObject);
			this._type = rideObject.vehicles[entity.vehicleObject];
		}
		return this._type;
	}


	/**
	 * Returns true if this car does use powered acceleration.
	 * Currently not all vehicle types support this property in
	 * the openrct2 source code.
	 */
	isPowered(): boolean
	{
		// 'VEHICLE_ENTRY_FLAG_POWERED' is required.
		return !!(this.type().flags & (1 << 19));
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