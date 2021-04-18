import mock_Entity from "./entity";
import mock from "./core/mock";


/**
 * A mock of a car entity.
 */
export default function mock_Car(template?: Partial<Car>): Car
{
	const car = mock<Car>({
		type: "car",
		vehicleObject: 0,

		...(mock_Entity(template) as Partial<Entity>),
	});
	// Init car based on object if any is specified
	if (car.rideObject !== undefined && car.vehicleObject !== undefined)
	{
		const obj = context.getObject("ride", car.rideObject).vehicles[car.vehicleObject];
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