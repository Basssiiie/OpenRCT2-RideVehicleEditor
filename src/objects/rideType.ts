/**
 * Represents a ride type currently available to be build.
 */
export default class RideType
{
	/**
	 * @param id The index of the loaded ride definition object.
	 * @param name The name of the ride type.
	 * @param variantCount The amount of different variants (vehicle sprites) this ride has.
	 */
	constructor(
		readonly id: number,
		readonly name: string,
		readonly variantCount: number
	) { }


	/*
	 * Gets the associated ride defintion from the game.
	 */
	getDefinition(): RideObject
	{
		return context.getObject("ride", this.id);
	}


	/**
	 * Gets all available ride types that are currently loaded.
	 */
	static getAvailableTypes(): RideType[]
	{
		return context
			.getAllObjects("ride")
			.filter(r => r.carsPerFlatRide !== 0) // tracked rides == 255, flatrides >= 1, shops == 0
			.map(r => new RideType(
				r.index,
				r.name,
				r.vehicles
					.filter(v => v.baseImageId > 0)
					.length
			))
			.sort((a, b) => a.name.localeCompare(b.name));
	}
}
