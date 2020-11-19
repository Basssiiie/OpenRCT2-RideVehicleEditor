import { ParkRide, RideTrain, RideVehicle } from "../helpers/ridesInPark";
import { RideType } from "../helpers/rideTypes";
import { error, log } from "../helpers/utilityHelpers";
import { VehicleEditor } from "./editor";
import { VehicleSelector } from "./selector";


const windowId = 'ride-vehicle-editor';
const rideSelectGroupId = 'rve-selection-group';
const rideLabelId = 'rve-ride-label';
const rideListId = 'rve-ride-list';
const trainListId = 'rve-train-list';
const trainSpinnerId = 'rve-train-spinner';
const vehicleListId = 'rve-vehicle-list';
const vehicleSpinnerId = 'rve-vehicle-spinner';

const vehicleViewportId = 'rve-vehicle-image';
const rideTypeListId = 'rve-ride-type-list';
const variantLabelId = 'rve-variant-label';
const variantSpinnerId = 'rve-variant-spinner';

const windowStart = 18;
const windowWidth = 350;
const widgetLineHeight = 14;
const groupboxMargin = 5;
const groupboxItemMargin = (groupboxMargin + 5);
const groupboxItemWidth = windowWidth - (groupboxItemMargin * 2);

const editorStartY = 90;
const viewportSize = 100;
const controlsSize = (windowWidth - (groupboxMargin * 2) - (viewportSize + 5));


export class VehicleEditorWindow
{
	private selector: VehicleSelector;
	private editor: VehicleEditor;

	private window: Window | null;


	/**
	 * Creates a new vehicle editor, or shows the currently opened one.
	 */
	static show(): VehicleEditorWindow
	{
		log("Open vehicle editor.");

		//if (this.windowInstance == null) {
		//    this.windowInstance = new VehicleEditorWindow();
		//}
		//this.windowInstance.window.bringToFront();
		return new VehicleEditorWindow();// this.windowInstance;
	}


	/**
	 * Creates a new window for the specified editor.
	 *
	 * @param selector The associated editor which will select a vehicle.
	 * @param editor The associated editor which will edit the vehicle.
	 */
	private constructor()
	{
		this.window = ui.getWindow(windowId);

		if (this.window)
		{
			this.window.bringToFront();
		}
		else
		{
			this.createWindow();
		}

		log("Initializing services.");
		this.selector = new VehicleSelector(this);
		this.editor = new VehicleEditor(this);

		this.selector.setRideIndex(0);
	}


