/// <reference path="../../lib/openrct2.d.ts" />

import test from "ava";
import Mock from "openrct2-mocks";
import { RideType } from "../../src/objects/rideType";
import { initActions } from "../../src/services/actions";
import { setMass, setPositionX, setPositionY, setPositionZ, setPoweredAcceleration, setPoweredMaximumSpeed, setPrimaryColour, setRideType, setSeatCount, setSecondaryColour, setTertiaryColour, setVariant } from "../../src/services/vehicleEditor";


function setupCarMock(carId: number): Car
{
	const car = Mock.car({ id: carId, rideObject: 2 });
	global.map = Mock.map({ entities: [ car ]});
	return car;
}
test.before(() =>
{
	global.context = Mock.context({
		getTypeIdForAction: () => 80
	});
	global.network = Mock.network({
		groups: [ Mock.playerGroup({ permissions: [ "ride_properties" ] })]
	});
	initActions();
});


test("Set ride type", t =>
{
	const car = setupCarMock(99);

	setRideType([[ 99, 1 ]], new RideType(Mock.rideObject({ index: 23 })));
	t.is(car.rideObject, 23);

	setRideType([[ 99, 1 ]], new RideType(Mock.rideObject({ index: 55 })));
	t.is(car.rideObject, 55);
});


test("Set variant", t =>
{
	const car = setupCarMock(56);

	setVariant([[ 56, 1 ]], 3);
	t.is(car.vehicleObject, 3);

	setVariant([[ 56, 1 ]], 1);
	t.is(car.vehicleObject, 1);
});


test("Set seat count", t =>
{
	const car = setupCarMock(58);

	setSeatCount([[ 58, 1 ]], 26);
	t.is(car.numSeats, 26);

	setSeatCount([[ 58, 1 ]], 10);
	t.is(car.numSeats, 10);
});


test("Set mass", t =>
{
	const car = setupCarMock(58);

	setMass([[ 58, 1 ]], 260);
	t.is(car.mass, 260);

	setMass([[ 58, 1 ]], 9800);
	t.is(car.mass, 9800);
});


test("Set powered acceleration", t =>
{
	const car = setupCarMock(42);

	setPoweredAcceleration([[ 42, 1 ]], 120);
	t.is(car.poweredAcceleration, 120);

	setPoweredAcceleration([[ 42, 1 ]], 5);
	t.is(car.poweredAcceleration, 5);
});


test("Set powered max speed", t =>
{
	const car = setupCarMock(9);

	setPoweredMaximumSpeed([[ 9, 1 ]], 65);
	t.is(car.poweredMaxSpeed, 65);

	setPoweredMaximumSpeed([[ 9, 1 ]], 30);
	t.is(car.poweredMaxSpeed, 30);
});


test("Set primary colour", t =>
{
	const car = setupCarMock(9);

	setPrimaryColour([[ 9, 1 ]], 5);
	t.is(car.colours.body, 5);

	setPrimaryColour([[ 9, 1 ]], 31);
	t.is(car.colours.body, 31);
});


test("Set secondary colour", t =>
{
	const car = setupCarMock(19);

	setSecondaryColour([[ 19, 1 ]], 12);
	t.is(car.colours.trim, 12);

	setSecondaryColour([[ 19, 1 ]], 0);
	t.is(car.colours.trim, 0);
});


test("Set tertiary colour", t =>
{
	const car = setupCarMock(23);

	setTertiaryColour([[ 23, 1 ]], 25);
	t.is(car.colours.tertiary, 25);

	setTertiaryColour([[ 23, 1 ]], 2);
	t.is(car.colours.tertiary, 2);
});


test("Set x position", t =>
{
	const car = setupCarMock(29);

	setPositionX([[ 29, 1 ]], 10);
	t.is(car.x, 10);

	setPositionX([[ 29, 1 ]], 10090);
	t.is(car.x, 10 + 10090);

	setPositionX([[ 29, 1 ]], -3);
	t.is(car.x, 10 + 10090 - 3);
});


test("Set y position", t =>
{
	const car = setupCarMock(10);

	setPositionY([[ 10, 1 ]], 5020);
	t.is(car.y, 5020);

	setPositionY([[ 10, 1 ]], -302010);
	t.is(car.y, 5020 - 302010);

	setPositionY([[ 10, 1 ]], 15);
	t.is(car.y, 5020 - 302010 + 15);
});


test("Set z position", t =>
{
	const car = setupCarMock(101);

	setPositionZ([[ 101, 1 ]], -698);
	t.is(car.z, -698);

	setPositionZ([[ 101, 1 ]], 653);
	t.is(car.z, -698 + 653);

	setPositionZ([[ 101, 1 ]], -10);
	t.is(car.z, -653 + 653 - 10);
});