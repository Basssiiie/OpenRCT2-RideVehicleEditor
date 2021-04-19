import RideType from "../objects/rideType";
import RideVehicle from "../objects/rideVehicle";
import * as ArrayHelper from "../utilities/arrayHelper";
import * as Log from "../utilities/logger";
import * as MathHelper from "../utilities/mathHelper";
import Observable from "../utilities/observable";
import VehicleSelector from "./selector";


// The distance of a single step for moving the vehicle.
const moveDistanceStep = 9_000;


/**
 * A set of settings for a specific vehicle.
 */
export interface VehicleSettings
{
	rideTypeId: number;
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
	readonly rideTypeList = new Observable<RideType[]>();
	readonly rideTypeIndex = new Observable<number>();

	readonly variant = new Observable<number>();
	readonly trackProgress = new Observable<number>();
	readonly seats = new Observable<number>();
	readonly mass = new Observable<number>();
	readonly isPowered = new Observable<boolean>();
	readonly poweredAcceleration = new Observable<number>();
	readonly poweredMaxSpeed = new Observable<number>();


	/**
	 * Gets the selected ride type.
	 */
	get rideType(): RideType
	{
		return this.rideTypeList.get()[this.rideTypeIndex.get()];
	}


	private _selector: VehicleSelector;


	/**
	 * Create a new vehicle editor service that can edit the selected vehicle.
	 * @param selector The service that specifies which vehicle is currently selected.
	 */
	constructor(selector: VehicleSelector)
	{
		this._selector = selector;

		// Update the editor when the selector service selects a new vehicle.
		selector.vehicle.subscribe(v =>
		{
			if (v !== null)
			{
				this.setVehicle(v);
			}
		});
	}


	/**
	 * Sets the ride type for this vehicle. Resets all other properties
	 * to their default values for that type.
	 * @param rideTypeIndex The index of the ride type in the ride type list.
	 */
	setRideType(rideTypeIndex: number): void
	{
		const rideTypes = this.rideTypeList.get();
		const oldVehicleObject = this.getVehicleObject();

		rideTypeIndex = MathHelper.clamp(rideTypeIndex, 0, rideTypes.length);
		this.rideTypeIndex.set(rideTypeIndex);

		const currentCar = this.getSelectedCar();
		if (currentCar)
		{
			Log.debug(`(editor) Set vehicle ride type to: ${this.rideType.name} (index: ${rideTypeIndex})`);
			currentCar.rideObject = this.rideType.id;

			this.setRideTypeDefaults(currentCar, 0, oldVehicleObject.carMass);
		}
		else
		{
			this.variant.set(0);
		}
	}


	/**
	 * Sets the vehicle sprite variant. (e.g. locomotive, tender or passenger car)
	 * @param variantIndex The index into the vehicle sprite list.
	 */
	setVariant(variantIndex: number): void
	{
		const currentCar = this.getSelectedCar();
		if (currentCar)
		{
			Log.debug(`(editor) Set vehicle variant index to: ${variantIndex}.`);
			const vehicleObject = this.getVehicleObject();
			this.setRideTypeDefaults(currentCar, variantIndex, vehicleObject.carMass);
		}
	}


	/**
	 * Moves the vehicle a relative distance along the track.
	 * @param distance The amount of distance in steps of about 8 to 14k.
	 */
	move(distance: number): void
	{
		const currentCar = this.getSelectedCar();
		if (currentCar)
		{
			Log.debug(`(editor) Move vehicle a distance of: ${distance}.`);
			currentCar.travelBy(distance * moveDistanceStep);

			const recalculatedProgress = currentCar.trackProgress;
			this.trackProgress.set(recalculatedProgress);
		}
	}


	/**
	 * Sets the maximum number of seats for this vehicle.
	 * @param numberOfSeats The amount of seats on this vehicle.
	 */
	setSeatCount(numberOfSeats: number): void
	{
		const currentCar = this.getSelectedCar();
		if (currentCar)
		{
			Log.debug(`(editor) Set vehicle max seat count to: ${numberOfSeats}.`);
			currentCar.numSeats = numberOfSeats;
			this.seats.set(numberOfSeats);
		}
	}


	/**
	 * Sets the powered acceleration for this vehicle.
	 * @param power The amount of powered acceleration for this vehicle.
	 */
	setPoweredAcceleration(power: number): void
	{
		const currentCar = this.getSelectedCar();
		if (currentCar)
		{
			Log.debug(`(editor) Set vehicle powered acceleration to: ${power}.`);
			currentCar.poweredAcceleration = power;
			this.poweredAcceleration.set(power);
		}
	}


