import { getCarById } from "../objects/rideVehicle";
import { isNull } from "../utilities/type";
import { invoke, refreshVehicle } from "./events";

/**
 * A tuple for targeting a span of entities. The first tuple value specifies a car id
 * and the second tuple value specifies to how many vehicles the change should be applied.
 *
 * For example: `[33, 2]` applies the paste to the vehicle with id 33, and the first
 * one after. A `null` applies the paste from the first vehicle to the end of the train.
 */
export type VehicleSpan = [number, number | null];


/**
 * Applies a specific callback for each vehicle in the specified list of vehicle spans.
 */
export function forEachVehicle(vehicles: VehicleSpan[], action: (car: Car, index: number) => void): void
{
	for (let s = 0, sl = vehicles.length; s < sl; s++)
	{
		const span = vehicles[s];
		const maximum = span[1];
		let currentId = span[0];
		let count = 0;

		while (isNull(maximum) || count < maximum)
		{
			const car = getCarById(currentId);
			if (!car)
				break;

			action(car, count);
			invoke(refreshVehicle, currentId);

			const nextId = car.nextCarOnTrain;
			if (isNull(nextId))
				break;

			currentId = nextId;
			count++;
		}
	}
}
