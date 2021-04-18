/// <reference path="../../lib/openrct2.d.ts" />

import test from 'ava';
import VehicleEditor from "../../src/services/editor";
import VehicleSelector from "../../src/services/selector";
import VehicleEditorWindow from "../../src/ui/editorWindow";
import mock_Car from "../mocks/car";
import mock_Context from "../mocks/context";
import mock_GameMap from "../mocks/gameMap";
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
					carMass: 30, numSeats: 2, poweredAcceleration: 5, poweredMaxSpeed: 15, flags: ~0
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
		]
	});
	global.map = mock_GameMap({
		entities: [
			// charlift
			mock_Car(<Car>{ id: 20, nextCarOnTrain: null, ride: 6, rideObject: 2, vehicleObject: 0, trackProgress: 10 }),
			mock_Car(<Car>{ id: 21, nextCarOnTrain: null, ride: 6, rideObject: 2, vehicleObject: 0, trackProgress: 20 }),
			// mine train
			mock_Car(<Car>{ id: 30, nextCarOnTrain: 31, ride: 7, rideObject: 3, vehicleObject: 0, trackProgress: 15 }),
			mock_Car(<Car>{ id: 31, nextCarOnTrain: 32, ride: 7, rideObject: 3, vehicleObject: 1, trackProgress: 25 }),
			mock_Car(<Car>{ id: 32, nextCarOnTrain: null, ride: 7, rideObject: 3, vehicleObject: 1, trackProgress: 35 }),
		],
		rides: [
			mock_Ride(<Ride>{ id: 6, name: "chairlift 1", vehicles: [ 20, 21 ] }),
			mock_Ride(<Ride>{ id: 7, name: "mine train 1", vehicles: [ 30 ] }),
		]
	});
	global.ui = mock_Ui();
}


interface TestSetup
{
	selector: VehicleSelector;
	editor: VehicleEditor;
	window: VehicleEditorWindow;
}


function setupWindow(): TestSetup
{
	setupPark();
	const selector = new VehicleSelector();
	const editor = new VehicleEditor(selector);
	selector.reloadRideList();

	return {
		selector: selector,
		editor: editor,
		window: new VehicleEditorWindow(selector, editor)
	};
}


test("All controls are initialized", t =>
{
	const params = setupWindow();
	const window = params.window;

	t.truthy(window.ridesInParkList);
	t.truthy(window.trainList);
	t.truthy(window.vehicleList);
	t.truthy(window.viewport);
	t.truthy(window.rideTypeList);
	t.truthy(window.variantSpinner);
	t.truthy(window.trackProgressSpinner);
	t.truthy(window.seatCountSpinner);
	t.truthy(window.powAccelerationSpinner);
	t.truthy(window.powMaxSpeedSpinner);
	t.truthy(window.massSpinner);
	t.truthy(window.applyToOthersButton);
	t.truthy(window.multiplierDropdown);
});


test("Show window: correct title", t =>
{
	const params = setupWindow();
	const window = params.window;

	window.show();

	const ui = global.ui as UiMock;
	const created = ui.createdWindows?.[0];
	t.truthy(created);
	t.is(created?.classificationName, "ride-vehicle-editor");
	t.true(created?.title.startsWith("Ride vehicle editor"));
});


test("Show window: ride list", t =>
{
	const params = setupWindow();
	const window = params.window;

	window.show();

	const ui = global.ui as UiMock;
	const created = ui.createdWindows?.[0];

	const rideList = created?.findWidget<DropdownWidget>("rve-ride-list");
	t.deepEqual(rideList?.items, [ "chairlift 1", "mine train 1" ]);
	t.is(rideList?.selectedIndex, 0);
	t.false(rideList?.isDisabled);
});


test("Show window: chairlift train list", t =>
{
	const params = setupWindow();
	const window = params.window;

	window.show();

	const ui = global.ui as UiMock;
	const created = ui.createdWindows?.[0];

	const trainList = created?.findWidget<DropdownWidget>("rve-train-list");
	t.deepEqual(trainList?.items, [ "Train 1", "Train 2" ]);
	t.false(trainList?.isDisabled);
});


test("Show window: chairlift vehicle list", t =>
{
	const params = setupWindow();
	const window = params.window;

	window.show();

	const ui = global.ui as UiMock;
	const created = ui.createdWindows?.[0];

	const vehicleList = created?.findWidget<DropdownWidget>("rve-vehicle-list");
	t.deepEqual(vehicleList?.items, [ "Vehicle 1" ]);
	t.true(vehicleList?.isDisabled); // disable on 1 item
});


// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function getWidgets(window?: Window)
{
	return {
		variant: window?.findWidget<SpinnerWidget>("rve-variant-spinner"),
		trackProgress: window?.findWidget<SpinnerWidget>("rve-track-progress-spinner"),
		seats: window?.findWidget<SpinnerWidget>("rve-seats-spinner"),
		mass: window?.findWidget<SpinnerWidget>("rve-mass-spinner"),
		poweredAcceleration: window?.findWidget<SpinnerWidget>("rve-powered-acceleration-spinner"),
		poweredMaxSpeed: window?.findWidget<SpinnerWidget>("rve-powered-max-speed-spinner")
	};
}


test("Show window: chairlift first car properties", t =>
{
	const params = setupWindow();
	//const entity = (global.map as GameMapMock).getEntity(20) as Car;
	//const tracker = track<Car>(entity);
	const window = params.window;

	window.show();

	const ui = global.ui as UiMock;
	const created = ui.createdWindows?.[0];

	const widgets = getWidgets(created);
	t.is(widgets.variant?.text, "0");
	t.is(widgets.trackProgress?.text, "10");
	t.is(widgets.seats?.text, "2");
	t.is(widgets.mass?.text, "30");
	t.is(widgets.poweredAcceleration?.text, "5");
	t.is(widgets.poweredMaxSpeed?.text, "15");
});


test("Show window: mine train second car properties", t =>
{
	const params = setupWindow();
	//const entity = (global.map as GameMapMock).getEntity(20) as Car;
	//const tracker = track<Car>(entity);
	const window = params.window;

	window.show();
	params.selector.selectEntity(31);

	const ui = global.ui as UiMock;
	const created = ui.createdWindows?.[0];

	const widgets = getWidgets(created);
	t.is(widgets.variant?.text, "1");
	t.is(widgets.trackProgress?.text, "25");
	t.is(widgets.seats?.text, "4");
	t.is(widgets.mass?.text, "50");
	t.is(widgets.poweredAcceleration?.text, "Only on powered vehicles.");
	t.is(widgets.poweredMaxSpeed?.text, "Only on powered vehicles.");
});