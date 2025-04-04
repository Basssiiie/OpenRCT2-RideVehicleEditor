/**
 * All life cycle flags used by the plugin.
 */
export const enum RideLifeCycleFlags
{
	Indestructable = (1 << 14),  // RIDE_LIFECYCLE_INDESTRUCTIBLE
	NotCustomDesign = (1 << 18), // RIDE_LIFECYCLE_NOT_CUSTOM_DESIGN
	FixedRatings = (1 << 20)     // RIDE_LIFECYCLE_FIXED_RATINGS
}
