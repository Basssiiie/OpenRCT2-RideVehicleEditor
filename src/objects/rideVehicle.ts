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
	 * Returns true if this car does use powered acceleration.
	 * Currently not all vehicle types support this property in
	 * the openrct2 source code.
	 */
	isPowered(): boolean
	{
		const car = this.getCar();
		return RideVehicle.isPowered(car);
	}


	/**
	 * Returns true if this car does use powered acceleration.
	 * Currently not all vehicle types support this property in
	 * the openrct2 source code.
	 * @param car The car for which to check the engine.
	 */
	static isPowered(car: Car)
	{
		const rideObject = context.getObject("ride", car.rideObject);
		const vehicleObject = rideObject.vehicles[car.vehicleObject];

		// 'VEHICLE_ENTRY_FLAG_POWERED' is required.
		return ((vehicleObject.flags & (1 << 19)) !== 0);
	}


	/**
	 * Returns the total amount of mass the guests on the vehicle take up.
	 * @param car The car to calculate the guest mass of.
	 */
	/* // This doesn't work yet because the peep array does not get refreshed properly..
	static massOfPeeps(car: Car)
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