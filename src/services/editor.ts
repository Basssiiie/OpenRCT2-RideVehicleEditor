import { RideVehicle } from "../helpers/ridesInPark";
import { getAvailableRideTypes, RideType } from "../helpers/rideTypes";
import { error, log } from "../helpers/utilityHelpers";
import { VehicleEditorWindow } from "../ui/window";


/**
 * Service that allows to edit the selected vehicle.
 */
export class VehicleEditor
{
	private _rideTypes: RideType[];


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


	disable()
	{
		this._selectedVehicle = null;
	}


	setVehicle(vehicle: RideVehicle)
	{
		log(`Editor set to vehicle, entity id: ${vehicle.entityId}`);

		this._selectedVehicle = vehicle;
		const car = vehicle.getCar();

		// Viewport
		this.window.viewport.follow(vehicle.entityId);

		// Ride type
		const rideTypeId = car.rideObject;
		for (let i = 0; i < this._rideTypes.length; i++)
		{
			if (this._rideTypes[i].rideIndex == rideTypeId)
			{
				this._selectedTypeIndex = i;
				break;
			}
		}

		this.window.rideTypeList.set(this._selectedTypeIndex);

		// Vehicle variant (sprite)
		this.updateVariantSpinner(car);
	}


	setRideType(rideTypeIndex: number)
	{
		if (!this._selectedVehicle)
		{
			error("There is no vehicle selected.", "setRideType");
			return;
		}

		this._selectedTypeIndex = rideTypeIndex;

		const currentCar = this._selectedVehicle.getCar();
		const rideType = this._rideTypes[rideTypeIndex];

		log(`Set vehicle ride type to: ${rideType.name} (index: ${rideTypeIndex})`);
		currentCar.rideObject = rideType.rideIndex;

		// Update spinner 
		this.updateVariantSpinner(currentCar);
	}


	setVehicleVariant(variantIndex: number)
	{
		if (!this._selectedVehicle)
		{
			error("There is no vehicle selected.", "setVehicleVariant");
			return;
		}

		const currentCar = this._selectedVehicle.getCar();

		log(`Set vehicle variant index: ${variantIndex}.`);
		currentCar.vehicleObject = variantIndex;
	}


	private updateVariantSpinner(car: Car)
	{
		const currentType = this._rideTypes[this._selectedTypeIndex];
		const variantCount = currentType.variantCount
		const variant = car.vehicleObject;

		const spinner = this.window.variantSpinner;
		spinner.maximum = variantCount;
		spinner.set(variant);
	}
}
