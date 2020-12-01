import { ParkRide, RideTrain, RideVehicle } from "../helpers/ridesInPark";
import { RideType } from "../helpers/rideTypes";
import { error, isDebugMode, log } from "../helpers/utilityHelpers";
import { VehicleEditor } from "../services/editor";
import { VehicleSelector } from "../services/selector";
import Dropdown from "../ui/dropdown";
import DropdownSpinner from "../ui/dropdownSpinner";
import Spinner from "../ui/spinner";
import ViewportComponent from "../ui/viewport";
import pluginVersion from "../version";
import DebugWindow from "./debugWindow";


// Shared coordinate constants
const windowStart = 18;
const windowWidth = 350;
const windowHeight = 221;
const widgetLineHeight = 14;
const groupboxMargin = 5;
const groupboxItemMargin = (groupboxMargin + 5);
const groupboxItemWidth = windowWidth - (groupboxItemMargin * 2);

const editorStartY = 90;
const viewportSize = 100;
const controlsSize = (windowWidth - (groupboxMargin * 2) - (viewportSize + 5));
const controlLabelPart = 0.3; // label takes 30%
const controlHeight = 17;
const buttonSize = 24;


class VehicleEditorWindow
{
	/**
	 * The universal identifier that is used for this window.
	 */
	static readonly identifier = "ride-vehicle-editor";

	// Only a single instance allowed at a time, currently.
	private static _windowInstance: (VehicleEditorWindow | null);


	readonly ridesInParkList: Dropdown;
	readonly trainList: DropdownSpinner;
	readonly vehicleList: DropdownSpinner;

	readonly viewport: ViewportComponent;
	readonly rideTypeList: Dropdown;
	readonly variantSpinner: Spinner;
	readonly seatCountSpinner: Spinner;
	readonly powAccelerationSpinner: Spinner;
	readonly powMaxSpeedSpinner: Spinner;
	readonly massSpinner: Spinner;

	private _selector: VehicleSelector;
	private _editor: VehicleEditor;

	private _window: Window;


	/**
	 * Creates a new vehicle editor, or shows the currently opened one.
	 */
	static show(): VehicleEditorWindow
	{
		if (this._windowInstance)
		{
			log("The ride vehicle editor is already open.");
			this._windowInstance._window?.bringToFront();
		}
		else
		{
			log("Open the ride vehicle editor.");
		    this._windowInstance = new VehicleEditorWindow();
		}
		return this._windowInstance;
	}


	/**
	 * Creates a new window for the specified editor.
	 *
	 * @param selector The associated editor which will select a vehicle.
	 * @param editor The associated editor which will edit the vehicle.
	 */
	private constructor()
	{
		// Rides in park
		this.ridesInParkList = new Dropdown({
			name: "rve-ride-list",
			x: groupboxItemMargin,
			y: windowStart + 25,
			width: groupboxItemWidth,
			height: widgetLineHeight
		});
		this.ridesInParkList.disableSingleItem = false;
		this.ridesInParkList.onSelect = (i => this._selector.selectRide(i));

		// Trains on the selected ride
		this.trainList = new DropdownSpinner({
			name: "rve-train-list",
			x: groupboxItemMargin,
			y: windowStart + 43,
			width: (groupboxItemWidth / 2) - 2,
			height: widgetLineHeight
		});
		this.trainList.disabledMessage = "No trains available";
		this.trainList.onSelect = (i => this._selector.selectTrain(i));

		// Vehicles in the selected train
		this.vehicleList = new DropdownSpinner({
			name: "rve-vehicle-list",
			x: groupboxItemMargin + (groupboxItemWidth / 2) + 2,
			y: windowStart + 43,
			width: (groupboxItemWidth / 2) - 2,
			height: widgetLineHeight
		});
		this.vehicleList.disabledMessage = "No vehicles available";
		this.vehicleList.onSelect = (i => this._selector.selectVehicle(i));

		// Viewport
		this.viewport = new ViewportComponent({
			name: "rve-viewport",
			x: groupboxMargin,
			y: editorStartY,
			width: viewportSize,
			height: viewportSize
		});

		// Available ride types
		this.rideTypeList = new Dropdown({
			name: "rve-ride-type-list",
			x: groupboxMargin + viewportSize + 5,
			y: editorStartY,
			width: controlsSize - 1,
			height: widgetLineHeight
		});
		this.rideTypeList.disabledMessage = "No ride types available";
		this.rideTypeList.disableSingleItem = false;
		this.rideTypeList.onSelect = (i => this._editor.setRideType(i));

		// Variant sprite of the selected vehicle
		this.variantSpinner = new Spinner({
			name: "rve-variant-spinner",
			x: (groupboxMargin + viewportSize + 5) + (controlsSize * controlLabelPart),
			y: (editorStartY + 1 + controlHeight),
			width: (controlsSize * (1 - controlLabelPart)),
			height: widgetLineHeight,
		});
		this.variantSpinner.onChange = (i => this._editor.setVehicleVariant(i));

		// Number of seats of the selected vehicle
		this.seatCountSpinner = new Spinner({
			name: "rve-seats-spinner",
			x: (groupboxMargin + viewportSize + 5) + (controlsSize * controlLabelPart),
			y: (editorStartY + + 1 + controlHeight * 2),
			width: (controlsSize * (1 - controlLabelPart)),
			height: widgetLineHeight,
		});
		this.seatCountSpinner.wrapMode = "clamp";
		this.seatCountSpinner.maximum = 128;
		this.seatCountSpinner.onChange = (i => this._editor.setVehicleSeatCount(i));

		// Powered acceleration of the selected vehicle
		this.powAccelerationSpinner = new Spinner({
			name: "rve-powered-acceleration-spinner",
			x: (groupboxMargin + viewportSize + 5) + (controlsSize * controlLabelPart),
			y: (editorStartY + 1 + controlHeight * 3),
			width: (controlsSize * (1 - controlLabelPart)),
			height: widgetLineHeight,
		});
		this.powAccelerationSpinner.maximum = 256;
		this.powAccelerationSpinner.disabledMessage = "Only on powered vehicles.";
		this.powAccelerationSpinner.onChange = (i => this._editor.setVehiclePoweredAcceleration(i));

		// Powered maximum speed of the selected vehicle
		this.powMaxSpeedSpinner = new Spinner({
			name: "rve-powered-max-speed-spinner",
			x: (groupboxMargin + viewportSize + 5) + (controlsSize * controlLabelPart),
			y: (editorStartY + 1 + controlHeight * 4),
			width: (controlsSize * (1 - controlLabelPart)),
			height: widgetLineHeight,
		});
		this.powMaxSpeedSpinner.maximum = 256;
		this.powMaxSpeedSpinner.disabledMessage = "Only on powered vehicles.";
		this.powMaxSpeedSpinner.onChange = (i => this._editor.setVehiclePoweredMaximumSpeed(i));

		// Total current mass of the selected vehicle
		this.massSpinner = new Spinner({
			name: "rve-mass-spinner",
			x: (groupboxMargin + viewportSize + 5) + (controlsSize * controlLabelPart),
			y: (editorStartY + 1 + controlHeight * 5),
			width: (controlsSize * (1 - controlLabelPart)),
			height: widgetLineHeight,
		});
		this.massSpinner.maximum = 65_536;
		this.massSpinner.onChange = (i => this._editor.setVehicleMass(i));

		this._window = this.createWindow();

		log("Initializing services.");
		this._selector = new VehicleSelector(this);
		this._editor = new VehicleEditor(this);

		this._selector.selectRide(0);
	}


