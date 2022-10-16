import * as Log from "../utilities/logger";
import { RideVehicle } from "./rideVehicle";


/**
 * Represents a train with one or more vehicles on a ride in the park.
 */
export class RideTrain
{
	readonly carId: number;
	private _vehicles?: RideVehicle[] | null;
	private _onMissing: () => void;


	/**
	 * Creates a new train for a ride.
	 * @param carId Gets the entity id for the first car of this train.
	 * @param onMissing Callback that should get triggered when the entity has disappeared.
	 */
	constructor(carId: number, onMissing: () => void)
	{
		Log.assert(carId !== 0xFFFF, "Invalid car id");
		this.carId = carId;
		this._onMissing = onMissing;
		this.refresh();
	}


	refresh(): void
	{
		const vehicleList: RideVehicle[] = [];
		const missingCar = (): void => this.refresh();

		let currentId: (number | null) = this.carId;
		let car: Car | null = null;

		while (currentId != null
			&& currentId != 0xFFFF // = invalid vehicle
			&& (car = <Car>map.getEntity(currentId))
			&& car.type === "car")
		{
			vehicleList.push(new RideVehicle(car, missingCar));
			currentId = car.nextCarOnTrain;
		}

		if (vehicleList.length > 0)
		{
			this._vehicles = vehicleList;
		}
		else
		{
			this._vehicles = null;
			this._onMissing();
		}
	}


	/**
	 * Gets a list of all cars in this train, from front to back.
	 */
	vehicles(): RideVehicle[]
	{
		Log.assert(!!this._vehicles, `Selected train with car id '${this.carId}' is missing.`);
		return <RideVehicle[]>this._vehicles;
	}


	/**
	 * Gets the vehicle at the specific index.
	 */
	at(index: number): RideVehicle
	{
		const vehicles = this.vehicles();
		Log.assert(0 <= index && index < vehicles.length, `Vehicle index ${index} out of range for train of length ${vehicles.length}`);
		return vehicles[index];
	}
}