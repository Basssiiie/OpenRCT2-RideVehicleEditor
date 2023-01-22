/// <reference path="../../lib/openrct2.d.ts" />

import test from "ava";
import Mock from "openrct2-mocks";
import { getAllRideTypes, RideType } from "../../src/objects/rideType";
import { VehicleVisibility } from "../../src/objects/rideVehicleVariant";



test("getAllRideTypes() gets all ride types", t =>
{
	global.context = Mock.context({ objects: [
		Mock.rideObject({ index: 3, carsPerFlatRide: 255, name: "Log flume" }),
		Mock.rideObject({ index: 4, carsPerFlatRide: 4, name: "Space Rings" }),
		Mock.rideObject({ index: 5, carsPerFlatRide: 1, name: "Twister" }),
	]});

	const rideTypes = getAllRideTypes();

	t.is(rideTypes.length, 3);
	t.is(rideTypes[0]._id, 3);
	t.is(rideTypes[0]._object().name, "Log flume");
	t.is(rideTypes[1]._id, 4);
	t.is(rideTypes[1]._object().name, "Space Rings");
	t.is(rideTypes[2]._id, 5);
	t.is(rideTypes[2]._object().name, "Twister");
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
	t.is(rideTypes[0]._id, 4);
	t.is(rideTypes[0]._object().name, "Log flume");
	t.is(rideTypes[1]._id, 5);
	t.is(rideTypes[1]._object().name, "Space Rings");
	t.is(rideTypes[2]._id, 3);
	t.is(rideTypes[2]._object().name, "Twister");
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
	t.is(rideTypes[0]._id, 6);
	t.is(rideTypes[0]._object().name, "Log flume");
});


test("Ride type gets created from type id", t =>
{
	global.context = Mock.context({ objects: [
		Mock.rideObject({ index: 5, carsPerFlatRide: 0, name: "Info Kiosk" }),
		Mock.rideObject({ index: 12, carsPerFlatRide: 255, name: "Log flume" }),
	]});

	const rideType = new RideType(12);

	t.is(rideType._id, 12);
	t.is(rideType._object().name, "Log flume");
});


test("Ride type gets created from ride object", t =>
{
	const rideObject = Mock.rideObject({ index: 14, carsPerFlatRide: 255, name: "Dinghy Slide" });

	const rideType = new RideType(rideObject);

	t.is(rideType._id, 14);
	t.is(rideType._object().name, "Dinghy Slide");
});


test("Ride type refreshes correctly", t =>
{
	global.context = Mock.context({ objects: [
		Mock.rideObject({ index: 5, carsPerFlatRide: 0, name: "Info Kiosk" }),
		Mock.rideObject({ index: 12, carsPerFlatRide: 255, name: "Log flume" }),
	]});

	const rideType = new RideType(12);

	t.is(rideType._id, 12);
	t.is(rideType._object().name, "Log flume");

	rideType._refresh();
	t.is(rideType._object().name, "Log flume");
});


test("Ride type counts all variants", t =>
{
	const rideObject = Mock.rideObject({
		vehicles: [
			Mock.rideObjectVehicle({ baseImageId: 15, spriteWidth: 1, spriteHeightPositive: 1 }),
			Mock.rideObjectVehicle({ baseImageId: 125, spriteWidth: 1, spriteHeightPositive: 1 }),
			Mock.rideObjectVehicle({ baseImageId: 0 }),
			Mock.rideObjectVehicle({ baseImageId: 0 })
		]
	});

	const rideType = new RideType(rideObject);
	const variants = rideType._variants();

	t.is(variants[0]._visibility, VehicleVisibility.Visible);
	t.is(variants[1]._visibility, VehicleVisibility.Visible);
	t.is(variants[2]._visibility, VehicleVisibility.GreenSquare);
	t.is(variants.length, 3);
});


test("Ride type recognises gaps in variants", t =>
{
	const rideObject = Mock.rideObject({
		vehicles: [
			Mock.rideObjectVehicle({ baseImageId: 15, spriteWidth: 1, spriteHeightPositive: 1 }),
			Mock.rideObjectVehicle({ baseImageId: 0 }),
			Mock.rideObjectVehicle({ baseImageId: 0 }),
			Mock.rideObjectVehicle({ baseImageId: 125, spriteWidth: 1, spriteHeightPositive: 1 }),
			Mock.rideObjectVehicle({ baseImageId: 5 }),
		]
	});

	const rideType = new RideType(rideObject);
	const variants = rideType._variants();

	t.is(variants[0]._visibility, VehicleVisibility.Visible);
	t.is(variants[1]._visibility, VehicleVisibility.GreenSquare);
	t.is(variants[2]._visibility, VehicleVisibility.GreenSquare);
	t.is(variants[3]._visibility, VehicleVisibility.Visible);
	t.is(variants[4]._visibility, VehicleVisibility.Invisible);
	t.is(variants.length, 5);
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
	const variants = rideType._variants();

	t.is(variants[0]._visibility, VehicleVisibility.GreenSquare); // extra invisible
	t.is(variants.length, 1);
});


test("Ride type with all variants", t =>
{
	const rideObject = Mock.rideObject({
		vehicles: [
			Mock.rideObjectVehicle({ baseImageId: 10, spriteWidth: 1, spriteHeightPositive: 1 }),
			Mock.rideObjectVehicle({ baseImageId: 11, spriteWidth: 1, spriteHeightPositive: 1 }),
			Mock.rideObjectVehicle({ baseImageId: 12, spriteWidth: 1, spriteHeightPositive: 1 }),
			Mock.rideObjectVehicle({ baseImageId: 13, spriteWidth: 1, spriteHeightPositive: 1 })
		]
	});

	const rideType = new RideType(rideObject);
	const variants = rideType._variants();

	t.is(variants[0]._visibility, VehicleVisibility.Visible);
	t.is(variants[1]._visibility, VehicleVisibility.Visible);
	t.is(variants[2]._visibility, VehicleVisibility.Visible);
	t.is(variants[3]._visibility, VehicleVisibility.Visible);
	t.is(variants.length, 4);
});