/**
 * Flags used in game actions.
 */
export const enum GameActionFlags
{
	Apply = (1 << 0),
	Replay = (1 << 1),
	Flag2 = (1 << 2),
	AllowDuringPaused = (1 << 3),
	Flag4 = (1 << 4),
	NoSpend = (1 << 5),
	Ghost = (1 << 6),
	TrackDesign = (1 << 7),
	Network = (1 << 31)
}


/**
 * All life cycle flags used by the plugin.
 */
export const enum RideLifeCycleFlags
{
	Indestructable = (1 << 14),  // RIDE_LIFECYCLE_INDESTRUCTIBLE
	NotCustomDesign = (1 << 18), // RIDE_LIFECYCLE_NOT_CUSTOM_DESIGN
	FixedRatings = (1 << 20),    // RIDE_LIFECYCLE_FIXED_RATINGS
}
