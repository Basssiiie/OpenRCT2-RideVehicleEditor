/// <reference path="../../lib/openrct2.d.ts" />

import test, { ExecutionContext } from 'ava';
import RideTrain from "../../src/objects/rideTrain";
import VehicleSelector from "../../src/services/selector";
import mock_Car from "../mocks/car";
import mock_Entity from "../mocks/entity";
import mock_GameMap from "../mocks/gameMap";
import mock_Ride from "../mocks/ride";


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
	global.map = mock_GameMap({
		rides: [
			mock_Ride(<Ride>{ name: "twister" }),
			mock_Ride(<Ride>{ name: "ferris wheel" }),
			mock_Ride(<Ride>{ name: "looping coaster" }),
		]
	});
	const selector = new VehicleSelector();
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
	global.map = mock_GameMap({
		rides: [
			mock_Ride(<Ride>{ name: "ferris wheel" }),
			mock_Ride(<Ride>{ name: "looping coaster" }),
			mock_Ride(<Ride>{ name: "twister" }),
		]
	});
	const selector = new VehicleSelector();
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
	global.map = mock_GameMap({
		rides: [
			mock_Ride(<Ride>{ name: "ferris wheel" }),
			mock_Ride(<Ride>{ name: "freefall" }),
			mock_Ride(<Ride>{ name: "twister" }),
		]
	});
	const selector = new VehicleSelector();
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
	global.map = mock_GameMap({
		rides: [
			mock_Ride(<Ride>{ name: "looping coaster" }),
		]
	});
	const selector = new VehicleSelector();
	selector.reloadRideList();
	selector.selectRide(0);

	t.is(selector.ride.get()?.name, "looping coaster");
	t.is(selector.rideIndex, 0);

	global.map.rides.pop();
	selector.reloadRideList();

	t.is(selector.ride.get(), null);
	t.is(selector.rideIndex, null);
});


function setupPark(): void
{
	global.map = mock_GameMap({
		entities: [
			// looping train 1
			mock_Car(<Car>{ id: 11, ride: 3, nextCarOnTrain: 12 }),
			mock_Car(<Car>{ id: 12, ride: 3, nextCarOnTrain: 13 }),
			mock_Car(<Car>{ id: 13, ride: 3, nextCarOnTrain: null }),
			// looping train 2
			mock_Car(<Car>{ id: 21, ride: 3, nextCarOnTrain: 22 }),
			mock_Car(<Car>{ id: 22, ride: 3, nextCarOnTrain: 23 }),
			mock_Car(<Car>{ id: 23, ride: 3, nextCarOnTrain: null }),
			// go karts cars
			mock_Car(<Car>{ id: 31, ride: 2, nextCarOnTrain: null }),
			mock_Car(<Car>{ id: 32, ride: 2, nextCarOnTrain: null }),
			mock_Car(<Car>{ id: 33, ride: 2, nextCarOnTrain: null }),
		],
		rides: [
			mock_Ride(<Ride>{ id: 2, name: "go karts", vehicles: [ 31, 32, 33 ] }),
			mock_Ride(<Ride>{ id: 3, name: "looping coaster", vehicles: [ 11, 21 ] }),
		]
	});
}


function selectRideMacro(t: ExecutionContext, ride: number, train: number, vehicle: number, rideName: string, trainId: number, vehicleId: number): void
{
	setupPark();
	const selector = new VehicleSelector();
	selector.reloadRideList();

	selector.selectRide(ride, train, vehicle);

	t.is(selector.ride.get()?.name, rideName);
	t.is(selector.train.get()?.headCarId, trainId);
	t.is(selector.vehicle.get()?.entityId, vehicleId);
	t.is(selector.rideIndex, ride);
	t.is(selector.trainIndex, train);
	t.is(selector.vehicleIndex, vehicle);
}


