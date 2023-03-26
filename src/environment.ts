/// <reference path="environment.d.ts" />

import { isUndefined } from "./utilities/type";


/**
 * Returns the current version of the plugin.
 */
export const pluginVersion = "2.0";


/**
 * Returns the build configuration of the plugin.
 */
export const buildConfiguration: BuildConfiguration = __BUILD_CONFIGURATION__;


/**
 * Returns true if the current build is a production build.
 */
export const isProduction = (buildConfiguration === "production");


/**
 * Returns true if the current build is a production build.
 */
export const isDevelopment = (buildConfiguration === "development");


/**
 * Returns true if the UI is available, or false if the game is running in headless mode.
 */
export const isUiAvailable = (typeof ui !== "undefined");


/**
 * Returns true if the player is in a multiplayer server, or false if it is a singleplayer game.
 */
export function isMultiplayer(): boolean
{
	return (network.mode !== "none");
}