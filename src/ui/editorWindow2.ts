import { isDevelopment, pluginVersion } from "../environment";
import Dropdown from "./framework/components/dropdown";
import Element from "./framework/components/element";
import Observable from "./framework/observable";
import WindowTemplate from "./framework/windowTemplate";



interface EditorWindow
{
	ride: Dropdown;
	train: DropdownWidget;
	vehicle: DropdownWidget;
	
	rideType: Dropdown;
	variant: Element<SpinnerWidget>;
	trackProgress: Element<SpinnerWidget>;
	maxSeats: Element<SpinnerWidget>;
	mass: Element<SpinnerWidget>;
	poweredAcceleration: Element<SpinnerWidget>;
	poweredMaxSpeed: Element<SpinnerWidget>;
	
	viewport: Element<ViewportWidget>;
	multiplier: Dropdown;
}


interface SelectionViewModel
{
	rideList: Observable<string[]>;
	selectedRide: Observable<number>;

	trainList: Observable<string[]>;
	selectedTrain: Observable<number>

	vehicleList: Observable<string[]>;
	selectedVehicle: Observable<number>;
}



const strings = 
{
	title: `Ride Vehicle Editor (v${pluginVersion})${isDevelopment ? " (DEBUG)" : ""}`,

	pickRide: "Pick a ride:",
	ridesTip: "List of rides in the park",
	trainsTip: "List of trains on the currently selected ride",
	vehiclesTip: "List of vehicles on the currently selected train",

	noTrains: "No trains available",
	noVehicles: "No vehicles available",

	rideTypesTip: "All ride types currently available in the park",
	noRideTypes: "No ride types available",

	variantLabel: "Variant:",
	variantTip: "Sprite variant to use from the selected ride type",

	trackProgressLabel: "Track progress:",
	trackProgressTip: "Distance in steps of how far the vehicle has progressed along the current track piece",
	
	maxSeatsLabel: "Seats:",
	maxSeatsTip: "Total amount of passengers that can cuddle up in this vehicle",
	
	massLabel: "Mass:",
	massTip: "Total amount of mass (weight) of this vehicle, including all its passengers and your mom",
	
	poweredAccelerationLabel: "Acceleration:",
	poweredAccelerationTip: "Cranks up the engines to accelerate faster, self-powered vehicles only",
	
	poweredMaxSpeedLabel: "Max. speed:",
	poweredMaxSpeedTip:  "The (il)legal speed limit for your vehicle, self-powered vehicles only",
	
	poweredOnlyTip: "Only on powered vehicles",
	multiplierTip: "Multiplies all spinner controls by the specified amount",

	locateTip: "Locate your vehicle when you've lost it (again)",
	credits: "github.com/Basssiiie/OpenRCT2-RideVehicleEditor",
	creditsTip: "Go to this URL to check for the latest updates",
}


