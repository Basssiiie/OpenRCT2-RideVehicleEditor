/**
 * Various states of visibility a vehicle can be in.
 */
export const enum VehicleVisibility
{
	GreenSquare,
	Visible,
	Invisible
}

/**
 * Returns true if the variant has a visible sprite, or false if not.
 */
export function getVisibility(variant: RideObjectVehicle): VehicleVisibility
{
	const baseImage = variant.baseImageId;
	if (!baseImage)
	{
		return VehicleVisibility.GreenSquare;
	}
	if (!variant.spriteWidth || !variant.spriteHeightPositive)
	{
		return VehicleVisibility.Invisible;
	}

	return VehicleVisibility.Visible;
}

/**
 * Returns true if the variant is powered, or false if not.
 */
export function isPowered(variant: RideObjectVehicle): boolean
{
	return !!(variant.flags & (1 << 19)); // VEHICLE_ENTRY_FLAG_POWERED
}

/**
 * Small object that holds properties of a vehicle variant.
 */
export class RideVehicleVariant
{
	readonly _visibility: VehicleVisibility;

	constructor(variant: RideObjectVehicle)
	{
		this._visibility = getVisibility(variant);
	}
}
