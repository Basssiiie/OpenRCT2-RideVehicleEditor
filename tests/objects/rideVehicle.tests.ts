/// <reference path="../../lib/openrct2.d.ts" />

import test from "ava";
import Mock from "openrct2-mocks";
import { RideVehicle } from "../../src/objects/rideVehicle";


test("Ride vehicle gets created from car id", t =>
{
	global.map = Mock.map({ entities: [
		Mock.car({ id: 12, x: 34 })
	]});

	const rideVehicle = new RideVehicle(12, () => t.fail("Car id not found"));

	t.is(rideVehicle.id, 12);
	t.is(rideVehicle.car().id, 12);
	t.is(rideVehicle.car().type, "car");
	t.is(rideVehicle.car().x, 34);
});


test("Ride vehicle gets created from car entity", t =>
{
	const car = Mock.car({ id: 45, x: 77 });

	const rideVehicle = new RideVehicle(car, () => t.fail("Car id not found"));

	t.is(rideVehicle.id, 45);
	t.is(rideVehicle.car().id, 45);
	t.is(rideVehicle.car().type, "car");
	t.is(rideVehicle.car().x, 77);
});


test("Ride vehicle goes missing after refresh", t =>
{
	const car = Mock.car({ id: 42 });

	const calls: string[] = [];
	const rideVehicle = new RideVehicle(car, () => calls.push("missing"));

	t.is(rideVehicle.id, 42);
	t.deepEqual(calls, []);

	rideVehicle.refresh();
	t.deepEqual(calls, [ "missing" ]);
});


test("Ride vehicle gets vehicle type from ride", t =>
{
	global.context = Mock.context({ objects: [
		Mock.rideObject({ index: 11, name: "Log Flume", vehicles: [
			Mock.rideObjectVehicle({ poweredAcceleration: 25, numSeats: 4 }),
			Mock.rideObjectVehicle({ poweredAcceleration: 65, numSeats: 6 })
		]})
	]});
	global.map = Mock.map({ entities: [
		Mock.car({ id: 42, rideObject: 11, vehicleObject: 1 })
	]});

	const rideVehicle = new RideVehicle(42, () => t.fail("Car id not found"));

	t.is(rideVehicle.id, 42);
	t.is(rideVehicle.type().poweredAcceleration, 65);
	t.is(rideVehicle.type().numSeats, 6);
});


test("Ride vehicle type is cached", t =>
{
	global.context = Mock.context({ objects: [
		Mock.rideObject({ index: 11, name: "Log Flume", vehicles: [
			Mock.rideObjectVehicle({ poweredAcceleration: 25, numSeats: 4 }),
			Mock.rideObjectVehicle({ poweredAcceleration: 65, numSeats: 6 })
		]})
	]});
	global.map = Mock.map({ entities: [
		Mock.car({ id: 42, rideObject: 11, vehicleObject: 1 })
	]});

	const rideVehicle = new RideVehicle(42, () => t.fail("Car id not found"));

	const type1 = rideVehicle.type();
	const type2 = rideVehicle.type();
	t.is(type1, type2);

	const type3 = rideVehicle.type();
	t.is(type3, type1);
});


test("Ride vehicle is powered", t =>
{
	global.context = Mock.context({ objects: [
		Mock.rideObject({ index: 24, name: "Monorail", vehicles: [
			Mock.rideObjectVehicle({ flags: (1 << 19) }),
		]})
	]});
	global.map = Mock.map({ entities: [
		Mock.car({ id: 77, rideObject: 24, vehicleObject: 0 })
	]});

	const rideVehicle = new RideVehicle(77, () => t.fail("Car id not found"));

	t.true(rideVehicle.isPowered());
});


test("Ride vehicle is not powered", t =>
{
	global.context = Mock.context({ objects: [
		Mock.rideObject({ index: 9, name: "Monorail", vehicles: [
			Mock.rideObjectVehicle({ flags: (1 << 18) }),
		]})
	]});
	global.map = Mock.map({ entities: [
		Mock.car({ id: 68, rideObject: 9, vehicleObject: 0 })
	]});

	const rideVehicle = new RideVehicle(68, () => t.fail("Car id not found"));

	t.false(rideVehicle.isPowered());
});