	/**
	 * Creates a new editor window.
	 */
	private createWindow(): Window
	{
		log("Open window")

		let windowTitle = `Ride vehicle editor (v${pluginVersion})`;
		let debugWidgets: Widget[] = [];

		if (isDebugMode)
		{
			windowTitle += " [DEBUG]";
			debugWidgets = this.getDebugWidgets();
		}

		const window = ui.openWindow({
			classification: VehicleEditorWindow.identifier,
			title: windowTitle,
			width: windowWidth,
			height: windowHeight,
			widgets: [
				// Selection group
				<Widget>{
					type: 'groupbox' as WidgetType,
					x: groupboxMargin,
					y: windowStart,
					width: windowWidth - (groupboxMargin * 2),
					height: 64
				},

				// Ride selector
				<LabelWidget>{
					type: 'label' as WidgetType,
					x: groupboxItemMargin,
					y: windowStart + 10,
					width: groupboxItemWidth,
					height: widgetLineHeight,
					text: "Pick a ride:"
				},
				this.ridesInParkList.createWidget(),

				// Train & vehicle selectors
				...this.trainList.createWidgets(),
				...this.vehicleList.createWidgets(),

				// Ride vehicle editor:
				this.viewport.createWidget(),
				this.rideTypeList.createWidget(),

				// Vehicle variant
				<LabelWidget>{
					type: 'label' as WidgetType,
					x: (groupboxMargin + viewportSize + 5),
					y: (editorStartY + controlHeight) + 2,
					width: (controlsSize * controlLabelPart),
					height: widgetLineHeight,
					text: "Variant:"
				},
				this.variantSpinner.createWidget(),

				// Number of seats
				<LabelWidget>{
					type: 'label' as WidgetType,
					x: (groupboxMargin + viewportSize + 5),
					y: (editorStartY + controlHeight * 2) + 2,
					width: (controlsSize * controlLabelPart),
					height: widgetLineHeight,
					text: "Seats:"
				},
				this.seatCountSpinner.createWidget(),

				// Powered acceleration
				<LabelWidget>{
					type: 'label' as WidgetType,
					x: (groupboxMargin + viewportSize + 5),
					y: (editorStartY + controlHeight * 3) + 2,
					width: (controlsSize * controlLabelPart),
					height: widgetLineHeight,
					text: "Acceleration:"
				},
				this.powAccelerationSpinner.createWidget(),

				// Powered maximum speed
				<LabelWidget>{
					type: 'label' as WidgetType,
					x: (groupboxMargin + viewportSize + 5),
					y: (editorStartY + controlHeight * 4) + 2,
					width: (controlsSize * controlLabelPart),
					height: widgetLineHeight,
					text: "Max. speed:"
				},
				this.powMaxSpeedSpinner.createWidget(),

				// Mass
				<LabelWidget>{
					type: 'label' as WidgetType,
					x: (groupboxMargin + viewportSize + 5),
					y: (editorStartY + controlHeight * 5) + 2,
					width: (controlsSize * controlLabelPart),
					height: widgetLineHeight,
					text: "Mass:"
				},
				this.massSpinner.createWidget(),

				// Buttons
				<ButtonWidget>{
					type: 'button' as WidgetType,
					x: (groupboxMargin),
					y: (editorStartY + viewportSize + 2),
					width: buttonSize,
					height: buttonSize,
					image: 5167, // SPR_LOCATE
					onClick: () => this.scrollToVehicle()
				},
				<LabelWidget>{
					type: 'label' as WidgetType,
					x: (groupboxMargin + 33),
					y: (editorStartY + viewportSize + (buttonSize / 2)) - 3,
					width: windowWidth,
					height: widgetLineHeight,
					text: "github.com/Basssiiie/OpenRCT2-RideVehicleEditor",
					isDisabled: true
				},
				...debugWidgets
			],
			onClose: () =>
			{
				log("Close window");
				this.viewport.stop();
				VehicleEditorWindow._windowInstance = null;
			}
		});

		this.ridesInParkList.bind(window);
		this.trainList.bind(window);
		this.vehicleList.bind(window);

		this.viewport.bind(window);
		this.rideTypeList.bind(window);
		this.variantSpinner.bind(window);
		this.seatCountSpinner.bind(window);
		this.powAccelerationSpinner.bind(window);
		this.powMaxSpeedSpinner.bind(window);
		this.massSpinner.bind(window);

		log("Window creation complete.");
		return window;
	}


