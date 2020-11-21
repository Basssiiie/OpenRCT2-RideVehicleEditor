import { ParkRide, RideTrain, RideVehicle } from "../helpers/ridesInPark";
import { RideType } from "../helpers/rideTypes";
import { error, log } from "../helpers/utilityHelpers";
import { VehicleEditor } from "./editor";
import { VehicleSelector } from "./selector";


// All widget ids
const windowId = 'ride-vehicle-editor';
const rideListId = 'rve-ride-list';
const trainListId = 'rve-train-list';
const trainSpinnerId = 'rve-train-spinner';
const vehicleListId = 'rve-vehicle-list';
const vehicleSpinnerId = 'rve-vehicle-spinner';

const vehicleViewportId = 'rve-vehicle-image';
const rideTypeListId = 'rve-ride-type-list';
const variantSpinnerId = 'rve-variant-spinner';


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
	private static _windowInstance: (VehicleEditorWindow | null);

	private _selector: VehicleSelector;
	private _editor: VehicleEditor;

	private _window: Window | null;


	/**
	 * Creates a new vehicle editor, or shows the currently opened one.
	 */
	static show(): VehicleEditorWindow
	{
		log("Open vehicle editor.");

		if (!this._windowInstance) {
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
		this._window = ui.getWindow(windowId);

		if (this._window)
		{
			this._window.bringToFront();
		}
		else
		{
			this.createWindow();
		}

		log("Initializing services.");
		this._selector = new VehicleSelector(this);
		this._editor = new VehicleEditor(this);

		this._selector.selectRide(0);
	}


	/**
	 * Creates a new editor window.
	 */
	private createWindow()
	{
		log("Open window")

		this._window = ui.openWindow({
			classification: windowId,
			title: "Ride vehicle editor (v0.2)",
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
				<DropdownWidget>{
					name: rideListId,
					type: 'dropdown' as WidgetType,
					x: groupboxItemMargin,
					y: windowStart + 25,
					width: groupboxItemWidth,
					height: widgetLineHeight,
					items: ["No rides available"],
					selectedIndex: 0,
					onChange: i => this._selector.selectRide(i)
				},
				// Train selector
				<SpinnerWidget>{
					name: trainSpinnerId,
					type: 'spinner' as WidgetType,
					x: groupboxItemMargin,
					y: windowStart + 43,
					width: (groupboxItemWidth / 2) - 2,
					height: widgetLineHeight,
					text: "",
					onIncrement: () => this._selector.selectTrain(this._selector.trainIndex + 1),
					onDecrement: () => this._selector.selectTrain(this._selector.trainIndex - 1)
				},
				<DropdownWidget>{
					name: trainListId,
					type: 'dropdown' as WidgetType,
					x: groupboxItemMargin,
					y: windowStart + 43,
					width: ((groupboxItemWidth / 2) - (widgetLineHeight * 2)) + 2,
					height: widgetLineHeight,
					items: ["No trains available"],
					selectedIndex: 0,
					isDisabled: true,
					onChange: i => this._selector.selectTrain(i)
				},
				// Vehicle selector
				<SpinnerWidget>{
					name: vehicleSpinnerId,
					type: 'spinner' as WidgetType,
					x: groupboxItemMargin + (groupboxItemWidth / 2) + 2,
					y: windowStart + 43,
					width: (groupboxItemWidth / 2) - 2,
					height: widgetLineHeight,
					text: "",
					onIncrement: () => this._selector.selectVehicle(this._selector.vehicleIndex + 1),
					onDecrement: () => this._selector.selectVehicle(this._selector.vehicleIndex - 1)
				},
				<DropdownWidget>{
					name: vehicleListId,
					type: 'dropdown' as WidgetType,
					x: groupboxItemMargin + (groupboxItemWidth / 2) + 2,
					y: windowStart + 43,
					width: ((groupboxItemWidth / 2) - (widgetLineHeight * 2)) + 2,
					height: widgetLineHeight,
					items: ["No vehicles available"],
					isDisabled: true,
					selectedIndex: 0,
					onChange: i => this._selector.selectVehicle(i)
				},
				// Ride vehicle editor:
				<ViewportWidget>{
					name: vehicleViewportId,
					type: 'viewport' as WidgetType,
					x: groupboxMargin,
					y: editorStartY,
					width: viewportSize,
					height: viewportSize,
					viewport: {}
				},
				<DropdownWidget>{
					name: rideTypeListId,
					type: 'dropdown' as WidgetType,
					x: groupboxMargin + viewportSize + 5,
					y: editorStartY,
					width: controlsSize - 1,
					height: widgetLineHeight,
					items: ["No ride types available"],
					selectedIndex: 0,
					onChange: i => this._editor.setRideType(i)
				},
				// Vehicle variant
				<LabelWidget>{
					type: 'label' as WidgetType,
					x: (groupboxMargin + viewportSize + 5),
					y: (editorStartY + 18) + 1,
					width: (controlsSize * 0.3),
					height: widgetLineHeight,
					text: "Variant:"
				},
				<SpinnerWidget>{
					name: variantSpinnerId,
					type: 'spinner' as WidgetType,
					x: (groupboxMargin + viewportSize + 5) + (controlsSize * 0.25),
					y: (editorStartY + 18),
					width: (controlsSize * 0.75),
					height: widgetLineHeight,
					text: "Not available",
					isDisabled: true,
					onIncrement: () => this._editor.setVehicleVariant(this._editor.vehicleVariant + 1),
					onDecrement: () => this._editor.setVehicleVariant(this._editor.vehicleVariant - 1)
				},
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
				this._editor.stopViewportUpdater();
				this._window = null;

				VehicleEditorWindow._windowInstance = null;
			}
		});
	}


	/**
	 * Update the ride list with the specified rides in the park.
	 * 
	 * @param rides The rides to show in the list.
	 */
	setRideList(rides: ParkRide[] | null)
	{
		const rideList = this.tryFindWidget<DropdownWidget>(rideListId);

		if (rideList)
		{
			if (rides && rides.length > 0)
			{
				rideList.isDisabled = false;
				rideList.items = rides.map(r => r.name);
			}
			else
			{
				rideList.isDisabled = true;
				rideList.items = ["No rides available"];
			}
		}
	}


	/**
	 * Update the train list with the specified trains.
	 * 
	 * @param trains The trains to show in the list.
	 */
	setTrainList(trains: RideTrain[] | null)
	{
		const trainList = this.tryFindWidget<DropdownWidget>(trainListId);

		if (trainList)
		{
			if (trains && trains.length > 0)
			{
				if (trains.length > 1)
				{
					trainList.isDisabled = false;
					trainList.items = trains.map(t => `Train ${t.index + 1}`);
				}				
				else
				{
					trainList.isDisabled = true;
					trainList.items = ["Train 1"];
				}
			}
			else
			{
				trainList.isDisabled = true;
				trainList.items = ["No trains available"];
			}
		}
	}


	/**
	 * Updates the train list to select the train at the specified index.
	 * 
	 * @param trainIndex The index of the train to select from the train list.
	 */
	setSelectedTrain(trainIndex: number)
	{
		const trainList = this.tryFindWidget<DropdownWidget>(trainListId);

		if (trainList)
		{
			trainList.selectedIndex = trainIndex;
		}
	}


	/**
	 * Updates the vehicle list with the specified vehicles.
	 * 
	 * @param vehicles The vehicles to show in the list.
	 */
	setVehicleList(vehicles: RideVehicle[] | null)
	{
		const vehicleList = this.tryFindWidget<DropdownWidget>(vehicleListId);

		if (vehicleList)
		{
			if (vehicles && vehicles.length > 0)
			{
				if (vehicles.length > 1)
				{
					vehicleList.isDisabled = false;
					vehicleList.items = vehicles.map((_, i) => `Vehicle ${i + 1}`);
				}
				else
				{
					vehicleList.isDisabled = true;
					vehicleList.items = ["Vehicle 1"];
				}
			}
			else
			{
				vehicleList.isDisabled = true;
				vehicleList.items = ["No vehicles available"];
			}
		}
	}


	/**
	 * Updates the vehicle list to select the vehicle at the specified index.
	 *
	 * @param vehicleIndex The index of the vehicle to select from the vehicle list.
	 */
	setSelectedVehicle(vehicleIndex: number)
	{
		const vehicleList = this.tryFindWidget<DropdownWidget>(vehicleListId);

		if (vehicleList)
		{
			vehicleList.selectedIndex = vehicleIndex;
		}
	}


	/**
	 * Updates the editor to show the specified vehicle.
	 * 
	 * @param vehicle The vehicle to show in the editor.
	 */
	setEditor(vehicle: RideVehicle | null)
	{
		this._editor.setVehicle(vehicle);
	}


	/**
	 * Updates the viewport to show the specified position.
	 * 
	 * @param position A position in the world to show in the viewport.
	 */
	setViewportPosition(position: CoordsXYZ | null)
	{
		const viewport = this.tryFindWidget<ViewportWidget>(vehicleViewportId);

		if (viewport)
		{
			if (position)
			{
				viewport.viewport.moveTo(position);
			}
			else
			{
				viewport.viewport.moveTo({ x: -9000, y: -9000 });
			}
		}
	}


	/**
	 * Updates the ride type list with the specified ride types.
	 * 
	 * @param rideTypes The ride types to show in the ride type list.
	 */
	setRideTypeList(rideTypes: RideType[])
	{
		const typeList = this.tryFindWidget<DropdownWidget>(rideTypeListId);

		if (typeList)
		{
			if (rideTypes && rideTypes.length > 0)
			{
				typeList.isDisabled = false;
				typeList.items = rideTypes.map(t => t.name);
			}
			else
			{
				typeList.isDisabled = true;
				typeList.items = ["No ride types available"];
			}
		}
	}


	/**
	 * Updates the ride type list to select the ride type at the specified index.
	 *
	 * @param rideTypeIndex The index of the ride type to select from the ride type list.
	 */
	setSelectedRideType(rideTypeIndex: number | null)
	{
		const typeList = this.tryFindWidget<DropdownWidget>(rideTypeListId);

		if (typeList)
		{
			if (rideTypeIndex != null)
			{
				typeList.isDisabled = false;
				typeList.selectedIndex = rideTypeIndex;
			}
			else
			{
				typeList.isDisabled = true;
			}
		}
	}


	/**
	 * Updates the variant spinner to show the specified number.
	 * 
	 * @param number The number of the vehicle variant.
	 */
	setVariantSpinner(number: number | null)
	{
		const variantSpinner = this.tryFindWidget<SpinnerWidget>(variantSpinnerId);

		if (variantSpinner)
		{
			if (number != null)
			{
				variantSpinner.isDisabled = false;
				variantSpinner.text = number.toString();
			}
			else
			{
				variantSpinner.isDisabled = true;
				variantSpinner.text = "Not available";
			}
		}
	}


	/**
	 * Scroll the main viewport to the currently selected vehicle.
	 */
	private scrollToVehicle()
	{
		if (this._editor.selectedVehicle && this._editor.vehiclePosition)
		{
			ui.mainViewport.scrollTo(this._editor.vehiclePosition)
		}
		else
		{
			error("No vehicle has been selected to scroll to.", this.scrollToVehicle.name);
		}
	}


	/**
	 * Attempt to find the widget with the specified name, or log an error if it
	 * could not be found.
	 */
	private tryFindWidget<TWidget extends Widget>(name: string): (TWidget | null)
	{
		if (!this._window)
		{
			error("Editor is still interacting with window that has been closed.");
			return null;
		}

		return this._window.findWidget<TWidget>(name);
	}
}


