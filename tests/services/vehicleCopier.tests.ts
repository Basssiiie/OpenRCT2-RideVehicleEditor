/// <reference path="../../lib/openrct2.d.ts" />

import test from "ava";
import Mock from "openrct2-mocks";
import { ParkRide } from "../../src/objects/parkRide";
import { RideVehicle } from "../../src/objects/rideVehicle";
import { initActions } from "../../src/services/actions";
import { applyToTargets, CopyFilter, CopyOptions, getTargets, getVehicleSettings, VehicleSettings } from "../../src/services/vehicleCopier";


function createTrain(startIndex: number): Car[]
{
	return [
		Mock.car({ id: startIndex++, nextCarOnTrain: startIndex }),
		Mock.car({ id: startIndex++, nextCarOnTrain: startIndex }),
		Mock.car({ id: startIndex++, nextCarOnTrain: startIndex }),
		Mock.car({ id: startIndex++, nextCarOnTrain: startIndex }),
		Mock.car({ id: startIndex }),
	];
}


const getTargetsMacro = test.macro((t, option: CopyOptions, trainIndex: number, vehicleIndex: number, expectedTargets: [number, number | null][]) =>
{
	globalThis.map = Mock.map({ entities: [
		...createTrain(30),
		...createTrain(20),
		...createTrain(10),
		...createTrain(40),
	]});
	const ride = new ParkRide(Mock.ride({ vehicles: [ 10, 20, 30, 40 ] }));
	const train = ride._trains()[trainIndex];
	const vehicle = train._at(vehicleIndex);

	const targets = getTargets(option, [ride, 25], [train, trainIndex], [vehicle, vehicleIndex]);

	t.deepEqual(targets, expectedTargets);
});


test("Get targets of all vehicles on first train, first car", getTargetsMacro, CopyOptions.AllVehiclesOnTrain, 0, 0, [[ 10, null ]]);
test("Get targets of all vehicles on third train, third car", getTargetsMacro, CopyOptions.AllVehiclesOnTrain, 2, 2, [[ 30, null ]]);
test("Get targets of all vehicles on last train, last car", getTargetsMacro, CopyOptions.AllVehiclesOnTrain, 3, 4, [[ 40, null ]]);
test("Get targets of preceding vehicles on first train, first car", getTargetsMacro, CopyOptions.PrecedingVehiclesOnTrain, 0, 0, [[ 10, 1 ]]);
test("Get targets of preceding vehicles on third train, third car", getTargetsMacro, CopyOptions.PrecedingVehiclesOnTrain, 2, 2, [[ 30, 3 ]]);
test("Get targets of preceding vehicles on last train, last car", getTargetsMacro, CopyOptions.PrecedingVehiclesOnTrain, 3, 4, [[ 40, 5 ]]);
test("Get targets of following vehicles on first train, first car", getTargetsMacro, CopyOptions.FollowingVehiclesOnTrain, 0, 0, [[ 10, null ]]);
test("Get targets of following vehicles on third train, third car", getTargetsMacro, CopyOptions.FollowingVehiclesOnTrain, 2, 2, [[ 32, null ]]);
test("Get targets of following vehicles on last train, last car", getTargetsMacro, CopyOptions.FollowingVehiclesOnTrain, 3, 4, [[ 44, null ]]);

