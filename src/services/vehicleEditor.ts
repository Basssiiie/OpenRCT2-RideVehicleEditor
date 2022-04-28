import { Colour } from "openrct2-flexui";
import { RideType } from "../objects/rideType";
import { RideVehicle } from "../objects/rideVehicle";
import * as Log from "../utilities/logger";
import { hasPermissions, register } from "./actions";


const execute = register<UpdateVehicleSettingArgs>("rve-update-car", updateVehicleSetting);

// The distance of a single step for moving the vehicle.
const moveDistanceStep = 9_000;


type VehicleUpdateKeys = "rideObject" | "vehicleObject" | "trackProgress"
	| "numSeats" | "mass" | "poweredAcceleration" | "poweredMaxSpeed"
	| "x" | "y" | "z" | "body" | "trim" | "tertiary";

const
	rideTypeKey = "rideObject",
	variantKey = "vehicleObject",
	trackProgressKey = "trackProgress",
	seatsKey = "numSeats",
	massKey = "mass",
	poweredAccelerationKey = "poweredAcceleration",
	poweredMaxSpeedKey = "poweredMaxSpeed",
	xPosition = "x",
	yPosition = "y",
	zPosition = "z",
	primaryColour = "body",
	secondaryColour = "trim",
	tertiaryColour = "tertiary";


/**
 * Sets the ride type for this vehicle. Resets all other properties
 * to their default values for that type.
 */
export function setRideType(vehicle: RideVehicle, type: RideType): void
{
	updateValue(vehicle.id, rideTypeKey, type.id);
}


/**
 * Moves the vehicle a relative distance along the track.
 */
export function changeTrackProgress(vehicle: RideVehicle, trackProgress: number): void
{
	updateValue(vehicle.id, trackProgressKey, trackProgress * moveDistanceStep);
}


/**
 * Sets the vehicle sprite variant. (e.g. locomotive, tender or passenger car)
 */
export function setVariant(vehicle: RideVehicle, variant: number): void
{
	updateValue(vehicle.id, variantKey, variant);
}


/**
 * Sets the maximum number of seats for this vehicle.
 */
export function setSeatCount(vehicle: RideVehicle, seats: number): void
{
	updateValue(vehicle.id, seatsKey, seats);
}


/**
 * Sets the mass for this vehicle.
 */
export function setMass(vehicle: RideVehicle, mass: number): void
{
	updateValue(vehicle.id, massKey, mass);
}


/**
 * Sets the powered acceleration for this vehicle.
 */
export function setPoweredAcceleration(vehicle: RideVehicle, power: number): void
{
	updateValue(vehicle.id, poweredAccelerationKey, power);
}


/**
 * Sets the powered acceleration for this vehicle.
 */
export function setPoweredMaximumSpeed(vehicle: RideVehicle, maximumSpeed: number): void
{
	updateValue(vehicle.id, poweredMaxSpeedKey, maximumSpeed);
}


/**
 * Sets the primary colour for this vehicle.
 */
export function setPrimaryColour(vehicle: RideVehicle, colour: Colour): void
{
	updateValue(vehicle.id, primaryColour, colour);
}


/**
 * Sets the secondary colour for this vehicle.
 */
export function setSecondaryColour(vehicle: RideVehicle, colour: Colour): void
{
	updateValue(vehicle.id, secondaryColour, colour);
}


/**
 * Sets the tertiary colour for this vehicle.
 */
export function setTertiaryColour(vehicle: RideVehicle, colour: Colour): void
{
	updateValue(vehicle.id, tertiaryColour, colour);
}



/**
 * Arguments for updating a single key in a vehicle object.
 */
interface UpdateVehicleSettingArgs
{
	id: number;
	key: VehicleUpdateKeys;
	value: number;
}


/**
 * Dispatches an update game action to other clients to update the specified key.
 */
function updateValue(vehicleId: number, key: VehicleUpdateKeys, value: number): void
{
	execute({ id: vehicleId, key, value });
}


/**
 * Update one specific setting on the specified vehicle.
 */
function updateVehicleSetting(args: UpdateVehicleSettingArgs, playerId: number): void
{
	if (!hasPermissions(playerId, "ride_properties"))
		return;

	const car = map.getEntity(args.id);
	if (!car || car.type !== "car")
	{
		Log.debug(`Car ${args.id} not found.`);
		return;
	}

	const { key, value } = args;
	switch (key) // Restrict key to permitted set.
	{
		case rideTypeKey:
		case variantKey:
		case seatsKey:
		case massKey:
		case poweredAccelerationKey:
		case poweredMaxSpeedKey:
		case xPosition:
		case yPosition:
		case zPosition:
		{
			(<Car>car)[key] = value;
			break;
		}
		case trackProgressKey:
		{
			(<Car>car).travelBy(value);
			break;
		}
		case primaryColour:
		case secondaryColour:
		case tertiaryColour:
		{
			const colours = (<Car>car).colours;
			colours[key] = value;
			(<Car>car).colours = colours; // reassignment is required for update
			break;
		}
		default:
		{
			Log.debug(`Setting '${key}' not valid. Value: ${value}`);
			break;
		}
	}
}