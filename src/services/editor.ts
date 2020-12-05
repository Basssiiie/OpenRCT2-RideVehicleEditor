import { RideVehicle } from "../helpers/ridesInPark";
import { getAvailableRideTypes, RideType } from "../helpers/rideTypes";
import { isDebugMode, error, log } from "../helpers/utilityHelpers";
import DebugWindow from "../ui/debugWindow";
import VehicleEditorWindow from "../ui/editorWindow";
import VehicleSelector from "./selector";


/**
 * Service that allows to edit the selected vehicle.
 */
export default class VehicleEditor
{
	private _rideTypes: RideType[];
	private _selectedVehicle: (RideVehicle | null) = null;
	private _selectedTypeIndex: number = 0;


	/**
	 * Create a new vehicle editor service that can edit the selected vehicle.
	 * 
	 * @param window A vehicle editor window that should be updated according
	 * to how the vehicle is edited.
	 */
	constructor(selector: VehicleSelector, readonly window: VehicleEditorWindow)
	{
		this._rideTypes = getAvailableRideTypes();
		window.setRideTypeList(this._rideTypes);

		window.rideTypeList.onSelect = (i => this.setRideType(i));
		window.variantSpinner.onChange = (i => this.setVehicleVariant(i));
		window.seatCountSpinner.onChange = (i => this.setVehicleSeatCount(i));
		window.powAccelerationSpinner.onChange = (i => this.setVehiclePoweredAcceleration(i));
		window.powMaxSpeedSpinner.onChange = (i => this.setVehiclePoweredMaximumSpeed(i));
		window.massSpinner.onChange = (i => this.setVehicleMass(i));
		window.onLocateVehicle = (() => this.scrollToCar());

		const selectedVehicle = selector.selectedVehicle;
		if (selectedVehicle)
		{
			this.setVehicle(selectedVehicle);
		}

		selector.onSelect = (v => (v) ? this.setVehicle(v) : this.disable());
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

		if (isDebugMode)
		{
			new DebugWindow(car.id);
		}
	}


	/**
	 * Sets the ride type for this vehicle.
	 * 
	 * @param rideTypeIndex The index of the ride type in the ride type list.
	 */
	setRideType(rideTypeIndex: number)
	{
		this._selectedTypeIndex = rideTypeIndex;

		const currentCar = this.getSelectedCar();
		const rideType = this._rideTypes[rideTypeIndex];

		log(`(editor) Set vehicle ride type to: ${rideType.name} (index: ${rideTypeIndex})`);
		currentCar.rideObject = rideType.rideIndex;
		currentCar.vehicleObject = 0;

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
		const currentCar = this.getSelectedCar();

		log(`(editor) Set vehicle variant index to: ${variantIndex}.`);
		currentCar.vehicleObject = variantIndex;
	}


	/**
	 * Sets the maximum number of seats for this vehicle.
	 * @param numberOfSeats The amount of seats on this vehicle.
	 */
	setVehicleSeatCount(numberOfSeats: number)
	{
		const currentCar = this.getSelectedCar();

		log(`(editor) Set vehicle max seat count to: ${numberOfSeats}.`);
		currentCar.numSeats = numberOfSeats;
	}


	/**
	 * Sets the powered acceleration for this vehicle.
	 * @param power The amount of powered acceleration for this vehicle.
	 */
	setVehiclePoweredAcceleration(power: number)
	{
		const currentCar = this.getSelectedCar();

		log(`(editor) Set vehicle powered acceleration to: ${power}.`);
		currentCar.mass = power;
	}


	/**
	 * Sets the powered maximum speed for this vehicle.
	 * @param maximumSpeed The powered maximum speed for this vehicle.
	 */
	setVehiclePoweredMaximumSpeed(maximumSpeed: number)
	{
		const currentCar = this.getSelectedCar();

		log(`(editor) Set vehicle powered acceleration to: ${maximumSpeed}.`);
		currentCar.poweredMaxSpeed = maximumSpeed;
	}


	/**
	 * Sets the mass for this vehicle.
	 * @param mass The amount of mass of this vehicle.
	 */
	setVehicleMass(mass: number)
	{
		const currentCar = this.getSelectedCar();

		log(`(editor) Set vehicle mass to: ${mass}.`);
		currentCar.mass = mass;
	}


	/**
	 * Refreshes the vehicle properties related to its type.
	 */
	private refreshProperties(car: Car)
	{
		const currentType = this._rideTypes[this._selectedTypeIndex];
		const isPowered = this.isCarPowered(car);

		// Variant
		const variant = this.window.variantSpinner;
		variant.maximum = currentType.variantCount;
		variant.set(car.vehicleObject);

		// Number of seats
		const seats = this.window.seatCountSpinner;
		seats.set(car.numSeats);

		// Mass
		const mass = this.window.massSpinner;
		mass.set(car.mass);

		// Powered acceleration & maximum speed
		const poweredAcceleration = this.window.powAccelerationSpinner;
		const poweredMaxSpeed = this.window.powMaxSpeedSpinner;
		if (isPowered)
		{
			poweredAcceleration.set(car.poweredAcceleration);
			poweredMaxSpeed.set(car.poweredMaxSpeed);
		}
		else
		{
			poweredAcceleration.active(false);
			poweredMaxSpeed.active(false);
		}

		log(`(editor) Properties refreshed; variant ${variant.value}/${variant.maximum}; seats: ${seats.value}, powered: ${isPowered}, power: ${poweredAcceleration.value}/${poweredMaxSpeed.value}`);
	}


	/**
	 * Gets the selected car, or throws if none is selected.
	 */
	private getSelectedCar(): Car | never
	{
		const vehicle = this._selectedVehicle;

		if (!vehicle)
			throw new Error("(editor) There is no vehicle selected.");

		return vehicle.getCar();
	}


	/**
	 * Returns true if this car does use powered acceleration.
	 * Currently not all vehicle types support this property in
	 * the openrct2 source code.
	 *
	 * @param car The car to check if it is powered.
	 */
	private isCarPowered(car: Car): boolean
	{
		const rideObject = context.getObject("ride", car.rideObject);
		const vehicleObject = rideObject.vehicles[car.vehicleObject];

		// 'VEHICLE_ENTRY_FLAG_POWERED' is required.
		return ((vehicleObject.flags & (1 << 19)) != 0);
	}


	/**
	 * Scroll the main viewport to the currently selected vehicle.
	 */
	private scrollToCar()
	{
		const vehicle = this._selectedVehicle;
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
