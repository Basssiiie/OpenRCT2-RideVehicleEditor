import { RideVehicle } from "../objects/rideVehicle";
import { hasPermissions, register } from "./actions";


const execute = register<PasteVehicleSettingsArgs>("rve-paste-car", pasteVehicleSettings);


/**
 * Specifies which properties to copy and which not to copy.
 */
export const enum CopyFilter
{
	TypeAndVariant =      (1 << 0),
	Seats =               (1 << 1),
	Mass =                (1 << 2),
	PoweredAcceleration = (1 << 3),
	PoweredMaxSpeed =     (1 << 4),
	Colours =             (1 << 5),
	All = -1
}


/**
 * Copy the source vehicle to the specified targets.
 */
export function applyToTargets(source: RideVehicle, filters: CopyFilter, targets: [number, number | null][]): void
{
	const
		car = source.car(),
		isPowered = source.isPowered(),
		settings: VehicleSettings = {};

	if (filters & CopyFilter.TypeAndVariant)
	{
		settings.rideTypeId = car.rideObject;
		settings.variant = car.vehicleObject;
	}
	if (filters & CopyFilter.Seats)
	{
		settings.seats = car.numSeats;
	}
	if (filters & CopyFilter.Mass)
	{
		settings.mass = car.mass;
	}
	if (isPowered && (filters & CopyFilter.PoweredAcceleration))
	{
		settings.poweredAcceleration = car.poweredAcceleration;
	}
	if (isPowered && (filters & CopyFilter.PoweredMaxSpeed))
	{
		settings.poweredMaxSpeed = car.poweredMaxSpeed;
	}
	if (filters & CopyFilter.Colours)
	{
		const cols = car.colours;
		settings.colours = [ cols.body, cols.trim, cols.tertiary ];
	}

	execute({ settings, targets });
}


/**
 * Arguments for pasting settings on one or more vehicles. The targets is a list of
 * tuples, where the first tuple value specifies a car id. The second tuple value
 * specifies to how many vehicles the paste should be applied.
 *
 * For example: `[33, 2]` applies the paste to the vehicle with id 33, and the first
 * one after. A `null` applies the paste from the first vehicle to the end of the train.
 */
interface PasteVehicleSettingsArgs
{
	settings: VehicleSettings;
	targets: [number, number | null][];
}


/**
 * A set of settings for a specific vehicle.
 */
interface VehicleSettings
{
	rideTypeId?: number;
	variant?: number;
	seats?: number;
	mass?: number;
	poweredAcceleration?: number;
	poweredMaxSpeed?: number;
	colours?: number[];
}


/**
 * Applies the specified settings from player `playerId` to the current client.
 */
function pasteVehicleSettings(args: PasteVehicleSettingsArgs, playerId: number): void
{
	if (!hasPermissions(playerId, "ride_properties"))
		return;

	for (const target of args.targets)
	{
		const maximum = target[1];
		let currentId = target[0];
		let count = 0;

		while (maximum === null || count < maximum)
		{
			const car = <Car>map.getEntity(currentId);
			if (!car || car.type !== "car")
				break;

			applyVehicleSettings(car, args.settings);

			const nextId = car.nextCarOnTrain;
			if (nextId === null)
				break;

			currentId = nextId;
			count++;
		}
	}
}


/**
 * Applies the settings to the car object.
 */
function applyVehicleSettings(car: Car, settings: VehicleSettings): void
{
	function apply<K extends keyof Car>(key: K, value: Car[K] | undefined): void
	{
		if (value !== undefined)
		{
			car[key] = value;
		}
	}

	apply("rideObject", settings.rideTypeId);
	apply("vehicleObject", settings.variant);
	apply("numSeats", settings.seats);
	apply("mass", settings.mass);
	apply("poweredAcceleration", settings.poweredAcceleration);
	apply("poweredMaxSpeed", settings.poweredMaxSpeed);

	const colours = settings.colours;
	if (colours !== undefined)
	{
		car.colours = { body: colours[0], trim: colours[1], tertiary: colours[2] };
	}
}
