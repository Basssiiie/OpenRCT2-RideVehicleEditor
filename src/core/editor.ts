import { RideVehicle } from "../helpers/ridesInPark";
import { getAvailableRideTypes, RideType } from "../helpers/rideTypes";
import { log, wrap } from "../helpers/utilityHelpers";
import { VehicleEditorWindow } from "./window";


export class VehicleEditor {

    private _rideTypes: RideType[];
    private _selectedVehicle!: RideVehicle;


    /**
     * Gets the currently selected ride type index.
     */
    get rideTypeIndex(): number {
        return this._selectedTypeIndex;
    }
    private _selectedTypeIndex: number = 0;


    /**
     * Gets the currently selected vehicle variant index.
     */
    get vehicleVariant(): number {
        return this._selectedVariant;
    }
    private _selectedVariant: number = 0;


    constructor(readonly window: VehicleEditorWindow) {
        this._rideTypes = getAvailableRideTypes();

        window.setRideTypeList(this._rideTypes);
    }


    setVehicle(vehicle: RideVehicle) {
        this._selectedVehicle = vehicle;
        const car = vehicle.getCar();

        // Viewport
        this.window.setViewportPosition({ x: car.x, y: car.y, z: car.z });

        // Ride type
        const rideTypeId = car.rideObject;
        //const index = this.rideTypes.findIndex(r => r.rideIndex == rideDefinitionId);
        for (let i = 0; i < this._rideTypes.length; i++) {
            if (this._rideTypes[i].rideIndex == rideTypeId) {
                this._selectedTypeIndex = i;
                break;
            }
        }

        this.window.setSelectedRideType(this._selectedTypeIndex);

        // Vehicle variant (sprite)
        const variantCount = this.getTotalVariantCount();
        const variant = car.vehicleObject;

        this._selectedVariant = variant;

        if (variantCount <= 1) {
            this.window.setVariantSpinner(null);
        }
        else {
            this.window.setVariantSpinner(car.vehicleObject);
        }
    }


    setRideType(rideTypeIndex: number) {
        log("Selected a new vehicle type: " + rideTypeIndex);
        this._selectedTypeIndex = rideTypeIndex;

        const currentCar = this._selectedVehicle.getCar();
        const rideType = this._rideTypes[rideTypeIndex];

        log(`Set ride type to: ${rideType.name}, variant count: ${rideType.variantCount}`);
        currentCar.rideObject = rideType.rideIndex;

        this.setVehicleVariant(0);

        // TEMP: log all vehicle types
        var r = context.getObject("ride", rideType.rideIndex);

        log(`name: ${r.name}, tabVehicle: "${r.tabVehicle}", minCarTrain: ${r.minCarsInTrain}, maxCarTrain: ${r.maxCarsInTrain}, carPerFlatRide: ${r.carsPerFlatRide}, shopItem: ${r.shopItem}, shopItem2: ${r.shopItemSecondary}`);

        r.vehicles.forEach(v => log(`- tabHeight: ${v.tabHeight}, spriteFlags: ${v.spriteFlags}, spriteSize: ${v.spriteWidth}x${v.spriteHeightPositive}, noSeatingRows: ${v.noSeatingRows}, noVehicleImages: ${v.noVehicleImages}, carVisual: ${v.carVisual}, baseImageId: ${v.baseImageId}, spacing: ${v.spacing}, numSeats: ${v.numSeats}, flags: ${v.flags}`));

    }


    setVehicleVariant(variantIndex: number) {
        const variantCount = this.getTotalVariantCount();
        const currentCar = this._selectedVehicle.getCar();

        if (variantCount <= 1) {
            log(`Variant count = ${variantCount}, only single variant available.`);

            // Only a single variant available, set to 0.
            this._selectedVariant = 0;
            currentCar.vehicleObject = 0;

            this.window.setVariantSpinner(null);
        }
        else {
            // Multiple variants available; update accordingly.
            const variant = wrap(variantIndex, variantCount);
            this._selectedVariant = variant;

            log(`Variant index: ${variantIndex}, count: ${variantCount}, after wrap: ${variant}.`);

            currentCar.vehicleObject = variant;
            this.window.setVariantSpinner(variant);
		}
               
    }


    private getTotalVariantCount(): number {
        const currentType = this._rideTypes[this._selectedTypeIndex];
        return currentType.variantCount;
	}
}