	/**
	 * Creates a new editor window.
	 */
	private createWindow()
	{
		log("Open window")

		this.window = ui.openWindow({
			classification: windowId,
			title: "Ride vehicle editor",
			width: windowWidth,
			height: 210,
			widgets: [
				// Selection group
				<Widget>{
					name: rideSelectGroupId,
					type: 'groupbox' as WidgetType,
					x: groupboxMargin,
					y: windowStart,
					width: windowWidth - (groupboxMargin * 2),
					height: 64
				},
				// Ride selector
				<LabelWidget>{
					name: rideLabelId,
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
					onChange: i => this.selector.setRideIndex(i)
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
					onIncrement: () => this.selector.setTrainIndex(this.selector.trainIndex + 1),
					onDecrement: () => this.selector.setTrainIndex(this.selector.trainIndex - 1)
				},
				<DropdownWidget>{
					name: trainListId,
					type: 'dropdown' as WidgetType,
					x: groupboxItemMargin,
					y: windowStart + 43,
					width: ((groupboxItemWidth / 2) - (widgetLineHeight * 2)) + 1,
					height: widgetLineHeight,
					items: ["No trains available"],
					selectedIndex: 0,
					onChange: i => this.selector.setTrainIndex(i)
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
					onIncrement: () => this.selector.setVehicleIndex(this.selector.vehicleIndex + 1),
					onDecrement: () => this.selector.setVehicleIndex(this.selector.vehicleIndex - 1)
				},
				<DropdownWidget>{
					name: vehicleListId,
					type: 'dropdown' as WidgetType,
					x: groupboxItemMargin + (groupboxItemWidth / 2) + 2,
					y: windowStart + 43,
					width: ((groupboxItemWidth / 2) - (widgetLineHeight * 2)) + 1,
					height: widgetLineHeight,
					items: ["No vehicles available"],
					selectedIndex: 0,
					onChange: i => this.selector.setVehicleIndex(i)
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
					width: controlsSize,
					height: widgetLineHeight,
					items: ["No ride types available"],
					selectedIndex: 0,
					onChange: i => this.editor.setRideType(i)
				},
				<LabelWidget>{
					name: variantLabelId,
					type: 'label' as WidgetType,
					x: (groupboxMargin + viewportSize + 5) + 2,
					y: (editorStartY + 18) + 1,
					width: (controlsSize * 0.4),
					height: widgetLineHeight,
					text: "Variant:"
				},
				<SpinnerWidget>{
					name: variantSpinnerId,
					type: 'spinner' as WidgetType,
					x: (groupboxMargin + viewportSize + 5) + (controlsSize * 0.4),
					y: (editorStartY + 18),
					width: (controlsSize * 0.6),
					height: widgetLineHeight,
					text: "Not available",
					onIncrement: () => this.editor.setVehicleVariant(this.editor.vehicleVariant + 1),
					onDecrement: () => this.editor.setVehicleVariant(this.editor.vehicleVariant - 1)
				},
				/*
				<ButtonWidget>{
					name: variantSpinnerId,
					type: 'button' as WidgetType,
					x: (groupboxMargin + viewportSize + 5) + (controlsSize * 0.4),
					y: (editorStartY + 18),
					width: (controlsSize * 0.6),
					height: widgetLineHeight,
					image: 1
				},
				*/
				<LabelWidget>{
					name: variantLabelId,
					type: 'label' as WidgetType,
					x: (groupboxMargin + 30),
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
				this.editor.stopViewportUpdater();
				this.window = null;
			}
		});
	}


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


	setSelectedTrain(trainIndex: number)
	{
		const trainList = this.tryFindWidget<DropdownWidget>(trainListId);

		if (trainList)
		{
			trainList.selectedIndex = trainIndex;
		}
	}


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


	setSelectedVehicle(vehicleIndex: number)
	{
		const vehicleList = this.tryFindWidget<DropdownWidget>(vehicleListId);

		if (vehicleList)
		{
			vehicleList.selectedIndex = vehicleIndex;
		}
	}


	setViewportPosition(position: CoordsXYZ)
	{
		const viewport = this.tryFindWidget<ViewportWidget>(vehicleViewportId);

		if (viewport)
		{
			viewport.viewport.moveTo(position);
		}
	}


	setEditor(vehicle: RideVehicle | null)
	{
		if (vehicle)
		{
			this.editor.setVehicle(vehicle);
		}
		else
		{
			this.setSelectedRideType(null);
			this.setVariantSpinner(null);
		}

	}


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


	private tryFindWidget<TWidget extends Widget>(name: string): (TWidget | null)
	{
		if (!this.window)
		{
			error("Editor is still interacting with window that has been closed.");
			return null;
		}

		return this.window.findWidget<TWidget>(name);
	}


	/*
	private printEntity(id: number, prefix: string): Car {
		const entity = map.getEntity(id);
		if (entity) {

			const car = entity as Car;
			if (car) {
				log(`${prefix} car ${car.id} - rideObject: ${car.rideObject}, vehicleObject: ${car.vehicleObject}, spriteType: ${car.spriteType}`);
				return car;
			}
			else
				log(`${prefix} entity ${entity.id} is a ${entity.type}`);
		}
		else
			log(`${prefix} entity is null`);

		return null;
	}
	*/
}


