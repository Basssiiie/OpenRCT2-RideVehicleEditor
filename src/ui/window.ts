import { ParkRide, RideTrain, RideVehicle } from "../helpers/ridesInPark";
import { RideType } from "../helpers/rideTypes";
import { error, log } from "../helpers/utilityHelpers";
import { Dropdown } from "../ui/dropdown";
import { DropdownSpinner } from "../ui/dropdownSpinner";
import { Spinner } from "../ui/spinner";
import { ViewportComponent } from "../ui/viewport";
import { VehicleEditor } from "../services/editor";
import { VehicleSelector } from "../services/selector";
import pluginVersion from "../version";


// Shared coordinate constants
const windowStart = 18;
const windowWidth = 350;
const widgetLineHeight = 14;
const groupboxMargin = 5;
const groupboxItemMargin = (groupboxMargin + 5);
const groupboxItemWidth = windowWidth - (groupboxItemMargin * 2);

const editorStartY = 90;
const viewportSize = 100;
const controlsSize = (windowWidth - (groupboxMargin * 2) - (viewportSize + 5));
const buttonSize = 24;


export class VehicleEditorWindow
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
			x: (groupboxMargin + viewportSize + 5) + (controlsSize * 0.25),
			y: (editorStartY + 18),
			width: (controlsSize * 0.75),
			height: widgetLineHeight,
		});
		this.variantSpinner.onChange = (i => this._editor.setVehicleVariant(i));

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

		const window = ui.openWindow({
			classification: VehicleEditorWindow.identifier,
			title: `Ride vehicle editor (v${pluginVersion})`,
			width: windowWidth,
			height: 210,
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
					y: (editorStartY + 18) + 1,
					width: (controlsSize * 0.3),
					height: widgetLineHeight,
					text: "Variant:"
				},
				this.variantSpinner.createWidget(),

				// Buttons
				<ButtonWidget>{
					type: 'button' as WidgetType,
					x: (groupboxMargin + viewportSize + 2),
					y: (editorStartY + (viewportSize - (buttonSize + 2))),
					width: buttonSize,
					height: buttonSize,
					image: 5167, // SPR_LOCATE
					onClick: () => this.scrollToVehicle()
				},
				<LabelWidget>{
					type: 'label' as WidgetType,
					x: (groupboxMargin + 33),
					y: (editorStartY + viewportSize) + 4,
					width: windowWidth,
					height: widgetLineHeight,
					text: "github.com/Basssiiie/OpenRCT2-RideVehicleEditor",
					isDisabled: true
				},
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
}


