import { Colour } from "openrct2-flexui";
import { getRideObject, RideType } from "../objects/rideType";
import * as Log from "../utilities/logger";
import { register } from "./actions";
import { forEachVehicle, VehicleSpan } from "./vehicleSpan";


const execute = register<UpdateVehicleSettingArgs>("rve-update-car", updateVehicleSetting);


type VehicleUpdateKeys
	= "rideObject" | "vehicleObject" | "isReversed" | "trackProgress" | "spacing"
	| "numSeats" | "mass" | "poweredAcceleration" | "poweredMaxSpeed" | "x" | "y" | "z"
	| "spin" | "body" | "trim" | "tertiary";

const
	rideTypeKey = "rideObject",
	variantKey = "vehicleObject",
	reversedKey = "isReversed",
	trackProgressKey = "trackProgress",
	spacingKey = "spacing",
	seatsKey = "numSeats",
	massKey = "mass",
	poweredAccelerationKey = "poweredAcceleration",
	poweredMaxSpeedKey = "poweredMaxSpeed",
	xPosition = "x",
	yPosition = "y",
	zPosition = "z",
	spinKey = "spin",
	primaryColour = "body",
	secondaryColour = "trim",
	tertiaryColour = "tertiary";


/**
 * Sets the ride type for this vehicle. Resets all other properties
 * to their default values for that type.
 */
export function setRideType(vehicles: VehicleSpan[], type: RideType, sequence: number): void
{
	updateValue(vehicles, rideTypeKey, type._id, sequence);
}

/**
 * Sets the vehicle sprite variant. (e.g. locomotive, tender or passenger car)
 */
export function setVariant(vehicles: VehicleSpan[], variant: number, sequence: number): void
{
	updateValue(vehicles, variantKey, variant, sequence);
}

/**
 * Sets whether the vehicle should be reversed on the track or not.
 */
export function setReversed(vehicles: VehicleSpan[], reversed: boolean, sequence: number): void
{
	updateValue(vehicles, reversedKey, <number><unknown>reversed, sequence);
}

/**
 * Moves the vehicle a relative distance along the track.
 */
export function changeTrackProgress(vehicles: VehicleSpan[], trackProgress: number, sequence: number): void
{
	updateValue(vehicles, trackProgressKey, trackProgress, sequence);
}

/**
 * Moves the vehicle a relative distance away from the vehicle before it.
 */
export function changeSpacing(vehicles: VehicleSpan[], trackProgress: number, sequence: number): void
{
	updateValue(vehicles, spacingKey, trackProgress, sequence);
}

/**
 * Sets the maximum number of seats for this vehicle.
 */
export function setSeatCount(vehicles: VehicleSpan[], seats: number, sequence: number): void
{
	updateValue(vehicles, seatsKey, seats, sequence);
}

/**
 * Sets the mass for this vehicle.
 */
export function setMass(vehicles: VehicleSpan[], mass: number, sequence: number): void
{
	updateValue(vehicles, massKey, mass, sequence);
}

/**
 * Sets the powered acceleration for this vehicle.
 */
export function setPoweredAcceleration(vehicles: VehicleSpan[], power: number, sequence: number): void
{
	updateValue(vehicles, poweredAccelerationKey, power, sequence);
}

/**
 * Sets the powered acceleration for this vehicle.
 */
export function setPoweredMaximumSpeed(vehicles: VehicleSpan[], maximumSpeed: number, sequence: number): void
{
	updateValue(vehicles, poweredMaxSpeedKey, maximumSpeed, sequence);
}

/**
 * Sets the primary colour for this vehicle.
 */
export function setPrimaryColour(vehicles: VehicleSpan[], colour: Colour, sequence: number): void
{
	updateValue(vehicles, primaryColour, colour, sequence);
}

/**
 * Sets the secondary colour for this vehicle.
 */
export function setSecondaryColour(vehicles: VehicleSpan[], colour: Colour, sequence: number): void
{
	updateValue(vehicles, secondaryColour, colour, sequence);
}

/**
 * Sets the tertiary colour for this vehicle.
 */
export function setTertiaryColour(vehicles: VehicleSpan[], colour: Colour, sequence: number): void
{
	updateValue(vehicles, tertiaryColour, colour, sequence);
}

/**
 * Sets the x position for this vehicle.
 */
export function setPositionX(vehicles: VehicleSpan[], x: number, sequence: number): void
{
	updateValue(vehicles, xPosition, x, sequence);
}

