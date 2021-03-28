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
	 */
	static isPowered(car: Car)
	{
		const rideObject = context.getObject("ride", car.rideObject);
		const vehicleObject = rideObject.vehicles[car.vehicleObject];

		// 'VEHICLE_ENTRY_FLAG_POWERED' is required.
		return ((vehicleObject.flags & (1 << 19)) !== 0);
	}
}