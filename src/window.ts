import { getRidesInPark, ParkRide, ParkRideTrain, ParkRideVehicle } from "./ridesInPark";
import { getAvailableRideTypes, RideType } from "./rideTypes";


const windowId = 'ride-vehicle-editor';
const rideSelectGroupId = 'rve-selection-group';
const rideLabelId = 'rve-ride-label';
const rideListId = 'rve-ride-list';
const trainListId = 'rve-train-list';
const vehicleListId = 'rve-vehicle-list';
const vehicleViewportId = 'rve-vehicle-image';
const rideTypeListId = 'rve-ride-type-list';
const variantSpinnerId = 'rve-variant-spinner';

const windowStart = 18;
const windowWidth = 300;
const widgetLineHeight = 14;
const groupboxMargin = 5;
const groupboxItemMargin = (groupboxMargin + 5);
const groupboxItemWidth = windowWidth - (groupboxItemMargin * 2);

const editorStartY = 90;



export class VehicleEditorWindow {

    private static windowInstance: VehicleEditorWindow = null;
    private window: Window;

    private parkRides: ParkRide[] = getRidesInPark();
    private rideTrains: ParkRideTrain[];
    private trainVehicles: ParkRideVehicle[];

    private selectedRide: number = 0;
    private selectedTrain: number = 0;
    private selectedVehicle: number = 0;

    private rideTypes: RideType[] = getAvailableRideTypes();

    private currentType: number;
    private currentVariant: number = 0;



    private constructor() {
        this.window = ui.getWindow(windowId);
        this.window = null;

        if (this.window) {
            this.window.bringToFront();
        }
        else {
            this.createWindow();

            this.updateTrainList(this.parkRides[this.selectedRide]);
            console.log("window created");
		}
    }


    /*
     * Gets the currently opened vehicle editor.
     */
    static show(): VehicleEditorWindow {
        //if (this.windowInstance == null) {
        //    this.windowInstance = new VehicleEditorWindow();
        //}
        //this.windowInstance.window.bringToFront();
        return new VehicleEditorWindow();// this.windowInstance;
    }