/**
 * Sets the y position for this vehicle.
 */
export function setPositionY(vehicles: VehicleSpan[], y: number, sequence: number): void
{
	updateValue(vehicles, yPosition, y, sequence);
}

/**
 * Sets the z position for this vehicle.
 */
export function setPositionZ(vehicles: VehicleSpan[], z: number, sequence: number): void
{
	updateValue(vehicles, zPosition, z, sequence);
}

/**
 * Sets the z position for this vehicle.
 */
export function setSpin(vehicles: VehicleSpan[], spin: number, sequence: number): void
{
	updateValue(vehicles, spinKey, spin, sequence);
}


/**
 * Arguments for updating a single key in a vehicle object.
 */
interface UpdateVehicleSettingArgs
{
	targets: VehicleSpan[];
	key: VehicleUpdateKeys;
	value: number;
	sequence: number;
}

/**
 * Dispatches an update game action to other clients to update the specified key.
 */
function updateValue(vehicles: VehicleSpan[], key: VehicleUpdateKeys, value: number, sequence: number): void
{
	execute({ targets: vehicles, key, value, sequence });
}

/**
 * Sets the properties of the specified car to the default properties of the
 * specified ride type.
 */
function setRideTypeDefaults(car: Car, rideObjectIndex: number, variantIndex: number): void
{
	const oldRideObjectId = car.rideObject;
	const oldRideObject = getRideObject(oldRideObjectId);
	const newRideObject = (oldRideObjectId === rideObjectIndex) ? oldRideObject : getRideObject(rideObjectIndex);

	const oldVariant = oldRideObject.vehicles[car.vehicleObject];
	const newVariant = newRideObject.vehicles[variantIndex];

	car.rideObject = rideObjectIndex;
	car.vehicleObject = variantIndex;
	car.numSeats = (newVariant.numSeats & 0x7F); // VEHICLE_SEAT_NUM_MASK
	car.mass = (newVariant.carMass + (car.mass - oldVariant.carMass));
	car.poweredAcceleration = newVariant.poweredAcceleration;
	car.poweredMaxSpeed = newVariant.poweredMaxSpeed;
}

/**
 * Update one specific setting on the specified vehicle.
 */
function updateVehicleSetting(args: UpdateVehicleSettingArgs): void
{
	const { targets, key, value } = args;
	let callback: (car: Car, index: number) => void;
	switch (key) // Restrict key to permitted set.
	{
		case rideTypeKey:
		{
			callback = (car): void =>
			{
				setRideTypeDefaults(car, value, 0);
			};
			break;
		}
		case variantKey:
		{
			callback = (car): void =>
			{
				setRideTypeDefaults(car, car.rideObject, value);
			};
			break;
		}
		case reversedKey:
		case seatsKey:
		case massKey:
		case poweredAccelerationKey:
		case poweredMaxSpeedKey:
		{
			callback = (car): void =>
			{
				car[key] = <never>value;
			};
			break;
		}
		case xPosition:
		case yPosition:
		case zPosition:
		{
			callback = (car): void =>
			{
				car[key] += value;
			};
			break;
		}
		case spinKey:
		{
			callback = (car): void =>
			{
				// Spin does not support negative numbers and must be wrapped
				const result = car[key] + value;
				car[key] = (result < 0) ? (256 + result) : result;
			};
			break;
		}
		case trackProgressKey:
		{
			callback = (car): void =>
			{
				moveCar(car, value);
			};
			break;
		}
		case spacingKey:
		{
			callback = (car, index): void =>
			{
				moveCar(car, value * -(index + 1));
			};
			break;
		}
		case primaryColour:
		case secondaryColour:
		case tertiaryColour:
		{
			callback = (car): void =>
			{
				const colours = car.colours;
				colours[key] = value;
				car.colours = colours; // reassignment is required for update
			};
			break;
		}
		default:
		{
			Log.debug("Setting", key, "not valid. Value:", value);
			return;
		}
	}

	forEachVehicle(targets, args.sequence, callback);
}

/**
 * Moves the car and restores the original velocity and acceleration afterwards,
 * to avoid the vehicle shooting away at high speed when the game is unpaused.
 */
function moveCar(car: Car, distance: number): void
{
	const velocity = car.velocity;
	const acceleration = car.acceleration;

	car.travelBy(distance);

	// Reset velocity and acceleration after traveling.
	car.velocity = velocity;
	car.acceleration = acceleration;
}
