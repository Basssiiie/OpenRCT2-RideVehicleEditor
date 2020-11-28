import { RideVehicle } from "../helpers/ridesInPark";
import { getAvailableRideTypes, RideType } from "../helpers/rideTypes";
import { error, log } from "../helpers/utilityHelpers";
import VehicleEditorWindow from "../ui/editorWindow";


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


	/**
	 * Disables all editor controls.
	 */
	disable()
	{
		this._selectedVehicle = null;
	}


	/**
	 * Sets the vehicle to edit in this editor.
	 * 
	 * @param vehicle The vehicle to edit.
	 */
	setVehicle(vehicle: RideVehicle)
	{
		log(`(editor) Vehicle set, entity id: ${vehicle.entityId}`);

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

		// Vehicle type properties
		this.refreshProperties(car);
	}


	/**
	 * Sets the ride type for this vehicle.
	 * 
	 * @param rideTypeIndex The index of the ride type in the ride type list.
	 */
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

		log(`(editor) Set vehicle ride type to: ${rideType.name} (index: ${rideTypeIndex})`);
		currentCar.rideObject = rideType.rideIndex;

		// Update properties
		this.refreshProperties(currentCar);
	}


	/**
	 * Sets the vehicle sprite variant. (e.g. locomotive, tender or passenger car)
	 * 
	 * @param variantIndex The index into the vehicle sprite list.
	 */
	setVehicleVariant(variantIndex: number)
	{
		if (!this._selectedVehicle)
		{
			error("There is no vehicle selected.", "setVehicleVariant");
			return;
		}

		const currentCar = this._selectedVehicle.getCar();

		log(`(editor) Set vehicle variant index to: ${variantIndex}.`);
		currentCar.vehicleObject = variantIndex;
	}


	/**
	 * Sets the maximum number of seats for this vehicle.
	 * @param numberOfSeats The amount of seats on this vehicle.
	 */
	setVehicleSeatCount(numberOfSeats: number)
	{
		if (!this._selectedVehicle)
		{
			error("There is no vehicle selected.", "setVehicleMaxSeats");
			return;
		}

		const currentCar = this._selectedVehicle.getCar();

		log(`(editor) Set vehicle max seat count to: ${numberOfSeats}.`);
		currentCar.numSeats = numberOfSeats;
	}


	/**
	 * Refreshes the vehicle properties related to its type.
	 */
	private refreshProperties(car: Car)
	{
		const currentType = this._rideTypes[this._selectedTypeIndex];

		// Variant
		const variant = this.window.variantSpinner;
		variant.value = car.vehicleObject;
		variant.maximum = currentType.variantCount;
		variant.refresh();

		// Number of seats
		const seats = this.window.seatCountSpinner;
		seats.value = car.numSeats;
		seats.refresh();

		log(`(editor) Properties refreshed; variant ${variant.value}/${variant.maximum}; seats: ${seats.value}`);
	}
}
