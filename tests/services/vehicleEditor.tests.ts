/// <reference path="../../lib/openrct2.d.ts" />

import test from "ava";
import Mock from "openrct2-mocks";
import { RideType } from "../../src/objects/rideType";
import { registerActions } from "../../src/services/actions";
import { setMass, setPositionX, setPositionY, setPositionZ, setPoweredAcceleration, setPoweredMaximumSpeed, setPrimaryColour, setRideType, setSeatCount, setSecondaryColour, setTertiaryColour, setVariant } from "../../src/services/vehicleEditor";


function setupCarMock(carId: number): Car
{
	const car = Mock.car({ id: carId, rideObject: 2, mass: 25 + 31 });
	globalThis.map = Mock.map({ entities: [ car ]});
	return car;
}
test.before(() =>
{
	globalThis.context = Mock.context({
		getTypeIdForAction: () => 80,
		objects: [
			Mock.rideObject({ index: 2, vehicles: [
				Mock.rideObjectVehicle({ carMass: 25, numSeats: 4 }),
				Mock.rideObjectVehicle({ carMass: 100, numSeats: 0 }),
				Mock.rideObjectVehicle({ carMass: 85, numSeats: 6 }),
				Mock.rideObjectVehicle({ carMass: 1400, numSeats: 14, poweredAcceleration: 11, poweredMaxSpeed: 12 })
			]}),
			Mock.rideObject({ index: 23, vehicles: [
				Mock.rideObjectVehicle({ carMass: 800, numSeats: 10, poweredAcceleration: 40, poweredMaxSpeed: 35 }),
				Mock.rideObjectVehicle({ carMass: 550, numSeats: 1 })
			]}),
			Mock.rideObject({ index: 55, vehicles: [
				Mock.rideObjectVehicle({ carMass: 265, numSeats: 12 })
			]})
		]
	});
	globalThis.network = Mock.network({
		groups: [ Mock.playerGroup({ permissions: [ "ride_properties" ] })]
	});
	registerActions();
});


test("Set ride type", t =>
{
	const car = setupCarMock(99);

	setRideType([[ 99, 1, 1]], new RideType(Mock.rideObject({ index: 23 })));
	t.is(car.rideObject, 23);

	// Reset other properties
	t.is(car.vehicleObject, 0);
	t.is(car.mass, 800 + 31);
	t.is(car.numSeats, 10);
	t.is(car.poweredAcceleration, 40);
	t.is(car.poweredMaxSpeed, 35);

	setRideType([[ 99, 1, 1]], new RideType(Mock.rideObject({ index: 55 })));
	t.is(car.rideObject, 55);

	// Reset other properties
	t.is(car.vehicleObject, 0);
	t.is(car.mass, 265 + 31);
	t.is(car.numSeats, 12);
	t.is(car.poweredAcceleration, 0);
	t.is(car.poweredMaxSpeed, 0);
});


test("Set variant", t =>
{
	const car = setupCarMock(56);

	setVariant([[ 56, 1, 1]], 3);
	t.is(car.vehicleObject, 3);

	// Reset other properties
	t.is(car.rideObject, 2);
	t.is(car.mass, 1400 + 31);
	t.is(car.numSeats, 14);
	t.is(car.poweredAcceleration, 11);
	t.is(car.poweredMaxSpeed, 12);

	setVariant([[ 56, 1, 1]], 1);
	t.is(car.vehicleObject, 1);

	// Reset other properties
	t.is(car.rideObject, 2);
	t.is(car.mass, 100 + 31);
	t.is(car.numSeats, 0);
	t.is(car.poweredAcceleration, 0);
	t.is(car.poweredMaxSpeed, 0);
});


test("Set seat count", t =>
{
	const car = setupCarMock(58);

	setSeatCount([[ 58, 1, 1]], 26);
	t.is(car.numSeats, 26);

	setSeatCount([[ 58, 1, 1]], 10);
	t.is(car.numSeats, 10);
});


test("Set mass", t =>
{
	const car = setupCarMock(58);

	setMass([[ 58, 1, 1]], 260);
	t.is(car.mass, 260);

	setMass([[ 58, 1, 1]], 9800);
	t.is(car.mass, 9800);
});


test("Set powered acceleration", t =>
{
	const car = setupCarMock(42);

	setPoweredAcceleration([[ 42, 1, 1]], 120);
	t.is(car.poweredAcceleration, 120);

	setPoweredAcceleration([[ 42, 1, 1]], 5);
	t.is(car.poweredAcceleration, 5);
});


test("Set powered max speed", t =>
{
	const car = setupCarMock(9);

	setPoweredMaximumSpeed([[ 9, 1, 1]], 65);
	t.is(car.poweredMaxSpeed, 65);

	setPoweredMaximumSpeed([[ 9, 1, 1]], 30);
	t.is(car.poweredMaxSpeed, 30);
});


test("Set primary colour", t =>
{
	const car = setupCarMock(9);

	setPrimaryColour([[ 9, 1, 1]], 5);
	t.is(car.colours.body, 5);

	setPrimaryColour([[ 9, 1, 1]], 31);
	t.is(car.colours.body, 31);
});


test("Set secondary colour", t =>
{
	const car = setupCarMock(19);

	setSecondaryColour([[ 19, 1, 1]], 12);
	t.is(car.colours.trim, 12);

	setSecondaryColour([[ 19, 1, 1]], 0);
	t.is(car.colours.trim, 0);
});


test("Set tertiary colour", t =>
{
	const car = setupCarMock(23);

	setTertiaryColour([[ 23, 1, 1]], 25);
	t.is(car.colours.tertiary, 25);

	setTertiaryColour([[ 23, 1, 1]], 2);
	t.is(car.colours.tertiary, 2);
});


test("Set x position", t =>
{
	const car = setupCarMock(29);

	setPositionX([[ 29, 1, 1]], 10);
	t.is(car.x, 10);

	setPositionX([[ 29, 1, 1]], 10_090);
	t.is(car.x, 10 + 10_090);

	setPositionX([[ 29, 1, 1]], -3);
	t.is(car.x, 10 + 10_090 - 3);
});


test("Set y position", t =>
{
	const car = setupCarMock(10);

	setPositionY([[ 10, 1, 1]], 5020);
	t.is(car.y, 5020);

	setPositionY([[ 10, 1, 1]], -302_010);
	t.is(car.y, 5020 - 302_010);

	setPositionY([[ 10, 1, 1]], 15);
	t.is(car.y, 5020 - 302_010 + 15);
});


test("Set z position", t =>
{
	const car = setupCarMock(101);

	setPositionZ([[ 101, 1, 1]], -698);
	t.is(car.z, -698);

	setPositionZ([[ 101, 1, 1]], 653);
	t.is(car.z, -698 + 653);

	setPositionZ([[ 101, 1, 1]], -10);
	t.is(car.z, -698 + 653 - 10);
});
