/* eslint-disable @typescript-eslint/no-unused-vars */
import { RideTrain } from "../objects/rideTrain";
import * as Log from "../utilities/logger";
import { hasPermissions, register } from "./actions";


const execute = register<PasteVehicleSettingsArgs>("rve-paste-car", pasteVehicleSettings);


export function applyToTrain(train: RideTrain): void
{
	//execute();
}


/**
 * Arguments for pasting settings on one or more vehicles. The targets is a list
 * of tuples, where the first tuple value specifies a car id.
 *
 * The second tuple value specifies to how many vehicles the paste should be applied.
 * For example: a `2` applies the paste to the first vehicle, and the first one after.
 * A `null` applies the paste from the first vehicle to the end of the train.
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
	rideTypeId: number;
	variant: number;
	seats: number;
	mass: number;
	poweredAcceleration?: number;
	poweredMaxSpeed?: number;
}


function pasteVehicleSettings(args: PasteVehicleSettingsArgs, playerId: number): void
{
	if (!hasPermissions(playerId, "ride_properties"))
		return;

	Log.debug(args.toString());
}