test("Get targets of all vehicles on all trains from first train, first car", getTargetsMacro, CopyOptions.AllVehiclesOnAllTrains, 0, 0, [[ 10, null ], [ 20, null ], [ 30, null ], [ 40, null ]]);
test("Get targets of all vehicles on all trains from third train, third car", getTargetsMacro, CopyOptions.AllVehiclesOnAllTrains, 2, 2, [[ 10, null ], [ 20, null ], [ 30, null ], [ 40, null ]]);
test("Get targets of all vehicles on all trains from last train, last car", getTargetsMacro, CopyOptions.AllVehiclesOnAllTrains, 3, 4, [[ 10, null ], [ 20, null ], [ 30, null ], [ 40, null ]]);
test("Get targets of preceding vehicles on all trains from first train, first car", getTargetsMacro, CopyOptions.PrecedingVehiclesOnAllTrains, 0, 0, [[ 10, 1 ], [ 20, 1 ], [ 30, 1 ], [ 40, 1 ]]);
test("Get targets of preceding vehicles on all trains from third train, third car", getTargetsMacro, CopyOptions.PrecedingVehiclesOnAllTrains, 2, 2, [[ 10, 3 ], [ 20, 3 ], [ 30, 3 ], [ 40, 3 ]]);
test("Get targets of preceding vehicles on all trains from last train, last car", getTargetsMacro, CopyOptions.PrecedingVehiclesOnAllTrains, 3, 4, [[ 10, 5 ], [ 20, 5 ], [ 30, 5 ], [ 40, 5 ]]);
test("Get targets of following vehicles on all trains from first train, first car", getTargetsMacro, CopyOptions.FollowingVehiclesOnAllTrains, 0, 0, [[ 10, null ], [ 20, null ], [ 30, null ], [ 40, null ]]);
test("Get targets of following vehicles on all trains from third train, third car", getTargetsMacro, CopyOptions.FollowingVehiclesOnAllTrains, 2, 2, [[ 12, null ], [ 22, null ], [ 32, null ], [ 42, null ]]);
test("Get targets of following vehicles on all trains from last train, last car", getTargetsMacro, CopyOptions.FollowingVehiclesOnAllTrains, 3, 4, [[ 14, null ], [ 24, null ], [ 34, null ], [ 44, null ]]);

test("Get targets of same vehicle on all trains from first train, first car", getTargetsMacro, CopyOptions.SameVehicleOnAllTrains, 0, 0, [[ 10, 1 ], [ 20, 1 ], [ 30, 1 ], [ 40, 1 ]]);
test("Get targets of same vehicle on all trains from third train, third car", getTargetsMacro, CopyOptions.SameVehicleOnAllTrains, 2, 2, [[ 12, 1 ], [ 22, 1 ], [ 32, 1 ], [ 42, 1 ]]);
test("Get targets of same vehicle on all trains from last train, last car", getTargetsMacro, CopyOptions.SameVehicleOnAllTrains, 3, 4, [[ 14, 1 ], [ 24, 1 ], [ 34, 1 ], [ 44, 1 ]]);


test("Get all settings of the vehicle", t =>
{
	globalThis.context = Mock.context({ objects: [
		Mock.rideObject({ index: 23, vehicles: [ Mock.rideObjectVehicle(), Mock.rideObjectVehicle({ flags: (1 << 19) })]})
	]});
	const car = Mock.car({
		rideObject: 23,
		vehicleObject: 1,
		numSeats: 8,
		mass: 7500,
		poweredAcceleration: 10,
		poweredMaxSpeed: 20,
		colours: { body: 3, trim: 7, tertiary: 11 }
	});
	const vehicle = new RideVehicle(car);

	const settings = getVehicleSettings(vehicle, CopyFilter.Default);

	t.is(settings.rideTypeId, 23);
	t.is(settings.variant, 1);
	t.is(settings.seats, 8);
	t.is(settings.mass, 7500);
	t.is(settings.poweredAcceleration, 10);
	t.is(settings.poweredMaxSpeed, 20);
	t.deepEqual(settings.colours, [3, 7, 11]);
});


test("Get all of the settings of the vehicle while selecting nothing", t =>
{
	globalThis.context = Mock.context({ objects: [
		Mock.rideObject({ index: 23, vehicles: [ Mock.rideObjectVehicle(), Mock.rideObjectVehicle({ flags: (1 << 19) })]})
	]});
	const car = Mock.car({
		rideObject: 23,
		vehicleObject: 1,
		numSeats: 8,
		mass: 7500,
		poweredAcceleration: 10,
		poweredMaxSpeed: 20,
		colours: { body: 3, trim: 7, tertiary: 11 }
	});
	const vehicle = new RideVehicle(car);

	const settings = getVehicleSettings(vehicle, 0);

	t.is(settings.rideTypeId, 23);
	t.is(settings.variant, 1);
	t.is(settings.seats, 8);
	t.is(settings.mass, 7500);
	t.is(settings.poweredAcceleration, 10);
	t.is(settings.poweredMaxSpeed, 20);
	t.deepEqual(settings.colours, [3, 7, 11]);
});