test("Selection: go karts train 0", selectRideMacro, 0, 0, 0, "go karts", 31, 31);
test("Selection: go karts train 1", selectRideMacro, 0, 1, 0, "go karts", 32, 32);
test("Selection: go karts train 2", selectRideMacro, 0, 2, 0, "go karts", 33, 33);
test("Selection: looping coaster train 0, car 0", selectRideMacro, 1, 0, 0, "looping coaster", 11, 11);
test("Selection: looping coaster train 0, car 1", selectRideMacro, 1, 0, 1, "looping coaster", 11, 12);
test("Selection: looping coaster train 0, car 2", selectRideMacro, 1, 0, 2, "looping coaster", 11, 13);
test("Selection: looping coaster train 1, car 0", selectRideMacro, 1, 1, 0, "looping coaster", 21, 21);
test("Selection: looping coaster train 1, car 1", selectRideMacro, 1, 1, 1, "looping coaster", 21, 22);
test("Selection: looping coaster train 1, car 2", selectRideMacro, 1, 1, 2, "looping coaster", 21, 23);


function selectRideClampedMacro(t: ExecutionContext, inRide: number, inTrain: number, inVehicle: number, outRide: number, outTrain: number, outVehicle: number, rideName: string, trainId: number, vehicleId: number): void
{
	setupPark();
	const selector = new VehicleSelector();
	selector.reloadRideList();

	selector.selectRide(inRide, inTrain, inVehicle);

	t.is(selector.ride.get()?.name, rideName);
	t.is(selector.train.get()?.headCarId, trainId);
	t.is(selector.vehicle.get()?.entityId, vehicleId);
	t.is(selector.rideIndex, outRide);
	t.is(selector.trainIndex, outTrain);
	t.is(selector.vehicleIndex, outVehicle);
}


test("Selection: go karts train 2, car 1=>0 ",        selectRideClampedMacro,  0,  2,  1, 0, 2, 0, "go karts", 33, 33);
test("Selection: go karts train 2, car -1=>0 ",       selectRideClampedMacro,  0,  2, -1, 0, 2, 0, "go karts", 33, 33);
test("Selection: go karts train 3=>2",                selectRideClampedMacro,  0,  3,  0, 0, 2, 0, "go karts", 33, 33);
test("Selection: go karts train -1=>0",               selectRideClampedMacro,  0, -1,  0, 0, 0, 0, "go karts", 31, 31);
test("Selection: go karts train 3=>2, car 2=>0",      selectRideClampedMacro,  0,  3,  2, 0, 2, 0, "go karts", 33, 33);
test("Selection: looping coaster train 2=>1, car 1",  selectRideClampedMacro,  1,  2,  1, 1, 1, 1, "looping coaster", 21, 22);
test("Selection: looping coaster train -1=>0, car 2", selectRideClampedMacro,  1, -1,  2, 1, 0, 2, "looping coaster", 11, 13);
test("Selection: ride 2=>looping coaster",            selectRideClampedMacro,  2,  0,  0, 1, 0, 0, "looping coaster", 11, 11);
test("Selection: ride -1=>go karts",                  selectRideClampedMacro, -1,  0,  0, 0, 0, 0, "go karts", 31, 31);


test("Select ride: updates train list", t =>
{
	setupPark();
	const selector = new VehicleSelector();
	selector.reloadRideList();

	selector.selectRide(1);
	t.is(selector.ride.get()?.name, "looping coaster");

	const trains = selector.trainsOnRide.get();
	t.is(trains.length, 2);
	t.deepEqual(trains[0], new RideTrain(0, 11));
	t.deepEqual(trains[1], new RideTrain(1, 21));
});


test("Select ride: none available", t =>
{
	const selector = new VehicleSelector();
	t.is(selector.ride.get(), null);

	selector.selectRide(0);
	t.is(selector.ride.get(), null);
	t.is(selector.rideIndex, null);

	selector.selectRide(1);
	t.is(selector.ride.get(), null);
	t.is(selector.rideIndex, null);
});