	/**
	 * Sets the powered maximum speed for this vehicle.
	 * @param maximumSpeed The powered maximum speed for this vehicle.
	 */
	setPoweredMaximumSpeed(maximumSpeed: number): void
	{
		const currentCar = this.getSelectedCar();
		if (currentCar)
		{
			Log.debug(`(editor) Set vehicle powered acceleration to: ${maximumSpeed}.`);
			currentCar.poweredMaxSpeed = maximumSpeed;
			this.poweredMaxSpeed.set(maximumSpeed);
		}
	}


	/**
	 * Sets the mass for this vehicle.
	 * @param mass The amount of mass of this vehicle.
	 */
	setMass(mass: number): void
	{
		const currentCar = this.getSelectedCar();
		if (currentCar)
		{
			Log.debug(`(editor) Set vehicle mass to: ${mass}.`);
			currentCar.mass = mass;
			this.mass.set(mass);
		}
	}


	/**
	 * Scroll the main viewport to the currently selected vehicle.
	 */
	locate(): void
	{
		const car = this.getSelectedCar();
		if (car)
		{
			ui.mainViewport.scrollTo({ x: car.x, y: car.y, z: car.z });
		}
	}


	/**
	 * Gets the settings of the currently selected vehicle.
	 */
	getSettings(): VehicleSettings | null
	{
		const vehicle = this._selector.vehicle.get();
		if (vehicle === null)
		{
			Log.debug(`(editor) No car selected to get settings from.`);
			return null;
		}

		const settings: VehicleSettings = {
			rideTypeId: this.rideType.id,
			variant: this.variant.get(),
			seats: this.seats.get(),
			mass:  this.mass.get(),
		};

		if (vehicle.isPowered())
		{
			settings.poweredAcceleration = this.poweredAcceleration.get();
			settings.poweredMaxSpeed = this.poweredMaxSpeed.get();
		}
		return settings;
	}


	/**
	 * Applies all the specified settings to the currently selected vehicle.
	 * @param settings Object with the specified settings.
	 */
	applySettings(settings: VehicleSettings): void
	{
		const vehicle = this._selector.vehicle.get();
		let car;

		if (vehicle === null || !(car = vehicle.getCar()))
		{
			Log.debug(`(editor) No car was selected, apply settings has failed.`);
			return;
		}

		this.applySettingsToCar(car, settings, true);
	}


	/**
	 * Applies all the specified settings to a range of vehicles on the currently selected train.
	 * @param settings Object with the specified settings.
	 * @param startIndex Index into the vehicle array of where to start applying. (inclusive)
	 * @param endIndex Optional index into the vehicle array of where to stop applying. (exclusive)
	 * If not specified, then it will apply until the end of the train.
	 */
	applySettingsToCurrentTrain(settings: VehicleSettings, startIndex: number, endIndex?: number): void
	{
		const vehicles = this._selector.vehiclesOnTrain.get();
		endIndex ??= vehicles.length;

		for (let i = startIndex; i < endIndex; i++)
		{
			const vehicle = vehicles[i];
			const car = vehicle.getCar();

			if (!car)
			{
				Log.debug(`(editor) Train is missing car for vehicle index ${i}, stopping apply.`);
				return;
			}

			this.applySettingsToCar(car, settings, false);
		}
	}


	/**
	 * Applies all the specified settings to all trains on the selected ride.
	 * @param settings Object with the specified settings.
	 */
	applySettingsToAllTrains(settings: VehicleSettings): void
	{
		const trains = this._selector.trainsOnRide.get();

		for (let i = 0; i < trains.length; i++)
		{
			if (i === this._selector.trainIndex)
			{
				// Fast path for currently selected train.
				this.applySettingsToCurrentTrain(settings, 0);
				continue;
			}

			const train = trains[i];
			const vehicles = train.getVehicles();

			for (const vehicle of vehicles)
			{
				this.applySettingsToCar(vehicle.getCar(), settings, false);
			}
		}
	}


