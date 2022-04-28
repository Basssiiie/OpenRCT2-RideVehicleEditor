import { RideLifeCycleFlags } from "../objects/rideLifeCycleFlags";
import { hasPermissions, register } from "./actions";
import * as Log from "../utilities/logger";
import { ParkRide } from "../objects/parkRide";


const execute = register<UpdateRideSettingArgs>("rve-update-ride", updateRideSetting);


type RideUpdateKeys = "excitement" | "intensity" | "nausea" | "buildDate" | RideLifeCycleFlags;

const
	excitement = "excitement",
	intensity = "intensity",
	nausea = "nausea",
	buildMonth = "buildDate";


/**
 * Sets the ride's excitement rating.
 */
export function setExcitementRating(ride: ParkRide, amount: number): void
{
	updateValue(ride.id, excitement, amount);
}


/**
 * Sets the ride's intensity rating.
 */
export function setIntensityRating(ride: ParkRide, amount: number): void
{
	updateValue(ride.id, intensity, amount);
}


/**
 * Sets the ride's nausea rating.
 */
export function setNauseaRating(ride: ParkRide, amount: number): void
{
	updateValue(ride.id, nausea, amount);
}


/**
 * Sets whether the current ratings are frozen or not.
 */
export function setFrozenRatings(ride: ParkRide, enabled: boolean): void
{
	updateValue(ride.id, RideLifeCycleFlags.FixedRatings, enabled);
}


/**
 * Sets the month in which the ride was built.
 */
export function setBuildMonth(ride: ParkRide, amount: number): void
{
	updateValue(ride.id, buildMonth, amount);
}


/**
 * Sets whether the ride is a custom design or a prebuilt track design.
 */
export function setCustomDesign(ride: ParkRide, enabled: boolean): void
{
	updateValue(ride.id, RideLifeCycleFlags.NotCustomDesign, !enabled);
}


/**
 * Sets whether the ride can be demolished or not.
 */
export function setIndestructable(ride: ParkRide, enabled: boolean): void
{
	updateValue(ride.id, RideLifeCycleFlags.Indestructable, enabled);
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
function updateRideSetting(args: UpdateRideSettingArgs, playerId: number): void
{
	if (!hasPermissions(playerId, "ride_properties"))
		return;

	const ride = map.getRide(args.id);
	if (!ride)
	{
		Log.debug(`Ride ${args.id} not found.`);
		return;
	}

	const { key, value } = args;
	switch (key) // Restrict key to permitted set.
	{
		case excitement:
		case intensity:
		case nausea:
		case buildMonth:
		{
			(<Ride>ride)[key] = <number>value;
			break;
		}
		case RideLifeCycleFlags.Indestructable:
		case RideLifeCycleFlags.NotCustomDesign:
		case RideLifeCycleFlags.FixedRatings:
		{
			if (value)
			{
				(<Ride>ride).lifecycleFlags |= key;
			}
			else
			{
				(<Ride>ride).lifecycleFlags &= ~key;
			}
			break;
		}
		default:
		{
			Log.debug(`Setting '${key}' not valid. Value: ${value}`);
			break;
		}
	}
}