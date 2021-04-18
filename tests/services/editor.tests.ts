/// <reference path="../../lib/openrct2.d.ts" />

import test from 'ava';
import VehicleEditor from "../../src/services/editor";
import VehicleSelector from "../../src/services/selector";
import mock_Car from "../mocks/car";
import mock_Context from "../mocks/context";
import mock_GameMap from "../mocks/gameMap";
import mock_Ride from "../mocks/ride";
import mock_RideObject from "../mocks/rideObject";
import mock_RideObjectVehicle from "../mocks/rideObjectVehicle";


function setupPark(): void
{
	global.context = mock_Context({
		objects: [
			mock_RideObject(<RideObject>{ index: 2, name: "steam trains", vehicles:
			[
				mock_RideObjectVehicle({
					carMass: 100, numSeats: 1, poweredAcceleration: 45, poweredMaxSpeed: 35, flags: ~0
				}),
				mock_RideObjectVehicle({
					carMass: 50, numSeats: 2
				}),
				mock_RideObjectVehicle({
					carMass: 200, numSeats: 4
				})
			]}),
		]
	});
	global.map = mock_GameMap({
		entities: [
			// steam trains
			mock_Car(<Car>{ id: 20, nextCarOnTrain: 21, ride: 7, rideObject: 2, vehicleObject: 0, trackProgress: 10 }),
			mock_Car(<Car>{ id: 21, nextCarOnTrain: 22, ride: 7, rideObject: 2, vehicleObject: 1, trackProgress: 15 }),
			mock_Car(<Car>{ id: 22, nextCarOnTrain: 23, ride: 7, rideObject: 2, vehicleObject: 2, trackProgress: 20 }),
			mock_Car(<Car>{ id: 23, nextCarOnTrain: null, ride: 7, rideObject: 2, vehicleObject: 2, trackProgress: 25 }),
		],
		rides: [
			mock_Ride(<Ride>{ id: 7, name: "steam trains 1", vehicles: [ 20 ] }),
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
	t.is(editor.mass.get(), 100);
	t.is(editor.seats.get(), 1);
	t.is(editor.poweredAcceleration.get(), 45);
	t.is(editor.poweredMaxSpeed.get(), 35);
	t.is(editor.trackProgress.get(), 10);
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
	t.is(editor.mass.get(), 50);
	t.is(editor.seats.get(), 2);
	t.is(editor.poweredAcceleration.get(), 0);
	t.is(editor.poweredMaxSpeed.get(), 0);
	t.is(editor.trackProgress.get(), 15);
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
	t.is(editor.mass.get(), 200);
	t.is(editor.seats.get(), 4);
	t.is(editor.poweredAcceleration.get(), 0);
	t.is(editor.poweredMaxSpeed.get(), 0);
	t.is(editor.trackProgress.get(), 20);
});