import { orderByNameThenByIdentifier } from "../utilities/array";
import * as Log from "../utilities/logger";
import { isNumber } from "../utilities/type";
import { getVisibility, RideVehicleVariant } from "./rideVehicleVariant";


/**
 * Gets all available ride types that are currently loaded.
 */
export function getAllRideTypes(): RideType[]
{
	return objectManager
		.getAllObjects("ride")
		.filter(r => r.carsPerFlatRide !== 0) // tracked rides == 255, flatrides >= 1, shops == 0
		.sort(orderByNameThenByIdentifier)
		.map(r => new RideType(r));
}

/**
 * Gets the ride object from the OpenRCT2 API, or the special secret giga cable lift hill if the id matches.
 */
export function getRideObject(index: number): RideObject
{
	if (index === gigaCableLiftHillTypeId)
	{
		return gigaCableLiftObject;
	}
	return objectManager.getObject("ride", index);
}


/**
 * Represents a ride type currently available to be build.
 */
export class RideType
{
	readonly _id: number;
	private _rideObject?: RideObject | null;
	private _vehicleVariants?: RideVehicleVariant[];


	/**
	 * Creates a new ride type object.
	 */
	constructor(object: RideObject);
	constructor(id: number);
	constructor(param: RideObject | number)
	{
		if (isNumber(param))
		{
			this._id = param;
			this._rideObject = <RideObject | null>getRideObject(this._id) || null;
		}
		else
		{
			this._id = param.index;
			this._rideObject = param;
		}
	}

	/*
	 * Gets the associated ride definition from the game.
	 */
	_object(): RideObject
	{
		Log.assert(!!this._rideObject, "Selected ride object with id", this._id, "is missing.");
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		return this._rideObject!;
	}

	/**
	 * The variants (vehicle sprites) this ride has.
	 */
	_variants(): RideVehicleVariant[]
	{
		if (!this._vehicleVariants)
		{
			// Find last vehicle with non-zero base image.
			const vehicles = this._object().vehicles;

			const length = vehicles.length;
			let validUpperBound = length;
			while (validUpperBound-- > 0 && !getVisibility(vehicles[validUpperBound]))
			{
				// Just decrement the upper bound until a valid vehicle shows up.
			}

			const variants: RideVehicleVariant[] = [];
			for (let idx = 0; idx <= validUpperBound; idx++)
			{
				const variant = new RideVehicleVariant(vehicles[idx]);
				variants.push(variant);
			}
			if (++validUpperBound < length)
			{
				// Put a green square variant at the end if it fits.
				const variant = new RideVehicleVariant(vehicles[validUpperBound]);
				variants.push(variant);
			}

			this._vehicleVariants = variants;
		}
		return this._vehicleVariants;
	}
}

/**
 * Create an entry for the Giga Coaster cable lift.
 */
function gigaCableLiftHillEntry(mass: number, acceleration: number, maxSpeed: number, imageId: number, spriteSize: number): RideObjectVehicle
{
	return <RideObjectVehicle>{
		carMass: mass,
		poweredAcceleration: acceleration,
		poweredMaxSpeed: maxSpeed,
		numSeats: 0,
		flags: 0,
		baseImageId: imageId,
		spriteWidth: spriteSize,
		spriteHeightPositive: spriteSize,
		tabHeight: 0
	};
}

/**
 * The ride object id for the cable lift hill of the Giga Coaster.
 */
export const gigaCableLiftHillTypeId = 65_535;

/**
 * A cached object of the cable lift hill for the Giga Coaster.
 */
const gigaCableLiftObject = <RideObject>{
	index: gigaCableLiftHillTypeId,
	identifier: "rve.giga-lift",
	name: "Giga Coaster Cable Lift Hill",
	vehicles: [
		gigaCableLiftHillEntry(100, 80, 20, 29_110, 10),
		gigaCableLiftHillEntry(0, 0, 0, 0, 0)
	]
};

/**
 * A ride type for the cable lift hill of the Giga Coaster.
 */
export const gigaCableLiftHillType = new RideType(gigaCableLiftObject);
