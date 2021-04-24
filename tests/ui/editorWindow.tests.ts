/// <reference path="../../lib/openrct2.d.ts" />

import test from 'ava';
import VehicleEditor from "../../src/services/editor";
import VehicleSelector from "../../src/services/selector";
import VehicleEditorWindow from "../../src/ui/editorWindow";
import mock_Car from "../mocks/car";
import mock_Context from "../mocks/context";
import track, { Trackable } from "../mocks/core/trackable";
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
		applyToOthersButton: get<ButtonWidget>("rve-apply-to-others-button-button"),
		applyToOthersDropdown: get<DropdownWidget>("rve-apply-to-others-button"),
		multiplier: get<DropdownWidget>("rve-multiplier-dropdown"),
		locate: get<ButtonWidget>("rve-locate-button"),
		picker: get<ButtonWidget>("rve-picker-button"),
		copy: get<ButtonWidget>("rve-copy-button"),
		paste: get<ButtonWidget>("rve-paste-button"),
	};
}


function trackCars(): Trackable<Trackable<Car>[]>
{
	return track((global.map as GameMapMock).entities as Car[]);
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
	t.truthy(window.locateButton);
	t.truthy(window.pickerButton);
	t.truthy(window.copyButton);
	t.truthy(window.pasteButton);
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


test("Show window: all types are available", t =>
{
	const params = setupWindow();
	const window = params.window;

	window.show();

	const widgets = getWidgets();
	t.deepEqual(widgets.rideTypeList?.items, [ "chairlift", "mine train coaster", "monorail" ]);
	t.false(widgets.rideTypeList?.isDisabled);
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
	t.false(widgets.applyToOthersButton?.isDisabled);
	t.false(widgets.applyToOthersDropdown?.isDisabled);
});


test("Show window: chairlift first car properties", t =>
{
	const params = setupWindow();
	const window = params.window;

	window.show();

	const widgets = getWidgets();
	t.is(widgets.rideTypeList?.selectedIndex, 0);
	t.is(widgets.variant?.text, "0");
	t.is(widgets.trackProgress?.text, "10");
	t.is(widgets.seats?.text, "3");
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
	t.is(widgets.rideTypeList?.selectedIndex, 1);
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


test("Show window: no vehicle is not modified", t =>
{
	const params = setupWindow();
	const window = params.window;
	const tracker = trackCars();

	window.show();

	t.is(tracker._sets.total(), 0);
});


test("Edit: ride type", t =>
{
	const params = setupWindow();
	const window = params.window;
	const tracker = trackCars();

	window.show();

	const widgets = getWidgets();
	widgets.rideTypeList?.onChange?.(1); // to non-powered mine train

	t.is(widgets.rideTypeList?.selectedIndex, 1);
	t.is(widgets.variant?.text, "0");
	t.is(widgets.trackProgress?.text, "10");
	t.is(widgets.seats?.text, "2");
	t.is(widgets.mass?.text, "60");
	t.is(widgets.poweredAcceleration?.text, "Only on powered vehicles");
	t.is(widgets.poweredMaxSpeed?.text, "Only on powered vehicles");
	t.true(widgets.poweredAcceleration?.isDisabled);
	t.true(widgets.poweredMaxSpeed?.isDisabled);
	t.is(tracker[0]._sets.rideObject, 1);
	// set to type's default
	t.is(tracker[0]._sets.vehicleObject, 1);
	t.is(tracker[0]._sets.numSeats, 1);
	t.is(tracker[0]._sets.mass, 1);
	t.is(tracker[0]._sets.poweredAcceleration, 1);
	t.is(tracker[0]._sets.poweredMaxSpeed, 1);
	t.is(tracker._sets.total(), 6);

	widgets.rideTypeList?.onChange?.(2); // to powered monorail

	t.is(widgets.rideTypeList?.selectedIndex, 2);
	t.is(widgets.variant?.text, "0");
	t.is(widgets.trackProgress?.text, "10");
	t.is(widgets.seats?.text, "6");
	t.is(widgets.mass?.text, "80");
	t.is(widgets.poweredAcceleration?.text, "12");
	t.is(widgets.poweredMaxSpeed?.text, "42");
	t.false(widgets.poweredAcceleration?.isDisabled);
	t.false(widgets.poweredMaxSpeed?.isDisabled);
	t.is(tracker[0]._sets.rideObject, 2);
	// set to type's default
	t.is(tracker[0]._sets.vehicleObject, 2);
	t.is(tracker[0]._sets.numSeats, 2);
	t.is(tracker[0]._sets.mass, 2);
	t.is(tracker[0]._sets.poweredAcceleration, 2);
	t.is(tracker[0]._sets.poweredMaxSpeed, 2);
	t.is(tracker._sets.total(), 12);
});


test("Edit: ride type, account for peep mass", t =>
{
	const params = setupWindow();
	const window = params.window;
	((global.map as GameMapMock).entities[0] as Car).mass += 129; // extra peep mass

	window.show();

	const widgets = getWidgets();
	widgets.rideTypeList?.onChange?.(1); // to non-powered mine train

	t.is(widgets.mass?.text, "189");

	widgets.rideTypeList?.onChange?.(2); // to powered monorail

	t.is(widgets.mass?.text, "209");
});


test("Edit: variant increment", t =>
{
	const params = setupWindow();
	const window = params.window;
	const tracker = trackCars();

	window.show();

	const widgets = getWidgets();
	widgets.rideTypeList?.onChange?.(2); // monorail
	widgets.variant?.onIncrement?.();

	t.is(widgets.rideTypeList?.selectedIndex, 2);
	t.is(widgets.variant?.text, "1");
	t.is(widgets.trackProgress?.text, "10");
	t.is(widgets.seats?.text, "8");
	t.is(widgets.mass?.text, "100");
	t.is(widgets.poweredAcceleration?.text, "14");
	t.is(widgets.poweredMaxSpeed?.text, "44");
	t.false(widgets.poweredAcceleration?.isDisabled);
	t.false(widgets.poweredMaxSpeed?.isDisabled);

	t.is(tracker[0]._sets.rideObject, 1);
	t.is(tracker[0]._sets.vehicleObject, 2);
	// set to variants's default
	t.is(tracker[0]._sets.numSeats, 2);
	t.is(tracker[0]._sets.mass, 2);
	t.is(tracker[0]._sets.poweredAcceleration, 2);
	t.is(tracker[0]._sets.poweredMaxSpeed, 2);
	t.is(tracker._sets.total(), 11);
});


test("Edit: variant decrement", t =>
{
	const params = setupWindow();
	const window = params.window;
	const tracker = trackCars();

	window.show();

	const widgets = getWidgets();
	widgets.rideTypeList?.onChange?.(2); // monorail
	widgets.variant?.onDecrement?.();

	t.is(widgets.rideTypeList?.selectedIndex, 2);
	t.is(widgets.variant?.text, "2");
	t.is(widgets.trackProgress?.text, "10");
	t.is(widgets.seats?.text, "10");
	t.is(widgets.mass?.text, "120");
	t.is(widgets.poweredAcceleration?.text, "Only on powered vehicles");
	t.is(widgets.poweredMaxSpeed?.text, "Only on powered vehicles");
	t.true(widgets.poweredAcceleration?.isDisabled);
	t.true(widgets.poweredMaxSpeed?.isDisabled);

	t.is(tracker[0]._sets.rideObject, 1);
	t.is(tracker[0]._sets.vehicleObject, 2);
	// set to variants's default
	t.is(tracker[0]._sets.numSeats, 2);
	t.is(tracker[0]._sets.mass, 2);
	t.is(tracker[0]._sets.poweredAcceleration, 2);
	t.is(tracker[0]._sets.poweredMaxSpeed, 2);
	t.is(tracker._sets.total(), 11);
});


test("Edit: track progress", t =>
{
	const params = setupWindow();
	const window = params.window;
	const tracker = trackCars();

	window.show();

	const widgets = getWidgets();
	widgets.trackProgress?.onIncrement?.();
	t.is(widgets.trackProgress?.text, "11");

	widgets.trackProgress?.onIncrement?.();
	t.is(widgets.trackProgress?.text, "12");

	widgets.trackProgress?.onDecrement?.();
	t.is(widgets.trackProgress?.text, "11");

	widgets.trackProgress?.onDecrement?.();
	t.is(widgets.trackProgress?.text, "10");

	widgets.trackProgress?.onDecrement?.();
	t.is(widgets.trackProgress?.text, "9");

	t.is(tracker[0]._sets.trackProgress, 5);
	t.is(tracker._sets.total(), 5);
});


test("Edit: mass", t =>
{
	const params = setupWindow();
	const window = params.window;
	const tracker = trackCars();

	window.show();

	const widgets = getWidgets();
	widgets.mass?.onIncrement?.();
	t.is(widgets.mass?.text, "31");

	widgets.mass?.onDecrement?.();
	t.is(widgets.mass?.text, "30");

	t.is(tracker[0]._sets.mass, 2);
	t.is(tracker._sets.total(), 2);
});


test("Edit: seats", t =>
{
	const params = setupWindow();
	const window = params.window;
	const tracker = trackCars();

	window.show();

	const widgets = getWidgets();
	widgets.seats?.onIncrement?.();
	t.is(widgets.seats?.text, "4");

	widgets.seats?.onDecrement?.();
	t.is(widgets.seats?.text, "3");

	t.is(tracker[0]._sets.numSeats, 2);
	t.is(tracker._sets.total(), 2);
});


test("Edit: powered acceleration", t =>
{
	const params = setupWindow();
	const window = params.window;
	const tracker = trackCars();

	window.show();

	const widgets = getWidgets();
	widgets.poweredAcceleration?.onIncrement?.();
	t.is(widgets.poweredAcceleration?.text, "6");

	widgets.poweredAcceleration?.onDecrement?.();
	t.is(widgets.poweredAcceleration?.text, "5");

	t.is(tracker[0]._sets.poweredAcceleration, 2);
	t.is(tracker._sets.total(), 2);
});


test("Edit: powered max speed", t =>
{
	const params = setupWindow();
	const window = params.window;
	const tracker = trackCars();

	window.show();

	const widgets = getWidgets();
	widgets.poweredMaxSpeed?.onIncrement?.();
	t.is(widgets.poweredMaxSpeed?.text, "16");

	widgets.poweredMaxSpeed?.onDecrement?.();
	t.is(widgets.poweredMaxSpeed?.text, "15");

	t.is(tracker[0]._sets.poweredMaxSpeed, 2);
	t.is(tracker._sets.total(), 2);
});


test("Edit: multiplier x 10 increment", t =>
{
	const params = setupWindow();
	const window = params.window;
	const tracker = trackCars();

	window.show();

	const widgets = getWidgets();
	widgets.multiplier?.onChange?.(1); // set to x10

	widgets.trackProgress?.onIncrement?.();
	widgets.mass?.onIncrement?.();
	widgets.seats?.onIncrement?.();
	widgets.poweredAcceleration?.onIncrement?.();
	widgets.poweredMaxSpeed?.onIncrement?.();

	t.is(widgets.trackProgress?.text, "20");
	t.is(widgets.mass?.text, "40");
	t.is(widgets.seats?.text, "13");
	t.is(widgets.poweredAcceleration?.text, "15");
	t.is(widgets.poweredMaxSpeed?.text, "25");

	t.is(tracker._sets.total(), 5);
});


test("Edit: multiplier x 10 decrement", t =>
{
	const params = setupWindow();
	const window = params.window;
	const tracker = trackCars();

	window.show();

	const widgets = getWidgets();
	widgets.multiplier?.onChange?.(1); // set to x10

	widgets.trackProgress?.onDecrement?.();
	widgets.mass?.onDecrement?.();
	widgets.seats?.onDecrement?.();
	widgets.poweredAcceleration?.onDecrement?.();
	widgets.poweredMaxSpeed?.onDecrement?.();

	t.is(widgets.trackProgress?.text, "0");
	t.is(widgets.mass?.text, "20");
	t.is(widgets.seats?.text, "0"); // bottom limit
	t.is(widgets.poweredAcceleration?.text, "0"); // bottom limit
	t.is(widgets.poweredMaxSpeed?.text, "5");

	t.is(tracker._sets.total(), 5);
});


test("Edit: multiplier x 100 increment", t =>
{
	const params = setupWindow();
	const window = params.window;
	const tracker = trackCars();

	window.show();

	const widgets = getWidgets();
	widgets.multiplier?.onChange?.(2); // set to x100

	widgets.trackProgress?.onIncrement?.();
	widgets.mass?.onIncrement?.();
	widgets.seats?.onIncrement?.();
	widgets.poweredAcceleration?.onIncrement?.();
	widgets.poweredMaxSpeed?.onIncrement?.();

	t.is(widgets.trackProgress?.text, "110");
	t.is(widgets.mass?.text, "130");
	t.is(widgets.seats?.text, "32"); // maxed out
	t.is(widgets.poweredAcceleration?.text, "105");
	t.is(widgets.poweredMaxSpeed?.text, "115");

	t.is(tracker._sets.total(), 5);
});


test("Edit: multiplier x 100 decrement", t =>
{
	const params = setupWindow();
	const window = params.window;
	const tracker = trackCars();

	window.show();

	const widgets = getWidgets();
	widgets.multiplier?.onChange?.(2); // set to x100

	widgets.trackProgress?.onDecrement?.();
	widgets.mass?.onDecrement?.();
	widgets.seats?.onDecrement?.();
	widgets.poweredAcceleration?.onDecrement?.();
	widgets.poweredMaxSpeed?.onDecrement?.();

	// can go negative, but game will move it to another track piece
	t.is(widgets.trackProgress?.text, "-90");
	// all go to bottom limit
	t.is(widgets.mass?.text, "0");
	t.is(widgets.seats?.text, "0");
	t.is(widgets.poweredAcceleration?.text, "0");
	t.is(widgets.poweredMaxSpeed?.text, "0");

	t.is(tracker._sets.total(), 5);
});


test("Copy/paste: chairlift settings on mine train car", t =>
{
	const params = setupWindow();
	const window = params.window;
	const tracker = trackCars();

	window.show();

	const widgets = getWidgets();
	widgets.copy?.onClick?.(); // copy chairlift

	t.false(widgets.paste?.isDisabled);

	params.selector.selectEntity(32); // select mine train
	t.is(widgets.rideTypeList?.selectedIndex, 1);

	widgets.paste?.onClick?.(); // paste chairlift

	t.is(widgets.rideTypeList?.selectedIndex, 0);
	t.is(widgets.variant?.text, "0");
	t.is(widgets.trackProgress?.text, "35"); // Does not get updated
	t.is(widgets.seats?.text, "3");
	t.is(widgets.mass?.text, "30");
	t.is(widgets.poweredAcceleration?.text, "5");
	t.is(widgets.poweredMaxSpeed?.text, "15");
	t.false(widgets.poweredAcceleration?.isDisabled);
	t.false(widgets.poweredMaxSpeed?.isDisabled);

	const minetrain = tracker.find(t => t.id === 32);
	t.is(minetrain?._sets.rideObject, 1);
	t.is(minetrain?._sets.vehicleObject, 1);
	t.is(minetrain?._sets.trackProgress, 0);
	t.is(minetrain?._sets.numSeats, 1);
	t.is(minetrain?._sets.mass, 1);
	t.is(minetrain?._sets.poweredAcceleration, 1);
	t.is(minetrain?._sets.poweredMaxSpeed, 1);
	t.is(tracker._sets.total(), 6);
});


test("Copy/paste: press double = nothing copied", t =>
{
	const params = setupWindow();
	const window = params.window;
	const tracker = trackCars();

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

	t.is(tracker._sets.total(), 0);
});


test("Apply: to all vehicles", t =>
{
	const params = setupWindow();
	const window = params.window;

	window.show();

	const widgets = getWidgets();
	params.selector.selectEntity(31);
	//widgets.applyToOthersDropdown?.onChange?.(0);
	t.is(widgets.applyToOthersButton?.text, "Apply this to all vehicles");
	widgets.rideTypeList?.onChange?.(2);

	const tracker = trackCars();
	widgets.applyToOthersButton?.onClick?.();

	const actual = (): unknown => ({
		rideType: widgets.rideTypeList?.selectedIndex,
		variant: widgets.variant?.text,
		mass: widgets.mass?.text,
		seats: widgets.seats?.text,
		poweredAcceleration: widgets.poweredAcceleration?.text,
		poweredMaxSpeed: widgets.poweredMaxSpeed?.text
	});
	const expected = {
		rideType: 2,
		variant: "0",
		mass: "80",
		seats: "6",
		poweredAcceleration: "12",
		poweredMaxSpeed: "42"
	};
	t.deepEqual(actual(), expected);
	t.is(widgets.trackProgress?.text, "25");

	params.selector.selectEntity(30);
	t.deepEqual(actual(), expected);
	t.is(widgets.trackProgress?.text, "15");

	params.selector.selectEntity(32);
	t.deepEqual(actual(), expected);
	t.is(widgets.trackProgress?.text, "35");

	t.is(tracker.find(t => t.id === 30)?._sets.total(), 6);
	t.is(tracker.find(t => t.id === 31)?._sets.total(), 6);
	t.is(tracker.find(t => t.id === 32)?._sets.total(), 6);
	t.is(tracker._sets.total(), 18);
});