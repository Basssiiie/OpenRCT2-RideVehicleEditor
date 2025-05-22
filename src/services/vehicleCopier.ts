import { ParkRide } from "../objects/parkRide";
import { RideTrain } from "../objects/rideTrain";
import { RideVehicle } from "../objects/rideVehicle";
import * as Log from "../utilities/logger";
import { isUndefined } from "../utilities/type";
import { register } from "./actions";
import { forEachVehicle, VehicleSpan } from "./vehicleSpan";


const execute = register<PasteVehicleSettingsArgs>("rve-paste-car", pasteVehicleSettings);


/**
 * Available copy options as an enum.
 */
export const enum CopyOptions
{
	AllVehiclesOnTrain,
	PrecedingVehiclesOnTrain,
	FollowingVehiclesOnTrain,
	CustomSelectionOfVehiclesOnTrain,
	AllVehiclesOnAllTrains,
	PrecedingVehiclesOnAllTrains,
	FollowingVehiclesOnAllTrains,
	SameVehicleOnAllTrains
}

/**
 * The available copy options.
 */
export const copyOptions = <const>[
	"All vehicles on this train",
	"Preceding vehicles on this train",
	"Following vehicles on this train",
	"Custom selection of vehicles on this train",
	"All vehicles on all trains",
	"Preceding vehicles on all trains",
	"Following vehicles on all trains",
	"Same vehicle number on all trains"
];


/**
 * Specifies which properties to copy and which not to copy.
 */
export const enum CopyFilter
{
	Default =             (0),
	TypeAndVariant =      (1 << 0),
	Colours =             (1 << 1),
	TrackProgress =       (1 << 2),
	Spacing =             (1 << 3),
	Position =            (1 << 4),
	Seats =               (1 << 5),
	Mass =                (1 << 6),
	PoweredAcceleration = (1 << 7),
	PoweredMaxSpeed =     (1 << 8),
	Spin =                (1 << 9),
	All = -1
}


/**
 * Gets the targeted vehicles based on the selected copy option, in the following
 * format; [[ car id, amount of following cars (inclusive) ], ...].
 */
export function getTargets(copyOption: CopyOptions, ride: [ParkRide, number] | null, train: [RideTrain, number] | null, vehicle: [RideVehicle, number] | null, sequence: number, lastVehicle: number):  [number, number | null][]
{
	if (ride && train && vehicle)
	{
		switch (copyOption)
		{
			case CopyOptions.AllVehiclesOnTrain:
			{
				return [[ train[0]._carId, null ]];
			}
			case CopyOptions.PrecedingVehiclesOnTrain:
			{
				return [[ train[0]._carId, vehicle[1] + 1 ]];
			}
			case CopyOptions.FollowingVehiclesOnTrain:
			{
				return [[ vehicle[0]._id, null ]];
			}
			case CopyOptions.CustomSelectionOfVehiclesOnTrain:
			{
				const index = vehicle[1];
				return vehicleSequence(ride, index, lastVehicle, sequence, v => [ v._id, 1 ]);
			}
			case CopyOptions.AllVehiclesOnAllTrains:
			{
				return getTargetsOnAllTrains(ride, t => [ t._carId, null ]);
			}
			case CopyOptions.PrecedingVehiclesOnAllTrains:
			{
				const amountOfVehicles = (vehicle[1] + 1);
				return getTargetsOnAllTrains(ride, t => [ t._carId, amountOfVehicles ]);
			}
			case CopyOptions.FollowingVehiclesOnAllTrains:
			{
				const index = vehicle[1];
				return getTargetsOnAllTrains(ride, t => [ t._at(index)._id, null ]);
			}
			case CopyOptions.SameVehicleOnAllTrains:
			{
				const index = vehicle[1];
				return getTargetsOnAllTrains(ride, t => [ t._at(index)._id, 1 ]);
			}
		}
	}
	Log.assert(true, "getTargets(), selected copy option out of range:", copyOption, ", or vehicle not selected:", vehicle);
	return [];
}


/**
 * Gets information about all the settings of the specified vehicle.
 */
export function getVehicleSettings(source: RideVehicle, filters: CopyFilter): VehicleSettings
{
	const
		car = source._car(),
		isPowered = source._isPowered(),
		settings: VehicleSettings = {};

	// If nothing is set, copy all filters.
	filters ||= CopyFilter.All;

	if (filters & CopyFilter.TypeAndVariant)
	{
		settings.rideTypeId = car.rideObject;
		settings.variant = car.vehicleObject;
		settings.isReversed = car.isReversed;
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
	if (filters & CopyFilter.Spin)
	{
		settings.spin = car.spin;
	}
	return settings;
}


/**
 * Applies the set of vehicle settings to the specified targets.
 */
export function applyToTargets(settings: VehicleSettings, targets: [number, number | null][]): void
{
	execute({ settings, targets });
}


/**
 * A set of settings for a specific vehicle.
 */
export interface VehicleSettings
{
	rideTypeId?: number;
	variant?: number;
	isReversed?: boolean;
	seats?: number;
	mass?: number;
	poweredAcceleration?: number;
	poweredMaxSpeed?: number;
	colours?: number[];
	spin?: number;
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
	targets: VehicleSpan[];
}


/**
 * Applies the specified settings from player `playerId` to the current client.
 */
function pasteVehicleSettings(args: PasteVehicleSettingsArgs): void
{
	forEachVehicle(args.targets, car => applyVehicleSettings(car, args.settings));
}


/**
 * Applies the settings to the car object.
 */
function applyVehicleSettings(car: Car, settings: VehicleSettings): void
{
	function apply<K extends keyof Car>(key: K, value: Car[K] | undefined): void
	{
		if (!isUndefined(value))
		{
			car[key] = value;
		}
	}

	apply("rideObject", settings.rideTypeId);
	apply("vehicleObject", settings.variant);
	apply("isReversed", settings.isReversed);
	apply("numSeats", settings.seats);
	apply("mass", settings.mass);
	apply("poweredAcceleration", settings.poweredAcceleration);
	apply("poweredMaxSpeed", settings.poweredMaxSpeed);
	apply("spin", settings.spin);

	const colours = settings.colours;
	if (colours)
	{
		car.colours = { body: colours[0], trim: colours[1], tertiary: colours[2] };
	}
}


/**
 * Finds the matching targets on all trains of the specified ride.
 */
function getTargetsOnAllTrains(ride: [ParkRide, number], callback: (train: RideTrain) => [number, number | null]): [number, number | null][]
{
	return ride[0]._trains().map(callback);
}

export function vehicleSequence(ride: [ParkRide, number], index: number, lastVehicle: number, sequence: number, callback: (vehicle: RideVehicle) => [number, number | null]): [number, number | null][]
{
	const train = ride[0]._trains()[0];
	const vehicles = train._vehicles();
	let idxArr = vehicles.slice(index, lastVehicle);
	let newArr: RideVehicle[] = [];
	idxArr.forEach((e, i) => {
		if (i % sequence === 0) {
			newArr.push(e);
		}
	});
	return newArr.map(callback);
}