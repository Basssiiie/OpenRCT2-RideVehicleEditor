import { RideVehicle } from "../helpers/ridesInPark";
import { getAvailableRideTypes, RideType } from "../helpers/rideTypes";
import { error, log, wrap } from "../helpers/utilityHelpers";
import { VehicleEditorWindow } from "./window";


/**
 * Service that allows to edit the selected vehicle.
 */
export class VehicleEditor
{
	private _rideTypes: RideType[];
	private _viewportUpdater: (IDisposable | null) = null;


	/**
	 * Gets the currently selected vehicle.
	 */
	get selectedVehicle(): (RideVehicle | null)
	{
		return this._selectedVehicle;
	}
	private _selectedVehicle: (RideVehicle | null) = null;


	/**
	 * Gets the currently selected ride type index.
	 */
	get rideTypeIndex(): number
	{
		return this._selectedTypeIndex;
	}
	private _selectedTypeIndex: number = 0;


	/**
	 * Gets the currently selected vehicle variant index.
	 */
	get vehicleVariant(): number
	{
		return this._selectedVariant;
	}
	private _selectedVariant: number = 0;


	/**
	 * Gets the currently selected ride type index.
	 */
	get vehiclePosition(): (CoordsXYZ | null)
	{
		return this._vehiclePosition;
	}
	private _vehiclePosition: (CoordsXYZ | null) = null;


	/**
	 * Create a new vehicle editor service that can edit the selected vehicle.
	 *
	 * @param window A vehicle editor window that should be updated according
	 * to how the vehicle is edited.
	 */
	constructor(readonly window: VehicleEditorWindow)
	{
		this._rideTypes = getAvailableRideTypes();

		window.setRideTypeList(this._rideTypes);
	}


	private disable()
	{
		this._selectedVehicle = null;
		this._vehiclePosition = null;

		this.stopViewportUpdater();

		this.window.setViewportPosition(null);
		this.window.setSelectedRideType(null);
		this.window.setVariantSpinner(null);
	}


	setVehicle(vehicle: RideVehicle | null)
	{
		if (!vehicle)
		{
			this.disable();
			return;
		}

		this._selectedVehicle = vehicle;
		const car = vehicle.getCar();

		// Viewport
		this.updateViewport();
		if (!this._viewportUpdater)
		{
			this._viewportUpdater = context.subscribe("interval.tick", () => this.updateViewport());
		}		

		// Ride type
		const rideTypeId = car.rideObject;
		//this._selectedTypeIndex = this._rideTypes.findIndex(r => r.rideIndex == rideTypeId);		
		for (let i = 0; i < this._rideTypes.length; i++)
		{
			if (this._rideTypes[i].rideIndex == rideTypeId)
			{
				this._selectedTypeIndex = i;
				break;
			}
		}

		this.window.setSelectedRideType(this._selectedTypeIndex);

		// Vehicle variant (sprite)
		const variantCount = this.getTotalVariantCount();
		const variant = car.vehicleObject;

		this._selectedVariant = variant;

		if (variantCount <= 1)
		{
			this.window.setVariantSpinner(null);
		}
		else
		{
			this.window.setVariantSpinner(variant);
		}
	}


	setRideType(rideTypeIndex: number)
	{
		if (!this._selectedVehicle)
		{
			error("There is no vehicle selected.", this.setRideType.name);
			return;
		}

		log("Selected a new vehicle type: " + rideTypeIndex);
		this._selectedTypeIndex = rideTypeIndex;

		const currentCar = this._selectedVehicle.getCar();
		const rideType = this._rideTypes[rideTypeIndex];

		log(`Set ride type to: ${rideType.name}, variant count: ${rideType.variantCount}`);
		currentCar.rideObject = rideType.rideIndex;

		this.setVehicleVariant(currentCar.vehicleObject);
		
		// TEMP: log all vehicle types
		var r = context.getObject("ride", rideType.rideIndex);

		log(`Ride name: ${r.name}, tabVehicle: ${r.tabVehicle}, minCarTrain: ${r.minCarsInTrain}, maxCarTrain: ${r.maxCarsInTrain}, carPerFlatRide: ${r.carsPerFlatRide}, shopItem: ${r.shopItem}, shopItem2: ${r.shopItemSecondary}`);

		r.vehicles.forEach(v => log(`- Vehicle: tabHeight: ${v.tabHeight}, spriteFlags: ${v.spriteFlags}, spriteSize: ${v.spriteWidth}x${v.spriteHeightPositive}, noSeatingRows: ${v.noSeatingRows}, noVehicleImages: ${v.noVehicleImages}, carVisual: ${v.carVisual}, baseImageId: ${v.baseImageId}, spacing: ${v.spacing}, numSeats: ${v.numSeats}, flags: ${v.flags}`));
	}


	setVehicleVariant(variantIndex: number)
	{
		if (!this._selectedVehicle)
		{
			error("There is no vehicle selected.", this.setVehicleVariant.name);
			return;
		}

		const variantCount = this.getTotalVariantCount();
		const currentCar = this._selectedVehicle.getCar();

		if (variantCount <= 1)
		{
			log(`Variant count = ${variantCount}, only single variant available.`);

			// Only a single variant available, set to 0.
			this._selectedVariant = 0;
			currentCar.vehicleObject = 0;

			this.window.setVariantSpinner(null);
		}
		else
		{
			// Multiple variants available; update accordingly.
			const variant = wrap(variantIndex, variantCount);
			this._selectedVariant = variant;

			log(`Variant index: ${variantIndex}, count: ${variantCount}, after wrap: ${variant}.`);

			currentCar.vehicleObject = variant;
			this.window.setVariantSpinner(variant);
		}
	}


	stopViewportUpdater()
	{
		if (this._viewportUpdater)
		{
			this._viewportUpdater.dispose();
			this._viewportUpdater = null;
		}
	}


	private updateViewport()
	{
		if (!this._selectedVehicle)
		{
			error("Viewport is still updated despite lack of selected vehicle.", this.updateViewport.name);
			this.stopViewportUpdater();
			return;
		}

		const trackedCar = this._selectedVehicle.getCar();

		if (trackedCar)
		{
			this._vehiclePosition = { x: trackedCar.x, y: trackedCar.y, z: trackedCar.z };
		}
		else
		{
			error("Selected vehicle has disappeared.", this.updateViewport.name);
			this.setVehicle(null);
		}

		this.window.setViewportPosition(this._vehiclePosition);
	}


	private getTotalVariantCount(): number
	{
		const currentType = this._rideTypes[this._selectedTypeIndex];
		return currentType.variantCount;
	}
}
