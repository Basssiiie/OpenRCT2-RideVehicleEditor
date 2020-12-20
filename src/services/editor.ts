import { RideVehicle } from "../helpers/ridesInPark";
import { getAvailableRideTypes, RideType } from "../helpers/rideTypes";
import { isDebugMode, log } from "../helpers/utilityHelpers";
import DebugWindow from "../ui/debugWindow";
import VehicleEditorWindow from "../ui/editorWindow";
import VehicleSelector from "./selector";


/**
 * Service that allows to edit the selected vehicle.
 */
export default class VehicleEditor
{
	private _rideTypes!: RideType[];
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
		this.reloadRideTypes();

		window.rideTypeList.onSelect = (i => this.setRideType(i));
		window.variantSpinner.onChange = (i => this.setVehicleVariant(i));
		window.trackProgressSpinner.onChange = (i => this.setVehicleTrackProgress(i));
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

		selector.onSelect = (v => (v) ? this.setVehicle(v) : this.deselect());
	}


	/**
	 * Reload the list of ride types.
	 */
	reloadRideTypes()
	{
		//const currentType = this._rideTypes[this._selectedTypeIndex].rideIndex;		

		this._rideTypes = getAvailableRideTypes();
		this.window.setRideTypeList(this._rideTypes);
	}


	/**
	 * Deselects the current vehicle.
	 */
	deselect()
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
		const car = this.getSelectedCar();

		if (car)
		{
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
		if (currentCar)
		{
			const rideType = this.getSelectedRideType();

			log(`(editor) Set vehicle ride type to: ${rideType.name} (index: ${rideTypeIndex})`);
			currentCar.rideObject = rideType.rideIndex;
			currentCar.vehicleObject = 0;

			this.setPropertiesToDefaultOfType(currentCar, rideType, 0);
		}
	}


	/**
	 * Sets the vehicle sprite variant. (e.g. locomotive, tender or passenger car)
	 * 
	 * @param variantIndex The index into the vehicle sprite list.
	 */
	setVehicleVariant(variantIndex: number)
	{
		const currentCar = this.getSelectedCar();
		if (currentCar)
		{
			log(`(editor) Set vehicle variant index to: ${variantIndex}.`);
			currentCar.vehicleObject = variantIndex;

			this.setPropertiesToDefaultOfType(currentCar, this.getSelectedRideType(), variantIndex);
		}
	}


	/**
	 * Sets the vehicles progress on the current track element.
	 * 
	 * @param progress The amount of progress in steps.
	 */
	setVehicleTrackProgress(progress: number): void
	{
		const currentCar = this.getSelectedCar();
		if (currentCar)
		{
			log(`(editor) Set vehicle track progress to: ${progress}.`);
			// @ts-expect-error
			currentCar.trackProgress = progress;

			// @ts-expect-error
			const recalculatedProgress = currentCar.trackProgress;
			this.window.trackProgressSpinner.set(recalculatedProgress);
		}
	}


	/**
	 * Sets the maximum number of seats for this vehicle.
	 * @param numberOfSeats The amount of seats on this vehicle.
	 */
	setVehicleSeatCount(numberOfSeats: number)
	{
		const currentCar = this.getSelectedCar();
		if (currentCar)
		{
			log(`(editor) Set vehicle max seat count to: ${numberOfSeats}.`);
			currentCar.numSeats = numberOfSeats;
		}
	}


	/**
	 * Sets the powered acceleration for this vehicle.
	 * @param power The amount of powered acceleration for this vehicle.
	 */
	setVehiclePoweredAcceleration(power: number)
	{
		const currentCar = this.getSelectedCar();
		if (currentCar)
		{
			log(`(editor) Set vehicle powered acceleration to: ${power}.`);
			currentCar.mass = power;
		}
	}


	/**
	 * Sets the powered maximum speed for this vehicle.
	 * @param maximumSpeed The powered maximum speed for this vehicle.
	 */
	setVehiclePoweredMaximumSpeed(maximumSpeed: number)
	{
		const currentCar = this.getSelectedCar();
		if (currentCar)
		{
			log(`(editor) Set vehicle powered acceleration to: ${maximumSpeed}.`);
			currentCar.poweredMaxSpeed = maximumSpeed;
		}
	}


	/**
	 * Sets the mass for this vehicle.
	 * @param mass The amount of mass of this vehicle.
	 */
	setVehicleMass(mass: number)
	{
		const currentCar = this.getSelectedCar();
		if (currentCar)
		{
			log(`(editor) Set vehicle mass to: ${mass}.`);
			currentCar.mass = mass;
		}
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

		// Track progress
		const progress = this.window.trackProgressSpinner;
		// @ts-expect-error
		progress.set(car.trackProgress);

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
	 * Sets the properties of the specified car to the default properties of the
	 * specified ride type.
	 * 
	 * @param car The car to modify the properties of.
	 * @param rideType The ride type.
	 * @param variant The vehicle variant to take the properties from.
	 */
	private setPropertiesToDefaultOfType(car: Car, rideType: RideType, variant: number)
	{
		log("(editor) All car properties have been reset to the default value.")

		// Set all properties according to definition.
		const rideObject = rideType.getDefinition();
		const baseVehicle = rideObject.vehicles[variant];

		car.numSeats = baseVehicle.numSeats;
		car.poweredAcceleration = baseVehicle.poweredAcceleration;
		car.poweredMaxSpeed = baseVehicle.poweredMaxSpeed;

		// Recalculate mass with peeps.
		let newTotalMass = baseVehicle.carMass;
		for (let i = 0; i < car.peeps.length; i++)
		{
			const peepId = car.peeps[i];
			if (peepId != null)
			{
				const peep = map.getEntity(peepId) as Guest;
				if (peep)
				{
					newTotalMass += peep.mass;
				}
			}
		}
		car.mass = newTotalMass;

		// Update properties
		this.refreshProperties(car);
	}


	/**
	 * Gets the selected ride type.
	 */
	private getSelectedRideType(): RideType
	{
		return this._rideTypes[this._selectedTypeIndex];
	}


	/**
	 * Gets the selected car, or throws if none is selected.
	 */
	private getSelectedCar(): Car | null
	{
		const vehicle = this._selectedVehicle;

		if (!vehicle)
			throw new Error("(editor) There is no vehicle selected.");

		const car = vehicle.getCar();
		if (!car)
		{
			log("(editor) Selected vehicle does not exist anymore.");

			this.deselect();
			this.window.disableEditorControls();
			return null;
		}
		return car;
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
		const car = this.getSelectedCar();
		if (car)
		{
			ui.mainViewport.scrollTo({ x: car.x, y: car.y, z: car.z });
		}
	}
}
