import Log from "../utilities/logger";
import RideVehicle from "./rideVehicle";


/**
 * Represents a train with one or more vehicles on a ride in the park.
 */
export default class RideTrain
{
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
	getHeadCar(): Car
	{
		return map.getEntity(this.headCarId) as Car;
	}


	/**
	 * Gets the index at which the specified car is located within the train.
	 * Returns 'null' if the specified car is not part of this train.
	 */
	getCarIndex(carId: number): number | null
	{
		let currentId: number | null = this.headCarId;
		let index = 0;
		while (currentId !== null && currentId !== 0xFFFF)
		{
			if (currentId === carId)
			{
				return index;
			}

			const car = this.getCarEntity(currentId);
			if (car === null)
			{
				break;
			}
			currentId = car.nextCarOnTrain;
			index++;
		}
		return null;
	}


	/**
	 * Gets a list of all cars in this train, from front to back.
	 */
	getVehicles(): RideVehicle[]
	{
		const vehicles: RideVehicle[] = [];
		let currentId: (number | null) = this.headCarId;

		while (currentId != null && currentId != 0xFFFF)
		{
			const vehicle = this.getCarEntity(currentId);
			if (!vehicle)
			{
				break;
			}

			vehicles.push(new RideVehicle(currentId));
			currentId = vehicle.nextCarOnTrain;
		}
		return vehicles;
	}


	// Get the entity for this car id, or print an error if it is not found.
	private getCarEntity(carId: number): (Car | null)
	{
		const entity = map.getEntity(carId);
		if (!entity)
		{
			Log.error(`(train) Entity ${carId} could not be found.`);
			return null;
		}
		const vehicle = entity as Car;
		if (!vehicle)
		{
			Log.error(`(train) Entity ${entity} is not a car.`);
			return null;
		}
		return vehicle;
	}
}