test("Get ride type and variant settings of the vehicle and nothing else", t =>
{
	globalThis.context = Mock.context({ objects: [
		Mock.rideObject({ index: 23, vehicles: [ Mock.rideObjectVehicle(), Mock.rideObjectVehicle({ flags: (1 << 19) })]})
	]});
	const car = Mock.car({
		rideObject: 23,
		vehicleObject: 1,
		numSeats: 8,
		mass: 7500,
		poweredAcceleration: 10,
		poweredMaxSpeed: 20,
		colours: { body: 3, trim: 7, tertiary: 11 }
	});
	const vehicle = new RideVehicle(car);

	const settings = getVehicleSettings(vehicle, CopyFilter.TypeAndVariant);

	t.is(settings.rideTypeId, 23);
	t.is(settings.variant, 1);
	t.is(settings.seats, undefined);
	t.is(settings.mass, undefined);
	t.is(settings.poweredAcceleration, undefined);
	t.is(settings.poweredMaxSpeed, undefined);
	t.deepEqual(settings.colours, undefined);
});


test("Get seats settings of the vehicle and nothing else", t =>
{
	globalThis.context = Mock.context({ objects: [
		Mock.rideObject({ index: 23, vehicles: [ Mock.rideObjectVehicle(), Mock.rideObjectVehicle({ flags: (1 << 19) })]})
	]});
	const car = Mock.car({
		rideObject: 23,
		vehicleObject: 1,
		numSeats: 8,
		mass: 7500,
		poweredAcceleration: 10,
		poweredMaxSpeed: 20,
		colours: { body: 3, trim: 7, tertiary: 11 }
	});
	const vehicle = new RideVehicle(car);

	const settings = getVehicleSettings(vehicle, CopyFilter.Seats);

	t.is(settings.rideTypeId, undefined);
	t.is(settings.variant, undefined);
	t.is(settings.seats, 8);
	t.is(settings.mass, undefined);
	t.is(settings.poweredAcceleration, undefined);
	t.is(settings.poweredMaxSpeed, undefined);
	t.deepEqual(settings.colours, undefined);
});


test("Get no powered settings of unpowered vehicle", t =>
{
	globalThis.context = Mock.context({ objects: [
		Mock.rideObject({ index: 28, vehicles: [ Mock.rideObjectVehicle() ]})
	]});
	const car = Mock.car({
		rideObject: 28,
		vehicleObject: 0,
		poweredAcceleration: 10,
		poweredMaxSpeed: 20,
	});
	const vehicle = new RideVehicle(car);

	const settings = getVehicleSettings(vehicle, CopyFilter.All);

	t.is(settings.poweredAcceleration, undefined);
	t.is(settings.poweredMaxSpeed, undefined);
});


function initActionTestHelpers(permissions: PermissionType[] = [ "ride_properties" ]): void
{
	globalThis.context = Mock.context({
		getTypeIdForAction: () => 80
	});
	globalThis.network = Mock.network({
		groups: [ Mock.playerGroup({ permissions })]
	});
	initActions();
}


test("Paste all vehicle settings on single car", t =>
{
	initActionTestHelpers();
	globalThis.map = Mock.map({ entities: [
		Mock.car({ id: 98, rideObject: 2 }),
		Mock.car({ id: 99, rideObject: 2 }),
		Mock.car({ id: 97, rideObject: 2 }),
	]});

	const settings: VehicleSettings = {
		rideTypeId: 21,
		variant: 3,
		seats: 6,
		mass: 102,
		poweredAcceleration: 34,
		poweredMaxSpeed: 4,
		colours: [ 13, 15, 18 ]
	};

	applyToTargets(settings, [[ 99, 1 ]]);

	const targetCar = <Car>map.getEntity(99);
	t.is(targetCar.rideObject, 21);
	t.is(targetCar.vehicleObject, 3);
	t.is(targetCar.numSeats, 6);
	t.is(targetCar.mass, 102);
	t.is(targetCar.poweredAcceleration, 34);
	t.is(targetCar.poweredMaxSpeed, 4);
	t.is(targetCar.colours.body, 13);
	t.is(targetCar.colours.trim, 15);
	t.is(targetCar.colours.tertiary, 18);
});


