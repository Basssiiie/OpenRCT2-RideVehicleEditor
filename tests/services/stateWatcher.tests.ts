/// <reference path="../../lib/openrct2.d.ts" />

import test from 'ava';
import VehicleEditor from "../../src/services/editor";
import VehicleSelector from "../../src/services/selector";
import StateWatcher from "../../src/services/stateWatcher";
import VehicleEditorWindow from "../../src/ui/editorWindow";
import mock_Car from "../mocks/car";
import mock_Context, { ContextMock } from "../mocks/context";
import mock_GameMap, { GameMapMock } from "../mocks/gameMap";
import mock_Ride from "../mocks/ride";
import mock_RideObject from "../mocks/rideObject";
import mock_RideObjectVehicle from "../mocks/rideObjectVehicle";
import mock_Ui, { UiMock } from "../mocks/ui";


function setupPark(): void
{
	global.context = mock_Context({
		objects: [
			mock_RideObject(<RideObject>{ index: 2, name: "chairlift", vehicles:
			[
				mock_RideObjectVehicle({
					carMass: 30, numSeats: 3, poweredAcceleration: 5, poweredMaxSpeed: 15, flags: ~0
				}),
			]}),
			mock_RideObject(<RideObject>{ index: 3, name: "mine train coaster", vehicles:
			[
				mock_RideObjectVehicle({
					carMass: 60, numSeats: 2
				}),
				mock_RideObjectVehicle({
					carMass: 50, numSeats: 4
				}),
			]}),
			mock_RideObject(<RideObject>{ index: 4, name: "monorail", vehicles:
			[
				mock_RideObjectVehicle({
					carMass: 80, numSeats: 6, poweredAcceleration: 12, poweredMaxSpeed: 42, flags: ~0
				}),
				mock_RideObjectVehicle({
					carMass: 100, numSeats: 8, poweredAcceleration: 14, poweredMaxSpeed: 44, flags: ~0
				}),
				mock_RideObjectVehicle({
					carMass: 120, numSeats: 10
				}),
			]}),
		]
	});
	global.map = mock_GameMap({
		entities: [
			// charlift
			mock_Car(<Car>{ id: 20, nextCarOnTrain: null, ride: 6, rideObject: 2, vehicleObject: 0, trackProgress: 10 }),
			mock_Car(<Car>{ id: 21, nextCarOnTrain: null, ride: 6, rideObject: 2, vehicleObject: 0, trackProgress: 20 }),
		],
		rides: [
			mock_Ride(<Ride>{ id: 6, name: "chairlift 1", vehicles: [ 20, 21 ] }),
			mock_Ride(<Ride>{ id: 7, name: "mine train 1", vehicles: [ 30 ] }),
		]
	});
	global.ui = mock_Ui();
}


// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function setupWatcher()
{
	VehicleEditorWindow.resetGlobals();
	setupPark();
	const selector = new VehicleSelector();
	const editor = new VehicleEditor(selector);
	selector.reloadRideList();
	const window = new VehicleEditorWindow(selector, editor);
	window.show();

	return {
		selector: selector,
		editor: editor,
		window: window,
		watcher: new StateWatcher(window, selector, editor)
	};
}


test("Dispose: disposes all subscriptions", t =>
{
	const params = setupWatcher();
	const context = (global.context as ContextMock);

	t.true(context.subscriptions.every(s => s.isDisposed === false));

	params.watcher.dispose();

	t.is(context.subscriptions.filter(s => s.isDisposed === true).length, 2);
});


test("Ride create: reloads ride list", t =>
{
	setupWatcher();
	const context = (global.context as ContextMock);
	const map = (global.map as GameMapMock);
	const rideList = (global.ui as UiMock).createdWindows?.[0].findWidget<DropdownWidget>("rve-ride-list");

	t.deepEqual(rideList.items, ["chairlift 1", "mine train 1"]);

	map.rides.push(mock_Ride({ name: "freefall 1" }));
	context.executeAction("ridecreate", {}, () => t.pass());

	t.deepEqual(rideList.items, ["chairlift 1", "freefall 1", "mine train 1"]);
});


test("Ride demolish: reloads ride list", t =>
{
	setupWatcher();
	const context = (global.context as ContextMock);
	const map = (global.map as GameMapMock);
	const rideList = (global.ui as UiMock).createdWindows?.[0].findWidget<DropdownWidget>("rve-ride-list");

	t.deepEqual(rideList.items, ["chairlift 1", "mine train 1"]);

	map.rides.shift();
	context.executeAction("ridedemolish", {}, () => t.pass());

	t.deepEqual(rideList.items, ["mine train 1"]);
});


test("Ride rename: reloads ride list", t =>
{
	setupWatcher();
	const context = (global.context as ContextMock);
	const map = (global.map as GameMapMock);
	const rideList = (global.ui as UiMock).createdWindows?.[0].findWidget<DropdownWidget>("rve-ride-list");

	t.deepEqual(rideList.items, ["chairlift 1", "mine train 1"]);

	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	map.rides.find(r => r.id === 6)!.name = "the best chairlift";
	context.executeAction("ridesetname", {}, () => t.pass());

	t.deepEqual(rideList.items, ["mine train 1", "the best chairlift"]);
});


test("Hidden window: do nothing", t =>
{
	t.plan(4);

	const params = setupWatcher();
	params.window.close();

	context.executeAction("ridecreate", {}, () => t.pass());
	context.executeAction("ridedemolish", {}, () => t.pass());
	context.executeAction("ridesetname", {}, () => t.pass());
	context.executeAction("ridesetstatus", {}, () => t.pass());
});