/// <reference path="../../lib/openrct2.d.ts" />

import test from 'ava';
import VehicleEditor from "../../src/services/editor";
import VehicleSelector from "../../src/services/selector";
import StateWatcher, { RideSetStatusArgs } from "../../src/services/stateWatcher";
import VehicleEditorWindow from "../../src/ui/editorWindow";
import mock_Car from "../mocks/car.mock";
import mock_Context, { ContextMock } from "../mocks/context.mock";
import track from "../mocks/core/trackable";
import mock_GameMap, { GameMapMock } from "../mocks/gameMap.mock";
import mock_Ride from "../mocks/ride.mock";
import mock_RideObject from "../mocks/rideObject.mock";
import mock_RideObjectVehicle from "../mocks/rideObjectVehicle.mock";
import mock_Ui, { UiMock } from "../mocks/ui.mock";


function setupPark(): void
{
	global.context = mock_Context({
		objects: [
			mock_RideObject(<RideObject>{ index: 2, name: "chairlift", vehicles:
			[
				mock_RideObjectVehicle({
					carMass: 30, numSeats: 2, poweredAcceleration: 5, poweredMaxSpeed: 15, flags: ~0
				}),
			]}),
			mock_RideObject(<RideObject>{ index: 3, name: "wooden coaster", vehicles:
			[
				mock_RideObjectVehicle({
					carMass: 60, numSeats: 4
				}),
			]}),
		]
	});
	global.map = mock_GameMap({
		entities: [
			// charlift
			mock_Car(<Car>{ id: 20, ride: 6, rideObject: 2, vehicleObject: 0, trackProgress: 10 }),
			mock_Car(<Car>{ id: 21, ride: 6, rideObject: 2, vehicleObject: 0, trackProgress: 20 }),
		],
		rides: [
			mock_Ride(<Ride>{ id: 6, name: "chairlift 1", vehicles: [ 20, 21 ] }),
			mock_Ride(<Ride>{ id: 7, name: "wooden coaster 1" }),
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
	const tracker = track((map as GameMapMock).entities as Car[]);

	t.deepEqual(rideList.items, ["chairlift 1", "wooden coaster 1"]);

	map.rides.push(mock_Ride({ name: "freefall 1" }));
	context.executeAction("ridecreate", {}, () => t.pass());

	t.deepEqual(rideList.items, ["chairlift 1", "freefall 1", "wooden coaster 1"]);
	t.is(tracker._sets.total(), 0);
});


test("Ride demolish: reloads ride list", t =>
{
	setupWatcher();
	const context = (global.context as ContextMock);
	const map = (global.map as GameMapMock);
	const rideList = (global.ui as UiMock).createdWindows?.[0].findWidget<DropdownWidget>("rve-ride-list");
	const tracker = track((map as GameMapMock).entities as Car[]);

	t.deepEqual(rideList.items, ["chairlift 1", "wooden coaster 1"]);

	map.rides.shift();
	context.executeAction("ridedemolish", {}, () => t.pass());

	t.deepEqual(rideList.items, ["wooden coaster 1"]);
	t.is(tracker._sets.total(), 0);
});


test("Ride rename: reloads ride list", t =>
{
	setupWatcher();
	const context = (global.context as ContextMock);
	const map = (global.map as GameMapMock);
	const rideList = (global.ui as UiMock).createdWindows?.[0].findWidget<DropdownWidget>("rve-ride-list");
	const tracker = track((map as GameMapMock).entities as Car[]);

	t.deepEqual(rideList.items, ["chairlift 1", "wooden coaster 1"]);

	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	map.rides.find(r => r.id === 6)!.name = "xx best chairlift";
	context.executeAction("ridesetname", {}, () => t.pass());

	t.deepEqual(rideList.items, ["wooden coaster 1", "xx best chairlift"]);
	t.is(tracker._sets.total(), 0);
});


test("Ride open: reloads editor", t =>
{
	const params = setupWatcher();
	params.selector.selectRide(7);
	const context = (global.context as ContextMock);
	const map = (global.map as GameMapMock);
	const tracker = track((map as GameMapMock).entities as Car[]);

	const window = (global.ui as UiMock).createdWindows?.[0];
	const trainList = window.findWidget<DropdownWidget>("rve-train-list");
	const vehicleList = window.findWidget<DropdownWidget>("rve-vehicle-list");
	const rideType = window.findWidget<DropdownWidget>("rve-ride-type-list");
	const seats = window.findWidget<SpinnerWidget>("rve-seats-spinner");

	t.true(trainList.isDisabled);
	t.true(vehicleList.isDisabled);
	t.true(rideType.isDisabled);
	t.true(seats.isDisabled);
	t.deepEqual(trainList.items, ["No trains available"]);
	t.deepEqual(vehicleList.items, ["No vehicles available"]);
	t.deepEqual(rideType.items, ["No ride types available"]);
	t.is(trainList.selectedIndex, 0);
	t.is(vehicleList.selectedIndex, 0);
	t.is(rideType.selectedIndex, 0);
	t.is(seats.text, "Not available");

	map.entities.unshift(
		mock_Car({ id: 31, ride: 7, rideObject: 3, trackProgress: 110, nextCarOnTrain: 32}),
		mock_Car({ id: 32, ride: 7, rideObject: 3, trackProgress: 120 }),
		mock_Car({ id: 33, ride: 7, rideObject: 3, trackProgress: 210, nextCarOnTrain: 34 }),
		mock_Car({ id: 34, ride: 7, rideObject: 3, trackProgress: 220 }),
	);
	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	map.rides.find(r => r.id === 7)!.vehicles.push(31, 33);
	context.executeAction("ridesetstatus", <RideSetStatusArgs>{ ride: 7, status: 1 }, () => t.pass());

	t.false(trainList.isDisabled);
	t.false(vehicleList.isDisabled);
	t.false(rideType.isDisabled);
	t.false(seats.isDisabled);
	t.deepEqual(trainList.items, ["Train 1", "Train 2"]);
	t.deepEqual(vehicleList.items, ["Vehicle 1", "Vehicle 2"]);
	t.deepEqual(rideType.items, ["chairlift", "wooden coaster"]);
	t.is(trainList.selectedIndex, 0);
	t.is(vehicleList.selectedIndex, 0);
	t.is(rideType.selectedIndex, 1);
	t.is(seats.text, "4");

	t.is(tracker._sets.total(), 0);
});


test("Ride close and remove cars: reloads editor", t =>
{
	setupWatcher();
	const context = (global.context as ContextMock);
	const map = (global.map as GameMapMock);
	const tracker = track((map as GameMapMock).entities as Car[]);

	const window = (global.ui as UiMock).createdWindows?.[0];
	const trainList = window.findWidget<DropdownWidget>("rve-train-list");
	const vehicleList = window.findWidget<DropdownWidget>("rve-vehicle-list");
	const seats = window.findWidget<SpinnerWidget>("rve-seats-spinner");

	t.false(trainList.isDisabled);
	t.true(vehicleList.isDisabled);
	t.false(seats.isDisabled);
	t.deepEqual(trainList.items, ["Train 1", "Train 2"]);
	t.deepEqual(vehicleList.items, ["Vehicle 1"]);
	t.is(trainList.selectedIndex, 0);
	t.is(vehicleList.selectedIndex, 0);
	t.is(seats.text, "2");

	map.entities = [];
	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	map.rides.find(r => r.id === 6)!.vehicles.length = 0;
	context.executeAction("ridesetstatus", <RideSetStatusArgs>{ ride: 6, status: 0 }, () => t.pass());

	t.true(trainList.isDisabled);
	t.true(vehicleList.isDisabled);
	t.true(seats.isDisabled);
	t.deepEqual(trainList.items, ["No trains available"]);
	t.deepEqual(vehicleList.items, ["No vehicles available"]);
	t.is(trainList.selectedIndex, 0);
	t.is(vehicleList.selectedIndex, 0);
	t.is(seats.text, "Not available");

	t.is(tracker._sets.total(), 0);
});


test("Ride close but keep cars: nothing changes", t =>
{
	const params = setupWatcher();
	params.selector.selectTrain(1);
	const context = (global.context as ContextMock);
	const tracker = track((map as GameMapMock).entities as Car[]);

	const window = (global.ui as UiMock).createdWindows?.[0];
	const trainList = window.findWidget<DropdownWidget>("rve-train-list");
	const vehicleList = window.findWidget<DropdownWidget>("rve-vehicle-list");
	const seats = window.findWidget<SpinnerWidget>("rve-seats-spinner");

	t.false(trainList.isDisabled);
	t.true(vehicleList.isDisabled); // only 1 car on the train
	t.false(seats.isDisabled);
	t.deepEqual(trainList.items, ["Train 1", "Train 2"]);
	t.deepEqual(vehicleList.items, ["Vehicle 1"]);
	t.is(trainList.selectedIndex, 1);
	t.is(vehicleList.selectedIndex, 0);
	t.is(seats.text, "2");

	context.executeAction("ridesetstatus", <RideSetStatusArgs>{ ride: 6, status: 0 }, () => t.pass());

	t.false(trainList.isDisabled);
	t.true(vehicleList.isDisabled);  // only 1 car on the train
	t.false(seats.isDisabled);
	t.deepEqual(trainList.items, ["Train 1", "Train 2"]);
	t.deepEqual(vehicleList.items, ["Vehicle 1"]);
	t.is(trainList.selectedIndex, 1);
	t.is(vehicleList.selectedIndex, 0);
	t.is(seats.text, "2");

	t.is(tracker._sets.total(), 0);
});


test("Hidden window: do nothing", t =>
{
	const params = setupWatcher();
	const tracker = track((map as GameMapMock).entities as Car[]);
	params.window.close();

	context.executeAction("ridecreate", {}, () => t.pass());
	context.executeAction("ridedemolish", {}, () => t.pass());
	context.executeAction("ridesetname", {}, () => t.pass());
	context.executeAction("ridesetstatus", {}, () => t.pass());
	t.is(tracker._sets.total(), 0);
});