test("Paste all vehicle settings on a car does not affect other cars", t =>
{
	initActionTestHelpers();
	globalThis.map = Mock.map({ entities: [
		Mock.car({ id: 98, rideObject: 2 }),
		Mock.car({ id: 99, rideObject: 2 }),
		Mock.car({ id: 97, rideObject: 2 }),
	]});

	const settings: VehicleSettings = {
		rideTypeId: 21,
		variant: 3,
		seats: 6,
		mass: 102,
		poweredAcceleration: 34,
		poweredMaxSpeed: 4,
		colours: [ 13, 15, 18 ]
	};

	applyToTargets(settings, [[ 99, 3 ], [ 99, null ]]);

	function testUnaffectedCar(carId: number): void
	{
		const unaffectedCar = <Car>map.getEntity(carId);
		t.is(unaffectedCar.rideObject, 2);
		t.is(unaffectedCar.vehicleObject, 0);
		t.is(unaffectedCar.numSeats, 0);
		t.is(unaffectedCar.mass, 0);
		t.is(unaffectedCar.poweredAcceleration, 0);
		t.is(unaffectedCar.poweredMaxSpeed, 0);
		t.is(unaffectedCar.colours.body, 0);
		t.is(unaffectedCar.colours.trim, 0);
		t.is(unaffectedCar.colours.tertiary, 0);
	}
	testUnaffectedCar(98);
	testUnaffectedCar(97);
});


test("Paste empty vehicle settings on single car does not do anything", t =>
{
	initActionTestHelpers();
	globalThis.map = Mock.map({ entities: [
		Mock.car({ id: 98, rideObject: 2 }),
		Mock.car({ id: 99, rideObject: 2 }),
		Mock.car({ id: 97, rideObject: 2 }),
	]});

	const settings: VehicleSettings = {};

	applyToTargets(settings, [[ 99, 1 ]]);

	const targetCar = <Car>map.getEntity(99);
	t.is(targetCar.rideObject, 2);
	t.is(targetCar.vehicleObject, 0);
	t.is(targetCar.numSeats, 0);
	t.is(targetCar.mass, 0);
	t.is(targetCar.poweredAcceleration, 0);
	t.is(targetCar.poweredMaxSpeed, 0);
});


test("Paste all vehicle settings on multiple trains car affects all", t =>
{
	initActionTestHelpers();
	globalThis.map = Mock.map({ entities: [
		Mock.car({ id: 98, rideObject: 2, nextCarOnTrain: 99 }),
		Mock.car({ id: 99, rideObject: 2 }),
		Mock.car({ id: 97, rideObject: 2, nextCarOnTrain: 90 }),
		Mock.car({ id: 90, rideObject: 2 }),
	]});

	const settings: VehicleSettings = {
		rideTypeId: 76,
		variant: 2,
		seats: 1,
		mass: 19,
		poweredAcceleration: 67,
		poweredMaxSpeed: 110,
		colours: [ 8, 6, 5 ]
	};

	applyToTargets(settings, [[ 98, 4 ], [ 97, null ]]);

	function testAffectedCar(carId: number): void
	{
		const targetCar = <Car>map.getEntity(carId);
		t.is(targetCar.rideObject, 76);
		t.is(targetCar.vehicleObject, 2);
		t.is(targetCar.numSeats, 1);
		t.is(targetCar.mass, 19);
		t.is(targetCar.poweredAcceleration, 67);
		t.is(targetCar.poweredMaxSpeed, 110);
		t.is(targetCar.colours.body, 8);
		t.is(targetCar.colours.trim, 6);
		t.is(targetCar.colours.tertiary, 5);
	}
	testAffectedCar(98);
	testAffectedCar(99);
	testAffectedCar(97);
	testAffectedCar(90);
});