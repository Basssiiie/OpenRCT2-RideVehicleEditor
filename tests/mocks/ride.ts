import mock from "./_mock";


let rideId = 0;


/**
 * A mock of a ride.
 */
export default function mock_Ride(template?: Partial<Ride>): Ride
{
	return mock<Ride>({
		id: (++rideId),
		classification: "ride",
		vehicles: [ 0 ],

		...template,
	});
}