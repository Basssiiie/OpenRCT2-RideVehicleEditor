import { ParkRide } from "../objects/parkRide";
import { RideTrain } from "../objects/rideTrain";
import { RideVehicle } from "../objects/rideVehicle";
import { hasPermissions, register } from "./actions";
import * as Log from "../utilities/logger";


const execute = register<PasteVehicleSettingsArgs>("rve-paste-car", pasteVehicleSettings);


/**
 * The available copy options.
 */
export const copyOptions =
[
	"All vehicles on this train",
	"Preceding vehicles on this train",
	"Following vehicles on this train",
	"All vehicles on all trains",
	"Preceding vehicles on all trains",
	"Following vehicles on all trains",
	"Same vehicle number on all trains",
] as const;


/**
 * Specifies which properties to copy and which not to copy.
 */
export const enum CopyFilter
{
	TypeAndVariant =      (1 << 0),
	Colours =             (1 << 1),
	TrackProgress =       (1 << 2),
	Spacing =             (1 << 3),
	Seats =               (1 << 4),
	Mass =                (1 << 5),
	PoweredAcceleration = (1 << 6),
	PoweredMaxSpeed =     (1 << 7),
	All = -1
}


/**
 * Gets the targeted vehicles based on the selected copy option, in the following
 * format; [[ car id, amount of following cars ], ...].
 */
export function getTargets(copyOption: number, ride: [ParkRide, number] | null, train: [RideTrain, number] | null, vehicle: [RideVehicle, number] | null):  [number, number | null][]
{
	if (ride && train && vehicle)
	{
		switch(copyOption)
		{
			case 0: // "All vehicles on this train"
			{
				return [[ train[0].carId, null ]];
			}
			case 1: // "Preceding vehicles on this train"
			{
				return [[ train[0].carId, vehicle[1] ]];
			}
			case 2: // "Following vehicles on this train"
			{
				return [[ vehicle[0].id, null ]];
			}
			case 3: // "All vehicles on all trains"
			{
				return getTargetsOnAllTrains(ride, t => [ t.carId, null ]);
			}
			case 4: // "Preceding vehicles on all trains"
			{
				const amountOfVehicles = (vehicle[1] + 1);
				return getTargetsOnAllTrains(ride, t => [ t.carId, amountOfVehicles ]);
			}
			case 5: // "Following vehicles on all trains"
			{
				const index = vehicle[1];
				return getTargetsOnAllTrains(ride, t => [ t.at(index).id, null ]);
			}
			case 6: // "Same vehicle on all trains"
			{
				const index = vehicle[1];
				return getTargetsOnAllTrains(ride, t => [ t.at(index).id, 1 ]);
			}
		}
	}
	Log.assert(true, `getTargets(), selected copy option out of range: ${copyOption}, or vehicle not selected: ${vehicle}`);
	return [];
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


/**
 * Finds the matching targets on all trains of the specified ride.
 */
function getTargetsOnAllTrains(ride: [ParkRide, number], callback: (train: RideTrain) => [number, number | null]): [number, number | null][]
{
	return ride[0].trains().map(callback);
}