	/**
	 * Update the ride list with the specified rides in the park.
	 * 
	 * @param rides The rides to show in the list.
	 */
	setRideList(rides: ParkRide[] | null)
	{
		this.ridesInParkList.items = (rides) ? rides.map(r => r.name) : [];
		this.ridesInParkList.refresh();
	}
	


	/**
	 * Update the train list with the specified trains.
	 * 
	 * @param trains The trains to show in the list.
	 */
	setTrainList(trains: RideTrain[] | null)
	{
		this.trainList.items = (trains) ? trains.map(t => `Train ${t.index + 1}`) : [];
		this.trainList.refresh();
	}


	/**
	 * Updates the vehicle list with the specified vehicles.
	 * 
	 * @param vehicles The vehicles to show in the list.
	 */
	setVehicleList(vehicles: RideVehicle[] | null)
	{
		this.vehicleList.items = (vehicles) ? vehicles.map((_, i) => `Vehicle ${i + 1}`) : [];
		this.vehicleList.refresh();
	}


	/**
	 * Updates the editor to show the specified vehicle.
	 * 
	 * @param vehicle The vehicle to show in the editor.
	 */
	setEditor(vehicle: RideVehicle | null)
	{
		const toggle = (vehicle != null);
		this.rideTypeList.active(toggle);
		this.variantSpinner.active(toggle);
		this.seatCountSpinner.active(toggle);
		this.powAccelerationSpinner.active(toggle);
		this.powMaxSpeedSpinner.active(toggle);

		if (vehicle)
		{
			this._editor.setVehicle(vehicle);
		}
		else
		{
			this._editor.disable();
			this.viewport.stop();
		}
	}


	/**
	 * Updates the ride type list with the specified ride types.
	 * 
	 * @param rideTypes The ride types to show in the ride type list.
	 */
	setRideTypeList(rideTypes: RideType[])
	{
		this.rideTypeList.items = rideTypes.map(t => t.name);
		this.rideTypeList.refresh();
	}


	/**
	 * Scroll the main viewport to the currently selected vehicle.
	 */
	private scrollToVehicle()
	{
		const vehicle = this._editor.selectedVehicle;
		if (vehicle)
		{
			const car = vehicle.getCar();
			ui.mainViewport.scrollTo({ x: car.x, y: car.y, z: car.z });
		}
		else
		{
			error("No vehicle has been selected to scroll to.", "scrollToVehicle");
		}
	}


	/**
	 * Gets the widgets that only show in debug mode.
	 */
	private getDebugWidgets(): Widget[]
	{
		return [
			<ButtonWidget>{
				type: 'button' as WidgetType,
				x: (windowWidth - (buttonSize + groupboxMargin)),
				y: (editorStartY + viewportSize + 2),
				width: buttonSize,
				height: buttonSize,
				image: 5188, // SPR_TRACK_PEEP
				onClick: () =>
				{
					const vehicle = this._editor.selectedVehicle;
					if (vehicle)
						new DebugWindow(vehicle?.entityId)
				}
			}
		];
	}
}

export default VehicleEditorWindow;
