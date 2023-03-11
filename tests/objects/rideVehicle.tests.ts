/// <reference path="../../lib/openrct2.d.ts" />

import test from "ava";
import Mock from "openrct2-mocks";
import { RideVehicle } from "../../src/objects/rideVehicle";


test("Ride vehicle gets created from car id", t =>
{
	globalThis.map = Mock.map({ entities: [
		Mock.car({ id: 12, x: 34 })
	]});

	const rideVehicle = new RideVehicle(12);

	t.is(rideVehicle._id, 12);
	t.is(rideVehicle._car().id, 12);
	t.is(rideVehicle._car().type, "car");
	t.is(rideVehicle._car().x, 34);
});


test("Ride vehicle gets created from car entity", t =>
{
	const car = Mock.car({ id: 45, x: 77 });

	const rideVehicle = new RideVehicle(car);

	t.is(rideVehicle._id, 45);
	t.is(rideVehicle._car().id, 45);
	t.is(rideVehicle._car().type, "car");
	t.is(rideVehicle._car().x, 77);
});


test("Ride vehicle goes missing after refresh", t =>
{
	const car = Mock.car({ id: 42 });
	const rideVehicle = new RideVehicle(car);

	t.is(rideVehicle._id, 42);

	const result = rideVehicle._refresh();
	t.false(result);
});


test("Ride vehicle gets vehicle type from ride", t =>
{
	globalThis.context = Mock.context({ objects: [
		Mock.rideObject({ index: 11, name: "Log Flume", vehicles: [
			Mock.rideObjectVehicle({ poweredAcceleration: 25, numSeats: 4 }),
			Mock.rideObjectVehicle({ poweredAcceleration: 65, numSeats: 6 })
		]})
	]});
	globalThis.map = Mock.map({ entities: [
		Mock.car({ id: 42, rideObject: 11, vehicleObject: 1 })
	]});

	const rideVehicle = new RideVehicle(42);

	t.is(rideVehicle._id, 42);
	t.is(rideVehicle._type()?.poweredAcceleration, 65);
	t.is(rideVehicle._type()?.numSeats, 6);
});


test("Ride vehicle type is cached", t =>
{
	globalThis.context = Mock.context({ objects: [
		Mock.rideObject({ index: 11, name: "Log Flume", vehicles: [
			Mock.rideObjectVehicle({ poweredAcceleration: 25, numSeats: 4 }),
			Mock.rideObjectVehicle({ poweredAcceleration: 65, numSeats: 6 })
		]})
	]});
	globalThis.map = Mock.map({ entities: [
		Mock.car({ id: 42, rideObject: 11, vehicleObject: 1 })
	]});

	const rideVehicle = new RideVehicle(42);

	const type1 = rideVehicle._type();
	const type2 = rideVehicle._type();
	t.is(type1, type2);

	const type3 = rideVehicle._type();
	t.is(type3, type1);
});


test("Ride vehicle is powered", t =>
{
	globalThis.context = Mock.context({ objects: [
		Mock.rideObject({ index: 24, name: "Monorail", vehicles: [
			Mock.rideObjectVehicle({ flags: (1 << 19) }),
		]})
	]});
	globalThis.map = Mock.map({ entities: [
		Mock.car({ id: 77, rideObject: 24, vehicleObject: 0 })
	]});

	const rideVehicle = new RideVehicle(77);

	t.true(rideVehicle._isPowered());
});


test("Ride vehicle is not powered", t =>
{
	globalThis.context = Mock.context({ objects: [
		Mock.rideObject({ index: 9, name: "Monorail", vehicles: [
			Mock.rideObjectVehicle({ flags: (1 << 18) }),
		]})
	]});
	globalThis.map = Mock.map({ entities: [
		Mock.car({ id: 68, rideObject: 9, vehicleObject: 0 })
	]});

	const rideVehicle = new RideVehicle(68);

	t.false(rideVehicle._isPowered());
});