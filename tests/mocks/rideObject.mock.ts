import mock_LoadedObject from "./loadedObject.mock";
import mock_RideObjectVehicle from "./rideObjectVehicle.mock";
import mock from "./core/mock";


/**
 * A mock of a ride object.
 */
export default function mock_RideObject(template?: Partial<RideObject>): RideObject
{
	return mock<RideObject>({
		type: "ride",
		carsPerFlatRide: 255,
		vehicles: [
			mock_RideObjectVehicle()
		],

		...(mock_LoadedObject(template) as Partial<LoadedObject>),
	});
}