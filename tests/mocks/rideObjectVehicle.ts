import mock from "./core/mock";


let imageId = 0;


/**
 * A mock of a ride object vehicle.
 */
export default function mock_RideObjectVehicle(template?: Partial<RideObjectVehicle>): RideObjectVehicle
{
	return mock<RideObjectVehicle>({
		baseImageId: (++imageId),

		...template,
	});
}