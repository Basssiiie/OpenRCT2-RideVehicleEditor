/// <reference path="../../lib/openrct2.d.ts" />

import test from 'ava';
import VehicleSelector from "../../src/services/selector";
import mock_GameMap from "../mocks/gameMap";
import mock_Ride from "../mocks/ride";


test("Constructor defaults", t =>
{
	const selector = new VehicleSelector();

	t.falsy(selector.ridesInPark.get());
	t.falsy(selector.trainsOnRide.get());
	t.falsy(selector.vehiclesOnTrain.get());
	t.is(selector.ride.get(), null);
	t.is(selector.train.get(), null);
	t.is(selector.vehicle.get(), null);
	t.is(selector.rideIndex, null);
	t.is(selector.trainIndex, null);
	t.is(selector.vehicleIndex, null);
});


test("Reload ride list: updates rides in park", t =>
{
	const selector = new VehicleSelector();
	global.map = mock_GameMap({
		rides: [
			mock_Ride(<Ride>{ name: "twister" }),
			mock_Ride(<Ride>{ name: "ferris wheel" }),
			mock_Ride(<Ride>{ name: "looping coaster" }),
		]
	});

	selector.reloadRideList();

	const rides = selector.ridesInPark.get();
	t.truthy(rides);
	t.is(rides.length, 3);
	// Alphabetically ordered...
	t.is(rides[0].name, "ferris wheel");
	t.is(rides[1].name, "looping coaster");
	t.is(rides[2].name, "twister");
});


test("Reload ride list: reselect previous selected ride", t =>
{
	const selector = new VehicleSelector();
	global.map = mock_GameMap({
		rides: [
			mock_Ride(<Ride>{ name: "ferris wheel" }),
			mock_Ride(<Ride>{ name: "looping coaster" }),
			mock_Ride(<Ride>{ name: "twister" }),
		]
	});

	selector.reloadRideList();
	selector.selectRide(1);

	t.is(selector.ride.get()?.name, "looping coaster");
	t.is(selector.rideIndex, 1);

	global.map.rides.unshift(
		mock_Ride(<Ride>{ name: "freefall" }),
		mock_Ride(<Ride>{ name: "go karts" }),
	);
	selector.reloadRideList();

	t.is(selector.ride.get()?.name, "looping coaster");
	t.is(selector.rideIndex, 3);
});