    /*
     * Creates a new editor window.
     */
    private createWindow() {
        console.log("Open window")

        this.window = ui.openWindow({
            classification: windowId,
            title: "Ride vehicle editor",
            width: windowWidth,
            height: 200,
            widgets: [
                // Selection group:
                <Widget>{
                    name: rideSelectGroupId,
                    type: 'groupbox' as WidgetType,
                    x: groupboxMargin,
                    y: windowStart,
                    width: windowWidth - (groupboxMargin * 2),
                    height: 64
                },
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
                    items: this.parkRides.map(r => r.name),
                    selectedIndex: 0,
                    onChange: i => this.selectRide(i)
                },
                <DropdownWidget>{
                    name: trainListId,
                    type: 'dropdown' as WidgetType,
                    x: groupboxItemMargin,
                    y: windowStart + 43,
                    width: (groupboxItemWidth / 2) - 2,
                    height: widgetLineHeight,
                    items: ["No trains available"],
                    selectedIndex: 0,
                    onChange: i => this.selectTrain(i)
                },
                <DropdownWidget>{
                    name: vehicleListId,
                    type: 'dropdown' as WidgetType,
                    x: groupboxItemMargin + (groupboxItemWidth / 2) + 2,
                    y: windowStart + 43,
                    width: (groupboxItemWidth / 2) - 2,
                    height: widgetLineHeight,
                    items: ["No vehicles available"],
                    selectedIndex: 0,
                    onChange: i => this.selectVehicle(i)
                },
                // Ride vehicle editor:
                <ViewportWidget>{
                    name: vehicleViewportId,
                    type: 'viewport' as WidgetType,
                    x: groupboxMargin,
                    y: editorStartY,
                    width: 100,
                    height: 100,
                    viewport: {}
                },
                <DropdownWidget>{
                    name: rideTypeListId,
                    type: 'dropdown' as WidgetType,
                    x: groupboxMargin + 105,
                    y: editorStartY,
                    width: windowWidth - (groupboxMargin * 2) - 105,
                    height: widgetLineHeight,
                    items: this.rideTypes.map(r => r.name),
                    selectedIndex: 0,
                    onChange: i => this.setRideType(i)
                },
                <SpinnerWidget>{
                    name: variantSpinnerId,
                    type: 'spinner' as WidgetType,
                    x: groupboxMargin + 105,
                    y: editorStartY + 18,
                    width: windowWidth - (groupboxMargin * 2) - 105,
                    height: widgetLineHeight,
                    text: "Not available",
                    onIncrement: () => this.setVehicleVariant(this.currentVariant + 1),
                    onDecrement: () => this.setVehicleVariant(this.currentVariant - 1)
                }
            ],
            onClose: () => {
                console.log("close window");
                this.window = null;
            }
        });
    }


    selectRide(selectedRide: number) {
        console.log("selected ride: " + selectedRide);
        this.selectedRide = selectedRide;

        const parkRide = this.parkRides[this.selectedRide];
        /*
        const ride = map.getRide(parkRide.rideId);
        console.log("--print--");
        ride.vehicles.forEach(id => {
            const car = VehicleEditorWindow.printEntity(id, ">");

            if (car) {
                const definition = context.getObject("ride", car.rideObject);
                console.log(`\t(${definition.legacyIdentifier}/${definition.identifier}) ${definition.name}: ${definition.description}`)

                definition.vehicles.forEach((v, i) => {
                    console.log(`\t--> ${i}: base image: ${v.baseImageId}, sprite width: ${v.spriteWidth}`)
                });

                let nextcarId = car.nextCarOnTrain;
                while (nextcarId) {
                    nextcarId = VehicleEditorWindow.printEntity(nextcarId, "\t>")?.nextCarOnTrain;
                }
            }
        });
        */
        console.log("Enable train dropdown");
        this.updateTrainList(parkRide);
    }


    selectTrain(selectedTrain: number) {
        this.selectedTrain = selectedTrain;
        console.log(`Selected train ${selectedTrain}, this = ${this}`);

        this.updateVehicleList(this.rideTrains[selectedTrain]);
    }


    selectVehicle(selectedVehicle: number) {
        this.selectedVehicle = selectedVehicle;
        console.log(`Selected vehicle ${selectedVehicle}, this = ${this}`);

        this.updateEditor(this.trainVehicles[selectedVehicle]);
    }


    updateTrainList(ride: ParkRide) {
        const trainList = this.window.findWidget<DropdownWidget>(trainListId);
        this.rideTrains = ride.getTrains();
        /*
        this.rideTrains.forEach(t => {
            console.log(`Train ${t.index + 1}`);
            VehicleEditorWindow.printEntity(t.headCarId, "Info: ");
		})
        */
        trainList.items = this.rideTrains.map(t => `Train ${t.index + 1}`);

        this.updateVehicleList(this.rideTrains[0]);
    }


    updateVehicleList(train: ParkRideTrain) {
        const vehicleList = this.window.findWidget<DropdownWidget>(vehicleListId);

        if (!train) {
            vehicleList.isDisabled = true;
            return;
        }

        vehicleList.isDisabled = false;
        this.trainVehicles = train.getVehicles();

        vehicleList.items = this.trainVehicles.map((c, i) => `Vehicle ${i + 1}`);

        this.updateEditor(this.trainVehicles[0]);
    }


    updateEditor(vehicle: ParkRideVehicle) {
        VehicleEditorWindow.printEntity(vehicle.entityId, "CURRENT ENTITY:")

        const car = vehicle.getCar();

        if (car) {
            const viewport = this.window.findWidget<ViewportWidget>(vehicleViewportId);
            viewport.viewport.moveTo(<CoordsXYZ>{ x: car.x, y: car.y, z: car.z });

            const rideDefinitionId = car.rideObject;
            if (rideDefinitionId) {
                const rideTypeList = this.window.findWidget<DropdownWidget>(rideTypeListId);

                //const index = this.rideTypes.findIndex(r => r.rideIndex == rideDefinitionId);
                for (let i = 0; i < this.rideTypes.length; i++) {
                    if (this.rideTypes[i].rideIndex == rideDefinitionId) {
                        console.log("Found at index: " + i);
                        this.currentType = i;
                        break;
					}
                }

                if (this.currentType != -1) {
                    rideTypeList.selectedIndex = this.currentType;
                    this.updateVehicleVariantWidget(car.vehicleObject, this.rideTypes[this.currentType].variantCount);
                }
                else
                    console.log("Could not find ride type definition for this car.");

            }
            else
                console.log("Could not find ride object with this car.");

        }
        else
            console.log("Entity is not a car.");
    }


    setRideType(selectedRideType: number) {
        console.log("Selected a new vehicle type: " + selectedRideType);

        const currentVehicle = this.trainVehicles[this.selectedVehicle];
        const currentCar = currentVehicle.getCar();

        const rideType = this.rideTypes[selectedRideType];

        console.log("Set ride type to: " + rideType.name);
        currentCar.rideObject = rideType.rideIndex;

        this.setVehicleVariant(0);
    }


    setVehicleVariant(selectedVariant: number) {

        console.log("Selected a new vehicle variant: " + selectedVariant);

        // Update internal value.
        const currentType = this.rideTypes[this.currentType];

        if (selectedVariant < 0) {
            selectedVariant = currentType.variantCount - 1;
        }
        else {
            selectedVariant %= currentType.variantCount;
		}

        this.currentVariant = selectedVariant;

        // Update the selected vehicle.
        const currentVehicle = this.trainVehicles[this.selectedVehicle];
        const currentCar = currentVehicle.getCar();

        console.log("Updated variant to " + selectedVariant);
        currentCar.vehicleObject = selectedVariant;

        this.updateVehicleVariantWidget(selectedVariant, currentType.variantCount);
    }


    updateVehicleVariantWidget(variant: number, totalVariants: number) {
        const variantSpinner = this.window.findWidget<SpinnerWidget>(variantSpinnerId);

        if (totalVariants <= 1) {
            variantSpinner.isDisabled = true;
            variantSpinner.text = "Not available";
            return;
        }

        variantSpinner.isDisabled = false;
        variantSpinner.text = variant.toString();
	}


    static printEntity(id: number, prefix: string): Car {
        const entity = map.getEntity(id);
        if (entity) {

            const car = entity as Car;
            if (car) {
                console.log(`${prefix} car ${car.id} - rideObject: ${car.rideObject}, vehicleObject: ${car.vehicleObject}, spriteType: ${car.spriteType}`);
                return car;
            }
            else
                console.log(`${prefix} entity ${entity.id} is a ${entity.type}`);
        }
        else
            console.log(`${prefix} entity is null`);

        return null;
	}
	
}


