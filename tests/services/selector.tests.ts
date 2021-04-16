/// <reference path="../../lib/openrct2.d.ts" />

import test from 'ava';
import RideVehicle from "../../src/objects/rideVehicle";
import VehicleSelector from "../../src/services/selector";
import mock_GameMap from "../mocks/gameMap";
import mock_Ride from "../mocks/ride";
import mock from "../mocks/_mock";


test("Constructor defaults", t =>
{
	const selector = new VehicleSelector();

	t.deepEqual(selector.ridesInPark.get(), []);
	t.deepEqual(selector.trainsOnRide.get(), []);
	t.deepEqual(selector.vehiclesOnTrain.get(), []);
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


test("Reload ride list: reselect previous selected ride (new index)", t =>
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


test("Reload ride list: reselect previous selected ride (same index)", t =>
{
	const selector = new VehicleSelector();
	global.map = mock_GameMap({
		rides: [
			mock_Ride(<Ride>{ name: "ferris wheel" }),
			mock_Ride(<Ride>{ name: "freefall" }),
			mock_Ride(<Ride>{ name: "twister" }),
		]
	});

	selector.reloadRideList();
	selector.selectRide(1);

	t.is(selector.ride.get()?.name, "freefall");
	t.is(selector.rideIndex, 1);

	global.map.rides.unshift(
		mock_Ride(<Ride>{ name: "looping coaster" }),
		mock_Ride(<Ride>{ name: "go karts" }),
	);
	selector.reloadRideList();

	t.is(selector.ride.get()?.name, "freefall");
	t.is(selector.rideIndex, 1);
});


test("Reload ride list: previous ride has disappeared", t =>
{
	const selector = new VehicleSelector();
	global.map = mock_GameMap({
		rides: [
			mock_Ride(<Ride>{ name: "looping coaster" }),
		]
	});

	selector.reloadRideList();
	selector.selectRide(0);

	t.is(selector.ride.get()?.name, "looping coaster");
	t.is(selector.rideIndex, 0);

	global.map.rides.pop();
	selector.reloadRideList();

	t.is(selector.ride.get(), null);
	t.is(selector.rideIndex, null);
});


test("Select vehicle: select correct vehicle", t =>
{
	const selector = new VehicleSelector();
	selector.vehiclesOnTrain.set([
		mock(new RideVehicle(10)),
		mock(new RideVehicle(20)),
		mock(new RideVehicle(30))
	]);
	t.is(selector.vehicle.get(), null);
	t.is(selector.vehicleIndex, null);

	selector.selectVehicle(2);
	t.is(selector.vehicle.get()?.entityId, 30);
	t.is(selector.vehicleIndex, 2);

	selector.selectVehicle(1);
	t.is(selector.vehicle.get()?.entityId, 20);
	t.is(selector.vehicleIndex, 1);

	selector.selectVehicle(0);
	t.is(selector.vehicle.get()?.entityId, 10);
	t.is(selector.vehicleIndex, 0);

	selector.selectVehicle(-1);
	t.is(selector.vehicle.get()?.entityId, 10);
	t.is(selector.vehicleIndex, 0);

	selector.selectVehicle(3);
	t.is(selector.vehicle.get()?.entityId, 30);
	t.is(selector.vehicleIndex, 2);
});


test("Select vehicle: no vehicles available", t =>
{
	const selector = new VehicleSelector();
	t.is(selector.vehicle.get(), null);

	selector.selectVehicle(0);
	t.is(selector.vehicle.get(), null);
	t.is(selector.vehicleIndex, null);

	selector.selectVehicle(1);
	t.is(selector.vehicle.get(), null);
	t.is(selector.vehicleIndex, null);
});