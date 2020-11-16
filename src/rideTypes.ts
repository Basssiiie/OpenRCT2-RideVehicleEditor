/**
 * Gets all available ride types that are currently loaded.
 */
export function getAvailableRideTypes(): RideType[] {
    return context
        .getAllObjects("ride")
        .map(r => new RideType(
            r.index,
            r.name,
            r.vehicles
                .filter(v => v.baseImageId != 0)
                .length
        ))
        .sort((a, b) => a.name.localeCompare(b.name));
}


/**
 * Represents a ride type currently available to be build.
 */
export class RideType {
    /**
     * @param rideIndex The index of the loaded ride definition object.
     * @param name The name of the ride type.
     * @param variantCount The amount of different variants (vehicle sprites) this ride has.
     */
    constructor(
        readonly rideIndex: number,
        readonly name: string,
        readonly variantCount: number
    ) {}


    /*
     * Gets the associated ride defintion from the game.
     */
    getDefinition() {
        return context.getObject("ride", this.rideIndex);
    }
}
