import mock_Entity from "./entity";
import mock from "./core/mock";
import RideVehicle from "../../src/objects/rideVehicle";


/**
 * A mock of a car entity.
 */
export default function mock_Car(template?: Partial<Car>): Car
{
	const car = mock<Car>({
		type: "car",
		vehicleObject: 0,
		// These fallback to 0 if they do are not powered.
		poweredAcceleration: 0,
		poweredMaxSpeed: 0,

		...(mock_Entity(template) as Partial<Entity>),
	});
	// Init car based on object if any is specified
	if (car.rideObject !== undefined && car.vehicleObject !== undefined)
	{
		const obj = RideVehicle.getDefinition(car);
		if (obj)
		{
			car.numSeats = obj.numSeats ?? 0;
			car.mass = obj.carMass ?? 0;
			car.poweredAcceleration = obj.poweredAcceleration ?? 0;
			car.poweredMaxSpeed = obj.poweredMaxSpeed ?? 0;
		}
	}
	return car;
}