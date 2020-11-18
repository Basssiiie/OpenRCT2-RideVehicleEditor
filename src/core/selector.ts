import { getRidesInPark, ParkRide, RideTrain, RideVehicle } from "../helpers/ridesInPark";
import { log } from "../helpers/utilityHelpers";
import { VehicleEditorWindow } from "./window";


export class VehicleSelector {

    private _parkRides: ParkRide[];
    private _rideTrains!: RideTrain[];
    private _trainVehicles!: RideVehicle[];


    /**
     * Gets the currently selected ride index.
     */
    get rideIndex(): number {
        return this._selectedRideIndex;
    }
    private _selectedRideIndex: number = 0;


    /**
     * Gets the currently selected train index.
     */
    get trainIndex(): number {
        return this._selectedTrainIndex;
    }
    private _selectedTrainIndex: number = 0;


    /**
     * Gets the currently selected vehicle index.
     */
    get vehicleIndex(): number {
        return this._selectedVehicleIndex;
    }
    private _selectedVehicleIndex: number = 0;



    constructor(readonly window: VehicleEditorWindow) {
        this._parkRides = getRidesInPark();

        window.setRideList(this._parkRides);
    }



    setRideIndex(rideIndex: number) {
        log("Selected ride: " + rideIndex);
        this._selectedRideIndex = rideIndex;

        if (this._parkRides && this._parkRides.length > 0) {
            const parkRide = this._parkRides[rideIndex];
            this._rideTrains = parkRide.getTrains();

            this.window.setTrainList(this._rideTrains);
            this.setTrainIndex(0);
        }
        else {
            log("Error: this park has no rides.");
            this.window.setTrainList(null);
            this.window.setVehicleList(null);
            this.window.setEditor(null);
		}

    }


    setTrainIndex(trainIndex: number) {
        log(`Selected train: ${trainIndex}`);
        this._selectedTrainIndex = trainIndex;

        if (this._rideTrains && this._rideTrains.length > 0) {
            const train = this._rideTrains[trainIndex];
            this._trainVehicles = train.getVehicles();

            this.window.setVehicleList(this._trainVehicles);
            this.setVehicleIndex(0);
        }
        else {
            log("Error: this ride has no trains.");
            this.window.setVehicleList(null);
            this.window.setEditor(null);
		}

    }


    setVehicleIndex(vehicleIndex: number) {
        log(`Selected vehicle: ${vehicleIndex}`);
        this._selectedVehicleIndex = vehicleIndex;

        if (this._trainVehicles && this._trainVehicles.length > 0) {
            const vehicle = this._trainVehicles[vehicleIndex];
            this.window.setEditor(vehicle);
        }
        else {
            log("Error: this train has no vehicles.");
            this.window.setEditor(null);
		}
    }
}
