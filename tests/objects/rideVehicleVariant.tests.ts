/// <reference path="../../lib/openrct2.d.ts" />

import test from "ava";
import Mock from "openrct2-mocks";
import { getVisibility, isPowered, VehicleVisibility } from "../../src/objects/rideVehicleVariant";


test("Vehicle is visible", t =>
{
	const vehicles = [
		Mock.rideObjectVehicle({ baseImageId: 1, spriteWidth: 1, spriteHeightPositive: 1 }),
		Mock.rideObjectVehicle({ baseImageId: 100, spriteWidth: 168, spriteHeightPositive: 164 })
	];

	t.is(getVisibility(vehicles[0]), VehicleVisibility.Visible);
	t.is(getVisibility(vehicles[1]), VehicleVisibility.Visible);
});


test("Vehicle is invisible", t =>
{
	const vehicles = [
		Mock.rideObjectVehicle({ baseImageId: 58, spriteWidth: 0, spriteHeightPositive: 11 }),
		Mock.rideObjectVehicle({ baseImageId: 4, spriteWidth: 168, spriteHeightPositive: 0 }),
		Mock.rideObjectVehicle({ baseImageId: 22, spriteWidth: 0, spriteHeightPositive: 0 })
	];

	t.is(getVisibility(vehicles[0]), VehicleVisibility.Invisible);
	t.is(getVisibility(vehicles[1]), VehicleVisibility.Invisible);
	t.is(getVisibility(vehicles[2]), VehicleVisibility.Invisible);
});


test("Vehicle is a green square", t =>
{
	const vehicles = [
		Mock.rideObjectVehicle({ baseImageId: 0, spriteWidth: 1, spriteHeightPositive: 1 }),
		Mock.rideObjectVehicle({ baseImageId: 0, spriteWidth: 0, spriteHeightPositive: 11 }),
		Mock.rideObjectVehicle({ baseImageId: 0, spriteWidth: 168, spriteHeightPositive: 0 }),
		Mock.rideObjectVehicle({ baseImageId: 0, spriteWidth: 0, spriteHeightPositive: 0 })
	];

	t.is(getVisibility(vehicles[0]), VehicleVisibility.GreenSquare);
	t.is(getVisibility(vehicles[1]), VehicleVisibility.GreenSquare);
	t.is(getVisibility(vehicles[2]), VehicleVisibility.GreenSquare);
	t.is(getVisibility(vehicles[3]), VehicleVisibility.GreenSquare);
});


test("Vehicle is powered", t =>
{
	const vehicles = [
		Mock.rideObjectVehicle({ flags: (1 << 19) }),
		Mock.rideObjectVehicle({ flags: (1 << 19) | 2342341 })
	];

	t.true(isPowered(vehicles[0]));
	t.true(isPowered(vehicles[1]));
});


test("Vehicle is unpowered", t =>
{
	const vehicles = [
		Mock.rideObjectVehicle({ flags: (1 << 18) }),
		Mock.rideObjectVehicle({ flags: 23452156 }),
		Mock.rideObjectVehicle({ flags: 0 })
	];

	t.false(isPowered(vehicles[0]));
	t.false(isPowered(vehicles[1]));
	t.false(isPowered(vehicles[2]));
});
