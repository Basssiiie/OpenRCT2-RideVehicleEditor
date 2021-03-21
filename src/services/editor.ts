import ArrayHelper from "../helpers/arrayHelper";
import Log from "../helpers/logger";
import { RideVehicle } from "../helpers/ridesInPark";
import { getAvailableRideTypes, RideType } from "../helpers/rideTypes";
import VehicleEditorWindow from "../ui/editorWindow";
import VehicleSelector from "./selector";


// The distance of a single step for moving the vehicle.
const moveDistanceStep = 9_000;


/**
 * A set of settings for a specific vehicle.
 */
export interface VehicleSettings
{
	rideIndex: number;
	variant: number;
	seats: number;
	mass: number;
	poweredAcceleration?: number;
	poweredMaxSpeed?: number;
}


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

		window.rideTypeList.onSelect = (v => this.setRideType(v));
		window.variantSpinner.onChange = (v => this.setVehicleVariant(v));
		window.trackProgressSpinner.onChange = ((_, i) => this.moveVehicleRelativeDistance(i));
		window.seatCountSpinner.onChange = (v => this.setVehicleSeatCount(v));
		window.powAccelerationSpinner.onChange = (v => this.setVehiclePoweredAcceleration(v));
		window.powMaxSpeedSpinner.onChange = (v => this.setVehiclePoweredMaximumSpeed(v));
		window.massSpinner.onChange = (v => this.setVehicleMass(v));
		window.onCopyVehicle = (() => this.getVehicleSettings());
		window.onPasteVehicle = (s => this.applyVehicleSettings(s));
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
		Log.debug(`(editor) Vehicle set, entity id: ${vehicle.entityId}`);

		this._selectedVehicle = vehicle;
		const car = this.getSelectedCar();

		if (car)
		{
			// Viewport
			this.window.viewport.follow(vehicle.entityId);

			// Ride type
			const rideTypeId = car.rideObject;
			const rideTypeIndex = ArrayHelper.findIndex(this._rideTypes, t => t.rideIndex === rideTypeId);
			if (rideTypeIndex !== null)
			{
				this._selectedTypeIndex = rideTypeIndex;
				this.window.rideTypeList.set(this._selectedTypeIndex);
			}

			// Vehicle type properties
			this.refreshProperties(car);
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

			Log.debug(`(editor) Set vehicle ride type to: ${rideType.name} (index: ${rideTypeIndex})`);
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
			Log.debug(`(editor) Set vehicle variant index to: ${variantIndex}.`);
			currentCar.vehicleObject = variantIndex;

			this.setPropertiesToDefaultOfType(currentCar, this.getSelectedRideType(), variantIndex);
		}
	}


	/**
	 * Moves the vehicle a relative distance along the track.
	 * 
	 * @param distance The amount of distance in steps of about 8 to 14k.
	 */
	moveVehicleRelativeDistance(distance: number): void
	{
		const currentCar = this.getSelectedCar();
		if (currentCar)
		{
			Log.debug(`(editor) Move vehicle a distance of: ${distance}.`);
			currentCar.travelBy(distance * moveDistanceStep);

			const recalculatedProgress = currentCar.trackProgress;
			this.window.trackProgressSpinner.set(recalculatedProgress);

			// If the game is paused, the viewport will not update automatically.
			this.window.viewport.refresh();
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
			Log.debug(`(editor) Set vehicle max seat count to: ${numberOfSeats}.`);
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
			Log.debug(`(editor) Set vehicle powered acceleration to: ${power}.`);
			currentCar.poweredAcceleration = power;
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
			Log.debug(`(editor) Set vehicle powered acceleration to: ${maximumSpeed}.`);
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
			Log.debug(`(editor) Set vehicle mass to: ${mass}.`);
			currentCar.mass = mass;
		}
	}

	
	/**
	 * Gets the settings of the currently selected vehicle.
	 */
	getVehicleSettings(): VehicleSettings | null
	{
		const currentCar = this.getSelectedCar();
		if (!currentCar)
		{
			Log.debug(`(editor) No car selected to get settings from.`);
			return null;
		}

		const settings: VehicleSettings = {
			rideIndex: this.getSelectedRideType().rideIndex,
			variant: this.window.variantSpinner.value,
			seats: this.window.seatCountSpinner.value,
			mass:  this.window.massSpinner.value,
		}

		if (this.isCarPowered(currentCar))
		{
			settings.poweredAcceleration = this.window.powAccelerationSpinner.value;
			settings.poweredMaxSpeed = this.window.powMaxSpeedSpinner.value;
		}
		return settings;
	}


	/**
	 * Applies all the specified settings to the currently selected vehicle.
	 */
	applyVehicleSettings(settings: VehicleSettings): void
	{
		const selectedCar = this.getSelectedCar();
		if (selectedCar === null)
		{
			Log.debug(`No car was selected, apply settings has failed.`);
			return;
		}

		const rideType = ArrayHelper.findIndex(this._rideTypes, t => t.rideIndex === settings.rideIndex);
		if (rideType !== null)
		{
			this._selectedTypeIndex = rideType;
			selectedCar.rideObject = this.getSelectedRideType().rideIndex;
			
			this.window.rideTypeList.set(this._selectedTypeIndex);
		}

		selectedCar.vehicleObject = settings.variant;
		selectedCar.numSeats = settings.seats;
		selectedCar.mass = settings.mass;

		if (this.isCarPowered(selectedCar))
		{
			if (settings.poweredAcceleration !== undefined)
			{
				selectedCar.poweredAcceleration = settings.poweredAcceleration;
			}
			if (settings.poweredMaxSpeed !== undefined)
			{
				selectedCar.poweredMaxSpeed = settings.poweredMaxSpeed;
			}
		}
		this.refreshProperties(selectedCar);
	}


	/**
	 * Refreshes the vehicle properties related to its type.
	 */
	private refreshProperties(car: Car)
	{
		const currentType = this.getSelectedRideType();
		const isPowered = this.isCarPowered(car);

		// Variant
		const variant = this.window.variantSpinner;
		variant.maximum = currentType.variantCount;
		variant.set(car.vehicleObject);

		// Track progress
		const progress = this.window.trackProgressSpinner;
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

		Log.debug(`(editor) Properties refreshed; variant ${variant.value}/${variant.maximum}; seats: ${seats.value}, powered: ${isPowered}, power: ${poweredAcceleration.value}/${poweredMaxSpeed.value}`);
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
		Log.debug("(editor) All car properties have been reset to the default value.")

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
			Log.debug("(editor) Selected vehicle does not exist anymore.");

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
