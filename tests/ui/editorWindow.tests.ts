/// <reference path="../../lib/openrct2.d.ts" />

import test from 'ava';
import VehicleEditor from "../../src/services/editor";
import VehicleSelector from "../../src/services/selector";
import VehicleEditorWindow from "../../src/ui/editorWindow";
import mock_Car from "../mocks/car";
import mock_Context from "../mocks/context";
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


// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function setupWindow()
{
	VehicleEditorWindow.resetGlobals();
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


// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function getWidgets()
{
	const window = (global.ui as UiMock).createdWindows?.[0];
	function get<T extends Widget>(widget: string): T | undefined
	{
		return window?.findWidget<T>(widget);
	}
	return {
		rideList: get<DropdownWidget>("rve-ride-list"),
		trainList: get<DropdownWidget>("rve-train-list"),
		vehicleList: get<DropdownWidget>("rve-vehicle-list"),
		rideTypeList: get<DropdownWidget>("rve-ride-type-list"),
		variant: get<SpinnerWidget>("rve-variant-spinner"),
		trackProgress: get<SpinnerWidget>("rve-track-progress-spinner"),
		seats: get<SpinnerWidget>("rve-seats-spinner"),
		mass: get<SpinnerWidget>("rve-mass-spinner"),
		poweredAcceleration: get<SpinnerWidget>("rve-powered-acceleration-spinner"),
		poweredMaxSpeed: get<SpinnerWidget>("rve-powered-max-speed-spinner"),
		applyToOthers: get<ButtonWidget>("rve-apply-to-others-button"),
		multiplier: get<DropdownWidget>("rve-multiplier-dropdown"),
		locate: get<ButtonWidget>("rve-locate-button"),
		picker: get<ButtonWidget>("rve-picker-button"),
		copy: get<ButtonWidget>("rve-copy-button"),
		paste: get<ButtonWidget>("rve-paste-button"),
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

	const created = (global.ui as UiMock).createdWindows?.[0];
	t.truthy(created);
	t.is(created?.classificationName, "ride-vehicle-editor");
	t.true(created?.title.startsWith("Ride vehicle editor"));
});


test("Show window: ride list", t =>
{
	const params = setupWindow();
	const window = params.window;

	window.show();

	const widgets = getWidgets();
	t.deepEqual(widgets.rideList?.items, [ "chairlift 1", "mine train 1" ]);
	t.is(widgets.rideList?.selectedIndex, 0);
	t.false(widgets.rideList?.isDisabled);
});


test("Show window: chairlift train list", t =>
{
	const params = setupWindow();
	const window = params.window;

	window.show();

	const widgets = getWidgets();
	t.deepEqual(widgets.trainList?.items, [ "Train 1", "Train 2" ]);
	t.false(widgets.trainList?.isDisabled);
});


test("Show window: chairlift vehicle list", t =>
{
	const params = setupWindow();
	const window = params.window;

	window.show();

	const widgets = getWidgets();
	t.deepEqual(widgets.vehicleList?.items, [ "Vehicle 1" ]);
	t.true(widgets.vehicleList?.isDisabled); // disable on 1 item
});


test("Show window: buttons are available", t =>
{
	const params = setupWindow();
	const window = params.window;

	window.show();

	const widgets = getWidgets();
	t.false(widgets.locate?.isDisabled);
	t.false(widgets.picker?.isDisabled);
	t.false(widgets.copy?.isDisabled);
	t.true(widgets.paste?.isDisabled);
	t.false(widgets.applyToOthers?.isDisabled);
});


test("Show window: chairlift first car properties", t =>
{
	const params = setupWindow();
	const window = params.window;

	window.show();

	const widgets = getWidgets();
	t.is(widgets.variant?.text, "0");
	t.is(widgets.trackProgress?.text, "10");
	t.is(widgets.seats?.text, "2");
	t.is(widgets.mass?.text, "30");
	t.is(widgets.poweredAcceleration?.text, "5");
	t.is(widgets.poweredMaxSpeed?.text, "15");

	t.true(widgets.variant?.isDisabled);
	t.false(widgets.trackProgress?.isDisabled);
	t.false(widgets.seats?.isDisabled);
	t.false(widgets.mass?.isDisabled);
	t.false(widgets.poweredAcceleration?.isDisabled);
	t.false(widgets.poweredMaxSpeed?.isDisabled);
});


test("Show window: mine train second car properties", t =>
{
	const params = setupWindow();
	const window = params.window;

	window.show();
	params.selector.selectEntity(31);

	const widgets = getWidgets();
	t.is(widgets.variant?.text, "1");
	t.is(widgets.trackProgress?.text, "25");
	t.is(widgets.seats?.text, "4");
	t.is(widgets.mass?.text, "50");
	t.is(widgets.poweredAcceleration?.text, "Only on powered vehicles");
	t.is(widgets.poweredMaxSpeed?.text, "Only on powered vehicles");
});


test("Show window: no rides and vehicles", t =>
{
	const params = setupWindow();
	const map = (global.map as GameMapMock);
	map.entities = [];
	map.rides = [];

	const window = params.window;
	window.show();

	const widgets = getWidgets();
	t.deepEqual(widgets.rideList?.items, [ "No rides in this park" ]);
	t.deepEqual(widgets.trainList?.items, [ "No trains available" ]);
	t.deepEqual(widgets.vehicleList?.items, [ "No vehicles available" ]);
	t.deepEqual(widgets.rideTypeList?.items, [ "No ride types available" ]);
	t.is(widgets.variant?.text, "Not available");
	t.is(widgets.trackProgress?.text, "Not available");
	t.is(widgets.seats?.text, "Not available");
	t.is(widgets.mass?.text, "Not available");
	t.is(widgets.poweredAcceleration?.text, "Only on powered vehicles");
	t.is(widgets.poweredMaxSpeed?.text, "Only on powered vehicles");

	t.true(widgets.rideList?.isDisabled);
	t.true(widgets.trainList?.isDisabled);
	t.true(widgets.vehicleList?.isDisabled);
	t.true(widgets.variant?.isDisabled);
	t.true(widgets.trackProgress?.isDisabled);
	t.true(widgets.seats?.isDisabled);
	t.true(widgets.mass?.isDisabled);
	t.true(widgets.poweredAcceleration?.isDisabled);
	t.true(widgets.poweredMaxSpeed?.isDisabled);
	t.true(widgets.locate?.isDisabled);
	t.true(widgets.copy?.isDisabled);
	t.true(widgets.paste?.isDisabled);
});


test("Copy/paste: chairlift settings on mine train car", t =>
{
	const params = setupWindow();
	const window = params.window;

	window.show();

	const widgets = getWidgets();
	widgets.copy?.onClick?.();

	t.false(widgets.paste?.isDisabled);

	params.selector.selectEntity(32);
	widgets.paste?.onClick?.();

	t.is(widgets.variant?.text, "0");
	t.is(widgets.trackProgress?.text, "35"); // Does not get updated
	t.is(widgets.seats?.text, "2");
	t.is(widgets.mass?.text, "30");
	t.is(widgets.poweredAcceleration?.text, "5");
	t.is(widgets.poweredMaxSpeed?.text, "15");
});


test("Copy/paste: press double = nothing copied", t =>
{
	const params = setupWindow();
	const window = params.window;

	window.show();

	const widgets = getWidgets();
	t.false(widgets.copy?.isPressed);
	t.true(widgets.paste?.isDisabled);

	widgets.copy?.onClick?.();
	t.true(widgets.copy?.isPressed);
	t.false(widgets.paste?.isDisabled);

	widgets.copy?.onClick?.();
	t.false(widgets.copy?.isPressed);
	t.true(widgets.paste?.isDisabled);
});