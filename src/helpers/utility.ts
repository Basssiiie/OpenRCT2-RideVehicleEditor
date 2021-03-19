import { isDevelopment } from "../environment";

/**
 * Returns true if the UI is available, or false if the game is running in headless mode.
 */
export const isUiAvailable = (typeof ui !== 'undefined');


/**
 * Returns all keys of type T that return type R.
 */
export type KeyOfType<T, R> = { [k in keyof T]: T[k] extends R ? k : never }[keyof T];


 /**
  * Filters out all properties in T that do not return type R.
  */
export type Filter<T, R> = { [k in KeyOfType<Required<T>, R>]: R };


/**
 * Logs a message is debug mode is enabled, or does nothing otherwise.
 *
 * @param message The error message to be logged.
 */
export function log(message: string): void
{
	if (isDevelopment)
	{
		console.log(message);
	}
}


/**
 * Logs an error message with an optional method name for specifying the origin.
 *
 * @param message The error message to be logged.
 * @param method The method specifying where the error occured.
 */
export function error(message: string, method?:string): void
{
	console.log((method)
		? `Error (${method}): ${message}`
		: `Error: ${message}`);
}