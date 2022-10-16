import * as Log from "../utilities/logger";


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
	private _variants: number = -1;


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
	 * The amount of different variants (vehicle sprites) this ride has.
	 */
	variants(): number
	{
		if (this._variants === -1)
		{
			// Find last vehicle with non-zero base image.
			const vehicles = this.object().vehicles;
			let idx = vehicles.length;
			while (idx-- > 0)
			{
				if (vehicles[idx].baseImageId > 0)
				{
					break;
				}
			}
			this._variants = (idx + 1);
		}
		return this._variants;
	}
}