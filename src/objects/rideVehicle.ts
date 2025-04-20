import { CAR_ENTRY_FLAG_SPINNING } from "../utilities/game";
import * as Log from "../utilities/logger";
import { isNumber } from "../utilities/type";
import { getRideObject } from "./rideType";
import { isPowered } from "./rideVehicleVariant";


/**
 * Returns a car entity by id, or null if the entity was not found or not a car.
 */
export function getCarById(id: number): Car | null
{
	const entity = <Entity | null>map.getEntity(id);
	return (entity && isCar(entity)) ? entity : null;
}

/**
 * Returns true if the entity is a car, or false if not.
 */
export function isCar(entity: Entity): entity is Car
{
	return (entity.type === "car");
}

/**
 * A single vehicle on a train currently in the park.
 */
export class RideVehicle
{
	readonly _id: number;
	private _entity?: Car | null;
	private _vehicleObject?: RideObjectVehicle | null;
	private _typeHash?: number;

	/**
	 * Creates a new ride vehicle to wrap a car.
	 */
	constructor(car: Car);
	constructor(id: number);
	constructor(param: Car | number)
	{
		if (isNumber(param))
		{
			this._id = param;
			this._refresh();
		}
		else
		{
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			this._id = param.id!;
			this._entity = param;
		}
		Log.assert(isNumber(this._id), "Ride vehicle entity is invalid.");
	}

	/**
	 * Refreshes the referenced entity for this vehicle, in case it got respawned.
	 */
	_refresh(): boolean
	{
		const car = getCarById(this._id);
		if (car)
		{
			this._entity = car;
			return true;
		}

		Log.debug("Ride vehicle refresh(): selected car with id", this._id, "went missing.");
		this._entity = null;
		return false;
	}

	/**
	 * Gets the associated vehicle data from the game.
	 */
	_car(): Car
	{
		Log.assert(!!this._entity, "Selected car with id", this._id, "is missing.");
		Log.assert(this._entity?.type === "car", "Selected car with id", this._id, "is not of type 'car', but of type", this._entity?.type);
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		return this._entity!;
	}

	/**
	 * Returns the object definition for this car.
	 */
	_type(): RideObjectVehicle | null
	{
		const entity = this._car();
		const rideObj = entity.rideObject;
		const vehicleObj = entity.vehicleObject;
		const hash = ((rideObj << 2) | vehicleObj); // ensure ride type and vehicle are unchanged

		if (!this._vehicleObject || hash !== this._typeHash)
		{
			const rideObject = <RideObject | null>getRideObject(rideObj);
			if (!rideObject)
			{
				return null;
			}
			this._vehicleObject = rideObject.vehicles[vehicleObj];
			this._typeHash = hash;
		}
		return this._vehicleObject;
	}

	/**
	 * Returns true if this car does use powered acceleration.
	 * Currently not all vehicle types support this property in
	 * the openrct2 source code.
	 */
	_isPowered(): boolean
	{
		const type = this._type();
		return !type || isPowered(type);
	}

	/**
	 * Returns the mask for getting spin frames if this car is considered a "spinning" ride type.
	 */
	_getSpinFrames(): number
	{
		const type = this._type();
		// todo: OpenRCT2 only supports/reports 32 at the moment.
		return !!type && ((type.flags & CAR_ENTRY_FLAG_SPINNING) !== 0) ? 32 : 0;
	}
}
