/**
 * A single vehicle on a train currently in the park.
 */
export default class RideVehicle
{
	/**
	 * @param entityId Gets the id of the associated entity in the park.
	 */
	constructor(readonly entityId: number) { }


	/**
	 * Gets the associated vehicle data from the game.
	 */
	getCar(): Car
	{
		return map.getEntity(this.entityId) as Car;
	}


	/**
	 * Returns the object definition fpr this car.
	 */
	getDefinition(): RideObjectVehicle
	{
		return RideVehicle.getDefinition(this.getCar());
	}


	/**
	 * Returns true if this car does use powered acceleration.
	 * Currently not all vehicle types support this property in
	 * the openrct2 source code.
	 */
	isPowered(): boolean
	{
		return RideVehicle.isPowered(this.getDefinition());
	}


	/**
	 * Returns the object definition for this car.
	 */
	static getDefinition(car: Car): RideObjectVehicle
	{
		const rideObject = context.getObject("ride", car.rideObject);
		return rideObject.vehicles[car.vehicleObject];
	}


	/**
	 * Returns true if this vehicle does use powered acceleration.
	 * Currently not all vehicle types support this property in
	 * the openrct2 source code.
	 * @param vehicle The vehicle definition for which to check the engine.
	 */
	static isPowered(vehicle: RideObjectVehicle): boolean
	{
		// 'VEHICLE_ENTRY_FLAG_POWERED' is required.
		return ((vehicle.flags & (1 << 19)) !== 0);
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