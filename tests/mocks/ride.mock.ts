import mock from "./core/mock";


let rideId = 0;


/**
 * Mock that adds additional configurations to the ride.
 */
interface RideMock extends Ride
{
	objectId: number
}


/**
 * A mock of a ride.
 */
export default function mock_Ride(template?: Partial<RideMock>): RideMock
{
	return mock<RideMock>({
		id: (++rideId),
		classification: "ride",
		vehicles: [],
		get object()
		{
			return context.getObject("ride", this.objectId ?? -1);
		},

		...template,
	});
}