function createWindow()
{
	// Shared coordinate constants
	const windowWidth = 375;
	const windowHeight = 232;
	const windowStart = 18;
	const widgetLineHeight = 14;
	const groupboxMargin = 5;
	const groupboxItemMargin = (groupboxMargin + 5);
	const groupboxItemWidth = windowWidth - (groupboxItemMargin * 2);

	const editorStartY = 90;
	const viewportSize = 100;
	const controlsSize = (windowWidth - (groupboxMargin * 2) - (viewportSize + 5));
	const controlLabelPart = 0.35; // label takes 35%
	const controlHeight = 17;
	const buttonSize = 24;

	return new WindowTemplate<EditorWindow>(
	{
		title: strings.title,
		width: windowWidth,
		height: windowHeight,
	},
	wb => ({
		// Selection group
		selectionBox: wb
			.groupbox({ 
				x: groupboxMargin,
				y: windowStart,
				width: windowWidth - (groupboxMargin * 2),
				height: 64,
			}),

		selectionLabel: wb
			.label({
				x: groupboxItemMargin,
				y: windowStart + 10,
				width: groupboxItemWidth,
				height: widgetLineHeight,

				text: strings.pickRide,
			}),

		ride: wb
			.dropdown({ 
				x: groupboxItemMargin, 
				y: (windowStart + 25), 
				width: groupboxItemWidth, 
				height: widgetLineHeight,

				tooltip: strings.ridesTip,
			})
			.binding<SelectionViewModel>({
				rideList: "items",
				selectedRide: { bind: "selectedIndex", update: "onChange" },
			}),

		train: wb
			.dropdownSpinner({ 
				x: groupboxItemMargin, 
				y: (windowStart + 43), 
				width: ((groupboxItemWidth / 2) - 2), 
				height: widgetLineHeight,

				tooltip: strings.trainsTip,
				disabledMessage: strings.noTrains,
				disableOnSingleItem: true,
			}),

		vehicle: wb
			.dropdownSpinner({ 
				x: (groupboxItemMargin + (groupboxItemWidth / 2) + 2), 
				y: (windowStart + 43), 
				width: ((groupboxItemWidth / 2) - 2), 
				height: widgetLineHeight,

				tooltip: strings.vehiclesTip,
				disabledMessage: strings.noVehicles,
				disableOnSingleItem: true,
			}),

		// Select ride type
		rideType: wb
			.dropdown({ 
				x: groupboxMargin + viewportSize + 5,
				y: editorStartY,
				width: controlsSize,
				height: widgetLineHeight,

				tooltip: strings.rideTypesTip,
				disabledMessage: strings.noRideTypes,
			}),

		// Vehicle variant
		variantLabel: wb
			.label({ 
				x: (groupboxMargin + viewportSize + 5),
				y: (editorStartY + controlHeight) + 2,
				width: (controlsSize * controlLabelPart),
				height: widgetLineHeight,

				text: strings.variantLabel,
				tooltip: strings.variantTip,
			}),

		variant: wb
			.spinner({ 
				x: (groupboxMargin + viewportSize + 5) + (controlsSize * controlLabelPart),
				y: (editorStartY + 1 + controlHeight),
				width: (controlsSize * (1 - controlLabelPart)),
				height: widgetLineHeight,

				tooltip: strings.variantTip,
			}),

		// Vehicle track progress
		trackProgressLabel: wb
			.label({ 
				x: (groupboxMargin + viewportSize + 5),
				y: (editorStartY + controlHeight * 2) + 2,
				width: (controlsSize * controlLabelPart),
				height: widgetLineHeight,

				text: strings.trackProgressLabel,
				tooltip: strings.trackProgressTip,
			}),

		trackProgress: wb
			.spinner({
				x: (groupboxMargin + viewportSize + 5) + (controlsSize * controlLabelPart),
				y: (editorStartY + 1 + controlHeight * 2),
				width: (controlsSize * (1 - controlLabelPart)),
				height: widgetLineHeight,

				tooltip: strings.trackProgressTip,
				wrapMode: "clampThenWrap",
				minimum: -2_147_483_648,
				maximum: 2_147_483_647,
			}),

		// Vehicle seats
		maxSeatsLabel: wb
			.label({ 
				x: (groupboxMargin + viewportSize + 5),
				y: (editorStartY + controlHeight * 3) + 2,
				width: (controlsSize * controlLabelPart),
				height: widgetLineHeight,

				text: strings.maxSeatsLabel,
				tooltip: strings.maxSeatsTip,
			}),

		maxSeats: wb
			.spinner({
				x: (groupboxMargin + viewportSize + 5) + (controlsSize * controlLabelPart),
				y: (editorStartY + 1 + controlHeight * 3),
				width: (controlsSize * (1 - controlLabelPart)),
				height: widgetLineHeight,

				tooltip: strings.maxSeatsTip,
				wrapMode: "clampThenWrap",
				maximum: 32, // vehicles refuse more than 32 guests, leaving them stuck just before entering.
			}),

		// Vehicle mass
		massLabel: wb
			.label({ 
				x: (groupboxMargin + viewportSize + 5),
				y: (editorStartY + controlHeight * 4) + 2,
				width: (controlsSize * controlLabelPart),
				height: widgetLineHeight,
				
				text: strings.massLabel,
				tooltip: strings.massTip,
			}),
		
		mass: wb
			.spinner({
				x: (groupboxMargin + viewportSize + 5) + (controlsSize * controlLabelPart),
				y: (editorStartY + 1 + controlHeight * 4),
				width: (controlsSize * (1 - controlLabelPart)),
				height: widgetLineHeight,

				tooltip: strings.massTip,
				wrapMode: "clampThenWrap",
				maximum: 65_536,
			}),

		// Vehicle powered acceleration
		poweredAccelerationLabel: wb
			.label({ 
				x: (groupboxMargin + viewportSize + 5),
				y: (editorStartY + controlHeight * 5) + 2,
				width: (controlsSize * controlLabelPart),
				height: widgetLineHeight,

				text: strings.poweredAccelerationLabel,
				tooltip: strings.poweredAccelerationTip,
			}),
			
		poweredAcceleration: wb
			.spinner({
				x: (groupboxMargin + viewportSize + 5) + (controlsSize * controlLabelPart),
				y: (editorStartY + 1 + controlHeight * 5),
				width: (controlsSize * (1 - controlLabelPart)),
				height: widgetLineHeight,

				tooltip: strings.poweredAccelerationTip,
				disabledMessage: strings.poweredOnlyTip,
				wrapMode: "clampThenWrap",
				maximum: 255,
			}),

		// Vehicle powered max speed
		poweredMaxSpeedtLabel: wb
			.label({ 
				x: (groupboxMargin + viewportSize + 5),
				y: (editorStartY + controlHeight * 6) + 2,
				width: (controlsSize * controlLabelPart),
				height: widgetLineHeight,

				text: strings.poweredMaxSpeedLabel,
				tooltip: strings.poweredMaxSpeedTip,
			}),

		poweredMaxSpeed: wb
			.spinner({
				x: (groupboxMargin + viewportSize + 5) + (controlsSize * controlLabelPart),
				y: (editorStartY + 1 + controlHeight * 6),
				width: (controlsSize * (1 - controlLabelPart)),
				height: widgetLineHeight,

				tooltip: strings.poweredMaxSpeedTip,
				disabledMessage: strings.poweredOnlyTip,
				wrapMode: "clampThenWrap",
				minimum: 1,
				maximum: 255,
			}),
		
		// Misc.
		viewport: wb
			.viewport({ 
				x: groupboxMargin,
				y: editorStartY,
				width: viewportSize,
				height: viewportSize
			}),

		multiplier: wb
			.dropdown({ 
				x: (windowWidth - (groupboxMargin + 45)),
				y: (editorStartY + controlHeight * 7) + 1,
				width: 45,
				height: widgetLineHeight,

				items: ["x1", "x10", "x100"],
			}),

		locate: wb
			.button({ 
				x: (groupboxMargin),
				y: (editorStartY + viewportSize + 4),
				width: buttonSize,
				height: buttonSize,

				tooltip: strings.locateTip,
				image: 5167, // SPR_LOCATE
			}),

		credits: wb
			.label({ 
				x: (groupboxMargin + 35),
				y: (windowHeight - (widgetLineHeight + groupboxMargin)),
				width: 275,
				height: widgetLineHeight,

				text: strings.credits,
				tooltip: strings.creditsTip,
				isDisabled: true
			})
	}));
}


export const editor = createWindow();