test("Select train: updates vehicle list", t =>
{
	setupPark();
	const selector = new VehicleSelector();
	selector.reloadRideList();

	selector.selectRide(1, 1);
	t.is(selector.ride.get()?.name, "looping coaster");

	const vehicles = selector.vehiclesOnTrain.get();
	t.is(vehicles.length, 3);
	t.is(vehicles[0].entityId, 21);
	t.is(vehicles[1].entityId, 22);
	t.is(vehicles[2].entityId, 23);
});


test("Select train: none available", t =>
{
	const selector = new VehicleSelector();
	t.is(selector.train.get(), null);

	selector.selectTrain(0);
	t.is(selector.train.get(), null);
	t.is(selector.trainIndex, null);

	selector.selectTrain(1);
	t.is(selector.train.get(), null);
	t.is(selector.trainIndex, null);
});


test("Select vehicle: none available", t =>
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


function selectEntityMacro(t: ExecutionContext, entity: number, ride: number, train: number, vehicle: number, rideName: string, trainId: number, vehicleId: number): void
{
	setupPark();
	const selector = new VehicleSelector();
	selector.reloadRideList();

	selector.selectEntity(entity);

	t.is(selector.ride.get()?.name, rideName);
	t.is(selector.train.get()?.headCarId, trainId);
	t.is(selector.vehicle.get()?.entityId, vehicleId);
	t.is(selector.rideIndex, ride);
	t.is(selector.trainIndex, train);
	t.is(selector.vehicleIndex, vehicle);
}


test("Select entity: looping train 0, car 0", selectEntityMacro, 11, 1, 0, 0, "looping coaster", 11, 11);
test("Select entity: looping train 0, car 1", selectEntityMacro, 12, 1, 0, 1, "looping coaster", 11, 12);
test("Select entity: looping train 0, car 2", selectEntityMacro, 13, 1, 0, 2, "looping coaster", 11, 13);
test("Select entity: looping train 1, car 0", selectEntityMacro, 21, 1, 1, 0, "looping coaster", 21, 21);
test("Select entity: looping train 1, car 1", selectEntityMacro, 22, 1, 1, 1, "looping coaster", 21, 22);
test("Select entity: looping train 1, car 2", selectEntityMacro, 23, 1, 1, 2, "looping coaster", 21, 23);
test("Select entity: go karts train 0", selectEntityMacro, 31, 0, 0, 0, "go karts", 31, 31);
test("Select entity: go karts train 1", selectEntityMacro, 32, 0, 1, 0, "go karts", 32, 32);
test("Select entity: go karts train 2", selectEntityMacro, 33, 0, 2, 0, "go karts", 33, 33);


test("Select entity: entity is not a car", t =>
{
	global.map = mock_GameMap({
		entities: [
			mock_Entity(<Peep>{ id: 15, type: "peep"})
		],
		rides: [
			mock_Ride(<Ride>{ id: 1, name: "log flume" }),
		]
	});
	const selector = new VehicleSelector();
	selector.reloadRideList();

	selector.selectEntity(15);

	t.is(selector.ride.get(), null);
	t.is(selector.train.get(), null);
	t.is(selector.vehicle.get(), null);
	t.is(selector.rideIndex, null);
	t.is(selector.trainIndex, null);
	t.is(selector.vehicleIndex, null);
});


test("Select entity: car ride does not exist", t =>
{
	global.map = mock_GameMap({
		entities: [
			mock_Car(<Car>{ id: 15, ride: 2 })
		],
		rides: [
			mock_Ride(<Ride>{ id: 1, name: "log flume" }),
		]
	});
	const selector = new VehicleSelector();
	selector.reloadRideList();

	selector.selectEntity(15);

	t.is(selector.ride.get(), null);
	t.is(selector.train.get(), null);
	t.is(selector.vehicle.get(), null);
	t.is(selector.rideIndex, null);
	t.is(selector.trainIndex, null);
	t.is(selector.vehicleIndex, null);
});