	/**
	 * Internal function that applies all vehicle settings to the specified car.
	 */
	private applySettingsToCar(car: Car, settings: VehicleSettings, updateObservables: boolean): void
	{
		car.vehicleObject = settings.variant;
		car.numSeats = settings.seats;
		car.mass = settings.mass;

		if (updateObservables)
		{
			this.variant.set(settings.variant);
			this.seats.set(settings.seats);
			this.mass.set(settings.mass);


		}

		const rideTypes = this.rideTypeList.get();
		const rideTypeIdx = ArrayHelper.findIndex(rideTypes, t => t.id === settings.rideTypeId);

		if (rideTypeIdx !== null)
		{
			car.rideObject = rideTypes[rideTypeIdx].id;

			if (updateObservables)
			{
				this.rideTypeIndex.set(rideTypeIdx);
			}
		}

		// Only apply if the original vehicle had them set.
		if (settings.poweredAcceleration !== undefined)
		{
			car.poweredAcceleration = settings.poweredAcceleration;
		}
		if (settings.poweredMaxSpeed !== undefined)
		{
			car.poweredMaxSpeed = settings.poweredMaxSpeed;
		}
		if (updateObservables)
		{
			this.poweredAcceleration.set(settings.poweredAcceleration ?? 0);
			this.poweredMaxSpeed.set(settings.poweredMaxSpeed ?? 0);

			const definition = RideVehicle.getDefinition(car);
			this.isPowered.set(RideVehicle.isPowered(definition));
		}
	}


	/**
	 * Sets the vehicle to edit in this editor.
	 * @param vehicle The vehicle to edit.
	 */
	private setVehicle(vehicle: RideVehicle): void
	{
		let rideTypes = this.rideTypeList.get();
		if (!rideTypes)
		{
			rideTypes = RideType.getAvailableTypes();
			this.rideTypeList.set(rideTypes);
		}

		Log.debug(`(editor) Vehicle set, entity id: ${vehicle.entityId}`);

		const car = this.getSelectedCar();
		if (car)
		{
			// Ride type
			const rideTypeId = car.rideObject;
			const rideTypeIndex = ArrayHelper.findIndex(rideTypes, t => t.id === rideTypeId);
			if (rideTypeIndex !== null)
			{
				this.rideTypeIndex.set(rideTypeIndex);
			}

			this.variant.set(car.vehicleObject);
			this.trackProgress.set(car.trackProgress);
			this.seats.set(car.numSeats);
			this.mass.set(car.mass);

			const definition = RideVehicle.getDefinition(car);
			const isPowered = RideVehicle.isPowered(definition);
			this.isPowered.set(isPowered);

			if (isPowered)
			{
				this.poweredAcceleration.set(car.poweredAcceleration);
				this.poweredMaxSpeed.set(car.poweredMaxSpeed);
			}
			else
			{
				this.poweredAcceleration.set(0);
				this.poweredMaxSpeed.set(0);
			}
		}
	}


	/**
	 * Sets the properties of the specified car to the default properties of the
	 * specified ride type.
	 * @param car The car to modify the properties of.
	 * @param variant The vehicle variant to take the properties from.
	 * @param oldMass The mass from the previous variant and ride type.
	 */
	private setRideTypeDefaults(car: Car, variant: number, oldMass: number): void
	{
		Log.debug("(editor) All car properties have been reset to the default value.");

		// Set all properties according to definition.
		const vehicleObj = this.getVehicleObject(variant);

		const seats = (vehicleObj.numSeats & 0x7F); // VEHICLE_SEAT_NUM_MASK
		const powAcceleration = vehicleObj.poweredAcceleration;
		const powMaxSpeed = vehicleObj.poweredMaxSpeed;
		const mass = (vehicleObj.carMass + (car.mass - oldMass));
		car.vehicleObject = variant;
		car.numSeats = seats;
		car.mass = mass;
		car.poweredAcceleration = powAcceleration;
		car.poweredMaxSpeed = powMaxSpeed;
		this.variant.set(variant);
		this.seats.set(seats);
		this.mass.set(mass);
		this.isPowered.set(RideVehicle.isPowered(vehicleObj));
		this.poweredAcceleration.set(powAcceleration);
		this.poweredMaxSpeed.set(powMaxSpeed);
	}


	/**
	 * Gets the selected car, or throws if none is selected.
	 */
	private getSelectedCar(): Car | null
	{
		const vehicle = this._selector.vehicle.get();

		if (!vehicle)
			throw new Error("(editor) There is no vehicle selected.");

		const car = vehicle.getCar();
		if (!car)
		{
			Log.debug("(editor) Selected vehicle does not exist anymore.");
			return null;
		}
		return car;
	}


	/**
	 * Returns the currently picked vehicle object.
	 */
	private getVehicleObject(variant?: number): RideObjectVehicle
	{
		const rideObj = this.rideType.getDefinition();
		return rideObj.vehicles[variant ?? this.variant.get()];
	}
}
