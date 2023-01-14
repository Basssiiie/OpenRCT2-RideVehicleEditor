import * as Log from "../utilities/logger";
import { getVisibility, RideVehicleVariant } from "./rideVehicleVariant";


/**
 * Gets all available ride types that are currently loaded.
 */
export function getAllRideTypes(): RideType[]
{
	return context
		.getAllObjects("ride")
		.filter(r => r.carsPerFlatRide !== 0) // tracked rides == 255, flatrides >= 1, shops == 0
		.sort((a, b) => a.name.localeCompare(b.name))
		.map(r => new RideType(r));
}


/**
 * Represents a ride type currently available to be build.
 */
export class RideType
{
	readonly id: number;
	private _object?: RideObject | null;
	private _variants?: RideVehicleVariant[];


	/**
	 * Creates a new ride type object.
	 */
	constructor(object: RideObject);
	constructor(id: number);
	constructor(param: RideObject | number)
	{
		if (typeof param === "number")
		{
			this.id = param;
			this.refresh();
		}
		else
		{
			this.id = param.index;
			this._object = param;
		}
	}


	refresh(): void
	{
		this._object = context.getObject("ride", this.id) || null;
	}


	/*
	 * Gets the associated ride definition from the game.
	 */
	object(): RideObject
	{
		Log.assert(!!this._object, `Selected ride object with id '${this.id}' is missing.`);
		return <RideObject>this._object;
	}


	/**
	 * The variants (vehicle sprites) this ride has.
	 */
	variants(): RideVehicleVariant[]
	{
		if (!this._variants)
		{
			// Find last vehicle with non-zero base image.
			const vehicles = this.object().vehicles;

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

			this._variants = variants;
		}
		return this._variants;
	}
}