import * as Log from "../utilities/logger";


/**
 * Callback for executing the specific action.
 */
export type Action<T> = (args: T, player: number) => void;


/**
 * Callback to invoke the specific action.
 */
 export type ExecuteAction<T> = (args: T) => void;


const noop = (): GameActionResult => ({});
const registeredActions: Record<string, Action<never>> = {};


/**
 * Register a new custom action that can be executed and synchronized in multiplayer contexts.
 * @returns A callback to execute the specific action.
 */
export function register<T>(name: string, action: Action<T>): ExecuteAction<T>
{
	registeredActions[name] = action;
	return (args: T): void => context.executeAction(name, <never>args, noop);
}


/**
 * Register all actions by registering them with the OpenRCT2 context.
 */
export function initActions(): void
{
	for (const action in registeredActions)
	{
		context.registerAction(action, noop, noop);
	}

	context.subscribe("action.execute", (event: GameActionEventArgs) =>
	{
		const { type, action, args, player } = event;

		if (type === 80 && action in registeredActions)
		{
			registeredActions[action](<never>args, player);
		}
	});
}


/**
 * Check if the player has the correct permissions, if in a multiplayer server.
 */
export function hasPermissions(playerId: number, permission: PermissionType): boolean
{
	if (network.mode !== "none")
	{
		const player = network.getPlayer(playerId);
		const group = network.getGroup(player.group);
		if (group.permissions.indexOf(permission) < 0)
		{
			Log.debug(`Cannot apply update from player ${playerId}: lacking 'ride_properties' permission.`);
			return false;
		}
	}
	return true;
}