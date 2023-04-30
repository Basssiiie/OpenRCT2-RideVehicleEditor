import { isMultiplayer } from "../environment";
import { find } from "../utilities/array";
import * as Log from "../utilities/logger";


/**
 * Callback for executing the specific action.
 */
export type Action<T> = (args: T) => void;


const requiredEditPermission: PermissionType = "ride_properties";
const registeredActions: Record<string, Action<never>> = {};


/**
 * Register a new custom action that can be executed and synchronized in multiplayer contexts.
 * @returns A callback to execute the specific action.
 */
export function register<T>(name: string, action: Action<T>): Action<T>
{
	registeredActions[name] = action;
	return (args: T): void =>
	{
		Log.debug("Execute action", name, "with args:", JSON.stringify(args));
		context.executeAction(name, <never>args);
	};
}


/**
 * Register all actions by registering them with the OpenRCT2 context.
 */
export function initActions(): void
{
	for (const action in registeredActions)
	{
		context.registerAction(action,
			(args) => (hasPermissions(args.player) ? {} : getPermissionError()),
			(args) =>
			{
				if (hasPermissions(args.player))
				{
					const params = ("args" in args) ? args.args : args;
					registeredActions[action](<never>params);
					return {};
				}
				return getPermissionError();
			}
		);
	}
}


/**
 * Check if the player has the correct permissions, if in a multiplayer server.
 */
export function hasPermissions(playerId: number): boolean
{
	if (isMultiplayer())
	{
		// Cannot use getPlayer and getGroup, because it uses indices instead of ids and player.group is an id.
		const player = find(network.players, p => p.id === playerId);
		if (!player)
		{
			Log.debug("Cannot apply update from player", playerId, ": player not found.");
			return false;
		}

		const groupId = player.group;
		const group = find(network.groups, g => g.id === groupId);

		if (!group)
		{
			Log.debug("Cannot apply update from player", playerId, ": group id", groupId, "not found.");
			return false;
		}
		if (group.permissions.indexOf(requiredEditPermission) < 0)
		{
			Log.debug("Cannot apply update from player", playerId, ": lacking", requiredEditPermission, "permission.");
			return false;
		}
	}
	return true;
}


/**
 * Returns an objects stating the modification has failed due to missing permissions.
 */
function getPermissionError(): GameActionResult
{
	return {
		error: 2, // GameActions::Status::Disallowed
		errorTitle: "Missing permissions!",
		errorMessage: "Permission 'Ride Properties' is required to use the RideVehicleEditor on this server."
	};
}