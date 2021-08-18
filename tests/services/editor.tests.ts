/// <reference path="../../lib/openrct2.d.ts" />

import test from "ava";
import Mock from "openrct2-mocks";
import VehicleEditor from "../../src/services/editor";
import VehicleSelector from "../../src/services/selector";


function setupPark(): void
{
	global.context = Mock.context({
		objects: [
			Mock.rideObject(<RideObject>{ index: 2, name: "steam trains", vehicles:
			[
				Mock.rideObjectVehicle({
					carMass: 100, numSeats: 1, poweredAcceleration: 45, poweredMaxSpeed: 35, flags: ~0
				}),
				Mock.rideObjectVehicle({
					carMass: 50, numSeats: 2
				}),
				Mock.rideObjectVehicle({
					carMass: 200, numSeats: 4
				})
			]}),
		]
	});
	global.map = Mock.map({
		entities: [
			// steam trains
			Mock.car(<Car>{ id: 20, nextCarOnTrain: 21, ride: 7, rideObject: 2, vehicleObject: 0, trackProgress: 10 }),
			Mock.car(<Car>{ id: 21, nextCarOnTrain: 22, ride: 7, rideObject: 2, vehicleObject: 1, trackProgress: 15 }),
			Mock.car(<Car>{ id: 22, nextCarOnTrain: 23, ride: 7, rideObject: 2, vehicleObject: 2, trackProgress: 20 }),
			Mock.car(<Car>{ id: 23, nextCarOnTrain: null, ride: 7, rideObject: 2, vehicleObject: 2, trackProgress: 25 }),
		],
		rides: [
			Mock.ride(<Ride>{ id: 7, name: "steam trains 1", vehicles: [ 20 ] }),
		]
	});
}


test("Set vehicle: locomotive", t =>
{
	setupPark();
	const selector = new VehicleSelector();
	const editor = new VehicleEditor(selector);
	selector.reloadRideList();

	selector.selectEntity(20);

	t.is(editor.rideTypeIndex.get(), 0);
	t.is(editor.variant.get(), 0);
	t.is(editor.trackProgress.get(), 10);
	t.is(editor.mass.get(), 100);
	t.is(editor.seats.get(), 1);
	t.is(editor.poweredAcceleration.get(), 45);
	t.is(editor.poweredMaxSpeed.get(), 35);
	t.true(editor.isPowered.get());
});


test("Set vehicle: tender", t =>
{
	setupPark();
	const selector = new VehicleSelector();
	const editor = new VehicleEditor(selector);
	selector.reloadRideList();

	selector.selectEntity(21);

	t.is(editor.rideTypeIndex.get(), 0);
	t.is(editor.variant.get(), 1);
	t.is(editor.trackProgress.get(), 15);
	t.is(editor.mass.get(), 50);
	t.is(editor.seats.get(), 2);
	t.is(editor.poweredAcceleration.get(), 0);
	t.is(editor.poweredMaxSpeed.get(), 0);
	t.false(editor.isPowered.get());
});


test("Set vehicle: passenger car", t =>
{
	setupPark();
	const selector = new VehicleSelector();
	const editor = new VehicleEditor(selector);
	selector.reloadRideList();

	selector.selectEntity(22);

	t.is(editor.rideTypeIndex.get(), 0);
	t.is(editor.variant.get(), 2);
	t.is(editor.trackProgress.get(), 20);
	t.is(editor.mass.get(), 200);
	t.is(editor.seats.get(), 4);
	t.is(editor.poweredAcceleration.get(), 0);
	t.is(editor.poweredMaxSpeed.get(), 0);
	t.false(editor.isPowered.get());
});


test.skip("Deselect: reset all values", t =>
{
	setupPark();
	const selector = new VehicleSelector();
	const editor = new VehicleEditor(selector);
	selector.reloadRideList();

	selector.selectEntity(20);
	selector.deselect();

	t.is(editor.rideTypeIndex.get(), 0);
	t.is(editor.variant.get(), 0);
	t.is(editor.trackProgress.get(), 0);
	t.is(editor.mass.get(), 0);
	t.is(editor.seats.get(), 0);
	t.is(editor.poweredAcceleration.get(), 0);
	t.is(editor.poweredMaxSpeed.get(), 0);
	t.false(editor.isPowered.get());
});