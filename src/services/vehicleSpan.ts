import { getCarById } from "../objects/rideVehicle";
import { isNull } from "../utilities/type";
import { invoke, refreshVehicle } from "./events";

/**
 * A tuple for targeting a span of entities. The first tuple value specifies a car id,
 * the second tuple value specifies to how many vehicles and the third tuple
 * specifies every number of vehicles to which the change should be applied
 *
 * For example: `[33, 10, 4]` applies the paste from the vehicle with id 33 to ten
 * vehicles, every fourth vehicle. A `null` in the second tuple applies the paste
 * from the first vehicle to the end of the train.
 */
export type VehicleSpan = [number, number | null, number];


/**
 * Applies a specific callback for each vehicle in the specified list of vehicle spans.
 */
export function forEachVehicle(vehicles: VehicleSpan[], action: (car: Car, index: number) => void): void
{
	for (let s = 0, sl = vehicles.length; s < sl; s++)
	{
		const span = vehicles[s];
		const maximum = span[1];
		const sequence = span[2];
		let currentId = span[0];
		let count = 0;

		while (isNull(maximum) || count < maximum)
		{
			const car = getCarById(currentId);
			if (!car)
				break;
			if (count % sequence === 0)
			{
				action(car, count);
			}
			invoke(refreshVehicle, currentId);
			const nextId = car.nextCarOnTrain;
			if (isNull(nextId))
				break;

			currentId = nextId;
			count++;
		}
	}
}