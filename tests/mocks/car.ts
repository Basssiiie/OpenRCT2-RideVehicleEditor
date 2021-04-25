import mock_Entity from "./entity";
import mock from "./core/mock";
import RideVehicle from "../../src/objects/rideVehicle";


/**
 * Mock that adds additional configurations to the car.
 */
interface CarMock extends Car
{
	trackProgress: number
}


/**
 * A mock of a car entity.
 */
export default function mock_Car(template?: Partial<CarMock>): CarMock
{
	const car = mock<CarMock>({
		type: "car",
		vehicleObject: 0,
		// These fallback to 0 if they do are not powered.
		poweredAcceleration: 0,
		poweredMaxSpeed: 0,
		nextCarOnTrain: null,
		travelBy(distance: number): void
		{
			this.trackProgress = (this.trackProgress ?? 0) + (distance / 9000);
		},

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