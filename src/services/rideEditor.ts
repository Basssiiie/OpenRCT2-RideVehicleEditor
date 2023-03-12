import { register } from "./actions";
import * as Log from "../utilities/logger";
import { ParkRide } from "../objects/parkRide";
import { RideLifeCycleFlags } from "../objects/rideLifeCycleFlags";
import { invoke, refreshRide } from "./events";
import { updateDateMonth, updateDateYear } from "../utilities/date";


const execute = register<UpdateRideSettingArgs>("rve-update-ride", updateRideSetting);


type RideUpdateKeys = "excitement" | "intensity" | "nausea" | "buildDate" | RideLifeCycleFlags;

const
	excitement = "excitement",
	intensity = "intensity",
	nausea = "nausea",
	buildDate = "buildDate";


/**
 * Sets the ride's excitement rating.
 */
export function setExcitementRating(ride: ParkRide, amount: number): void
{
	updateValue(ride._id, excitement, amount);
}

/**
 * Sets the ride's intensity rating.
 */
export function setIntensityRating(ride: ParkRide, amount: number): void
{
	updateValue(ride._id, intensity, amount);
}

/**
 * Sets the ride's nausea rating.
 */
export function setNauseaRating(ride: ParkRide, amount: number): void
{
	updateValue(ride._id, nausea, amount);
}

/**
 * Sets whether the current ratings are frozen or not.
 */
export function setFrozenRatings(ride: ParkRide, enabled: boolean): void
{
	updateValue(ride._id, RideLifeCycleFlags.FixedRatings, enabled);
}

/**
 * Sets the month in which the ride was built.
 */
export function setBuildMonth(ride: ParkRide, month: number): void
{
	const newDate = updateDateMonth(ride._ride().buildDate, month);
	updateValue(ride._id, buildDate, newDate);
}

/**
 * Sets the year in which the ride was built.
 */
export function setBuildYear(ride: ParkRide, year: number): void
{
	const newDate = updateDateYear(ride._ride().buildDate, year);
	updateValue(ride._id, buildDate, newDate);
}

/**
 * Sets whether the ride is a custom design or a prebuilt track design.
 */
export function setCustomDesign(ride: ParkRide, enabled: boolean): void
{
	updateValue(ride._id, RideLifeCycleFlags.NotCustomDesign, !enabled);
}

/**
 * Sets whether the ride can be demolished or not.
 */
export function setIndestructable(ride: ParkRide, enabled: boolean): void
{
	updateValue(ride._id, RideLifeCycleFlags.Indestructable, enabled);
}


/**
 * Arguments for updating a single key in a ride object.
 */
interface UpdateRideSettingArgs
{
	id: number;
	key: RideUpdateKeys;
	value: number | boolean;
}


/**
 * Dispatches an update game action to other clients to update the specified key.
 */
function updateValue(rideId: number, key: RideUpdateKeys, value: number | boolean): void
{
	execute({ id: rideId, key, value });
}


/**
 * Update one specific setting on the specified ride.
 */
function updateRideSetting(args: UpdateRideSettingArgs): void
{
	const rideId = args.id;
	const ride = map.getRide(rideId);
	if (!ride)
	{
		Log.debug("Ride", rideId, "not found.");
		return;
	}

	const { key, value } = args;
	switch (key) // Restrict key to permitted set.
	{
		case excitement:
		case intensity:
		case nausea:
		case buildDate:
		{
			ride[key] = <number>value;
			break;
		}
		case RideLifeCycleFlags.Indestructable:
		case RideLifeCycleFlags.NotCustomDesign:
		case RideLifeCycleFlags.FixedRatings:
		{
			if (value)
			{
				ride.lifecycleFlags |= key;
			}
			else
			{
				ride.lifecycleFlags &= ~key;
			}
			break;
		}
		default:
		{
			Log.debug("Setting", key, "not valid. Value:", value);
			break;
		}
	}
	invoke(refreshRide, rideId);
}