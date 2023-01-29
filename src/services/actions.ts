import { isMultiplayer } from "../environment";
import { find } from "../utilities/arrayHelper";
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
	return (args: T): void => context.executeAction(name, <never>args);
}


/**
 * Register all actions by registering them with the OpenRCT2 context.
 */
export function initActions(): void
{
	for (const action in registeredActions)
	{
		context.registerAction(action, queryPermissionCheck, (args) =>
		{
			const params = ("args" in args) ? args.args : args;
			registeredActions[action](<never>params);
			return {};
		});
	}
}


/**
 * Callback for registered actions to check permissions.
 */
function queryPermissionCheck(args: GameActionEventArgs<unknown>): GameActionResult
{
	if (hasPermissions(args.player, requiredEditPermission))
	{
		return {};
	}

	return {
		error: 2, // GameActions::Status::Disallowed
		errorTitle: "Missing permissions!",
		errorMessage: "Permission 'Ride Properties' is required to use the RideVehicleEditor on this server."
	};
}


/**
 * Check if the player has the correct permissions, if in a multiplayer server.
 */
function hasPermissions(playerId: number, permission: PermissionType): boolean
{
	if (isMultiplayer())
	{
		const player = network.getPlayer(playerId);
		const groupId = player.group;
		// Cannot use getGroup, because it uses indices instead of ids and player.group is an id.
		const group = find(network.groups, g => g.id === groupId);

		if (!group)
		{
			Log.debug("Cannot apply update from player", playerId, ": group id", groupId, "not found.");
			return false;
		}
		if (group.permissions.indexOf(permission) < 0)
		{
			Log.debug("Cannot apply update from player", playerId, ": lacking", permission, "permission.");
			return false;
		}
	}
	return true;
}