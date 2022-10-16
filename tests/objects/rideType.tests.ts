/// <reference path="../../lib/openrct2.d.ts" />

import test from "ava";
import Mock from "openrct2-mocks";
import { getAllRideTypes, RideType } from "../../src/objects/rideType";



test("getAllRideTypes() gets all ride types", t =>
{
	global.context = Mock.context({ objects: [
		Mock.rideObject({ index: 3, carsPerFlatRide: 255, name: "Log flume" }),
		Mock.rideObject({ index: 4, carsPerFlatRide: 4, name: "Space Rings" }),
		Mock.rideObject({ index: 5, carsPerFlatRide: 1, name: "Twister" }),
	]});

	const rideTypes = getAllRideTypes();

	t.is(rideTypes.length, 3);
	t.is(rideTypes[0].id, 3);
	t.is(rideTypes[0].object().name, "Log flume");
	t.is(rideTypes[1].id, 4);
	t.is(rideTypes[1].object().name, "Space Rings");
	t.is(rideTypes[2].id, 5);
	t.is(rideTypes[2].object().name, "Twister");
});


test("getAllRideTypes() sorts ride types alphabetically", t =>
{
	global.context = Mock.context({ objects: [
		Mock.rideObject({ index: 3, carsPerFlatRide: 1, name: "Twister" }),
		Mock.rideObject({ index: 4, carsPerFlatRide: 255, name: "Log flume" }),
		Mock.rideObject({ index: 5, carsPerFlatRide: 4, name: "Space Rings" }),
	]});

	const rideTypes = getAllRideTypes();

	t.is(rideTypes.length, 3);
	t.is(rideTypes[0].id, 4);
	t.is(rideTypes[0].object().name, "Log flume");
	t.is(rideTypes[1].id, 5);
	t.is(rideTypes[1].object().name, "Space Rings");
	t.is(rideTypes[2].id, 3);
	t.is(rideTypes[2].object().name, "Twister");
});


test("getAllRideTypes() skips stalls", t =>
{
	global.context = Mock.context({ objects: [
		Mock.rideObject({ index: 5, carsPerFlatRide: 0, name: "Info Kiosk" }),
		Mock.rideObject({ index: 6, carsPerFlatRide: 255, name: "Log flume" }),
		Mock.rideObject({ index: 7, carsPerFlatRide: 0, name: "Pizza Stall" }),
	]});

	const rideTypes = getAllRideTypes();

	t.is(rideTypes.length, 1);
	t.is(rideTypes[0].id, 6);
	t.is(rideTypes[0].object().name, "Log flume");
});


test("Ride type gets created from type id", t =>
{
	global.context = Mock.context({ objects: [
		Mock.rideObject({ index: 5, carsPerFlatRide: 0, name: "Info Kiosk" }),
		Mock.rideObject({ index: 12, carsPerFlatRide: 255, name: "Log flume" }),
	]});

	const rideType = new RideType(12);

	t.is(rideType.id, 12);
	t.is(rideType.object().name, "Log flume");
});


test("Ride type gets created from ride object", t =>
{
	const rideObject = Mock.rideObject({ index: 14, carsPerFlatRide: 255, name: "Dinghy Slide" });

	const rideType = new RideType(rideObject);

	t.is(rideType.id, 14);
	t.is(rideType.object().name, "Dinghy Slide");
});


test("Ride type refreshes correctly", t =>
{
	global.context = Mock.context({ objects: [
		Mock.rideObject({ index: 5, carsPerFlatRide: 0, name: "Info Kiosk" }),
		Mock.rideObject({ index: 12, carsPerFlatRide: 255, name: "Log flume" }),
	]});

	const rideType = new RideType(12);

	t.is(rideType.id, 12);
	t.is(rideType.object().name, "Log flume");

	rideType.refresh();
	t.is(rideType.object().name, "Log flume");
});


test("Ride type counts all variants", t =>
{
	const rideObject = Mock.rideObject({
		vehicles: [
			Mock.rideObjectVehicle({ baseImageId: 15 }),
			Mock.rideObjectVehicle({ baseImageId: 125 }),
			Mock.rideObjectVehicle({ baseImageId: 0 }),
			Mock.rideObjectVehicle({ baseImageId: 0 })
		]
	});

	const rideType = new RideType(rideObject);

	t.is(rideType.variants(), 2);
});


test("Ride type recognises gaps in variants", t =>
{
	const rideObject = Mock.rideObject({
		vehicles: [
			Mock.rideObjectVehicle({ baseImageId: 15 }),
			Mock.rideObjectVehicle({ baseImageId: 0 }),
			Mock.rideObjectVehicle({ baseImageId: 125 }),
			Mock.rideObjectVehicle({ baseImageId: 0 })
		]
	});

	const rideType = new RideType(rideObject);

	t.is(rideType.variants(), 3);
});


test("Ride type with zero variants", t =>
{
	const rideObject = Mock.rideObject({
		vehicles: [
			Mock.rideObjectVehicle({ baseImageId: 0 }),
			Mock.rideObjectVehicle({ baseImageId: 0 })
		]
	});

	const rideType = new RideType(rideObject);

	t.is(rideType.variants(), 0);
});


test("Ride type with all variants", t =>
{
	const rideObject = Mock.rideObject({
		vehicles: [
			Mock.rideObjectVehicle({ baseImageId: 10 }),
			Mock.rideObjectVehicle({ baseImageId: 11 }),
			Mock.rideObjectVehicle({ baseImageId: 12 }),
			Mock.rideObjectVehicle({ baseImageId: 13 })
		]
	});

	const rideType = new RideType(rideObject);

	t.is(rideType.variants(), 4);
});