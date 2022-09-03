import { Colour } from "openrct2-flexui";
import { RideType } from "../objects/rideType";
import * as Log from "../utilities/logger";
import { hasPermissions, register, requiredEditPermission } from "./actions";
import { getDistanceFromProgress } from "./spacingEditor";
import { forEachVehicle, VehicleSpan } from "./vehicleSpan";


const execute = register<UpdateVehicleSettingArgs>("rve-update-car", updateVehicleSetting);


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
export function setRideType(vehicles: VehicleSpan[], type: RideType): void
{
	updateValue(vehicles, rideTypeKey, type.id);
}


/**
 * Moves the vehicle a relative distance along the track.
 */
export function changeTrackProgress(vehicles: VehicleSpan[], trackProgress: number): void
{
	updateValue(vehicles, trackProgressKey, trackProgress);
}


/**
 * Sets the vehicle sprite variant. (e.g. locomotive, tender or passenger car)
 */
export function setVariant(vehicles: VehicleSpan[], variant: number): void
{
	updateValue(vehicles, variantKey, variant);
}


/**
 * Sets the maximum number of seats for this vehicle.
 */
export function setSeatCount(vehicles: VehicleSpan[], seats: number): void
{
	updateValue(vehicles, seatsKey, seats);
}


/**
 * Sets the mass for this vehicle.
 */
export function setMass(vehicles: VehicleSpan[], mass: number): void
{
	updateValue(vehicles, massKey, mass);
}


/**
 * Sets the powered acceleration for this vehicle.
 */
export function setPoweredAcceleration(vehicles: VehicleSpan[], power: number): void
{
	updateValue(vehicles, poweredAccelerationKey, power);
}


/**
 * Sets the powered acceleration for this vehicle.
 */
export function setPoweredMaximumSpeed(vehicles: VehicleSpan[], maximumSpeed: number): void
{
	updateValue(vehicles, poweredMaxSpeedKey, maximumSpeed);
}


/**
 * Sets the primary colour for this vehicle.
 */
export function setPrimaryColour(vehicles: VehicleSpan[], colour: Colour): void
{
	updateValue(vehicles, primaryColour, colour);
}


/**
 * Sets the secondary colour for this vehicle.
 */
export function setSecondaryColour(vehicles: VehicleSpan[], colour: Colour): void
{
	updateValue(vehicles, secondaryColour, colour);
}


/**
 * Sets the tertiary colour for this vehicle.
 */
export function setTertiaryColour(vehicles: VehicleSpan[], colour: Colour): void
{
	updateValue(vehicles, tertiaryColour, colour);
}


/**
 * Sets the primary colour for this vehicle.
 */
export function setPositionX(vehicles: VehicleSpan[], x: number): void
{
	updateValue(vehicles, xPosition, x);
}


/**
 * Sets the secondary colour for this vehicle.
 */
export function setPositionY(vehicles: VehicleSpan[], y: number): void
{
	updateValue(vehicles, yPosition, y);
}


/**
 * Sets the tertiary colour for this vehicle.
 */
export function setPositionZ(vehicles: VehicleSpan[], z: number): void
{
	updateValue(vehicles, zPosition, z);
}



/**
 * Arguments for updating a single key in a vehicle object.
 */
interface UpdateVehicleSettingArgs
{
	targets: VehicleSpan[];
	key: VehicleUpdateKeys;
	value: number;
}


/**
 * Dispatches an update game action to other clients to update the specified key.
 */
function updateValue(vehicles: VehicleSpan[], key: VehicleUpdateKeys, value: number): void
{
	execute({ targets: vehicles, key, value });
}


/**
 * Update one specific setting on the specified vehicle.
 */
function updateVehicleSetting(args: UpdateVehicleSettingArgs, playerId: number): void
{
	if (!hasPermissions(playerId, requiredEditPermission))
		return;

	const { targets, key, value } = args;
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
			forEachVehicle(targets, car => car[key] = value);
			break;
		}
		case trackProgressKey:
		{
			forEachVehicle(targets, car =>
			{
				const distance = getDistanceFromProgress(car, value);
				car.travelBy(distance);
			});
			break;
		}
		case primaryColour:
		case secondaryColour:
		case tertiaryColour:
		{
			forEachVehicle(targets, car =>
			{
				const colours = car.colours;
				colours[key] = value;
				car.colours = colours; // reassignment is required for update
			});
			break;
		}
		default:
		{
			Log.debug(`Setting '${key}' not valid. Value: ${value}`);
			break;
		}
	}
}