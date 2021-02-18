import { isDevelopment } from "../environment";

/**
 * Returns true if the UI is available, or false if the game is running in headless mode.
 */
export const isUiAvailable = (typeof ui !== 'undefined');


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


/**
 * Wraps the specified value in a range from 'minimum' to 'maximum'.
 * 
 * @param value The specified value.
 * @param minimum The minimum amount of the range (inclusive).
 * @param maximum The maximum amount of the range (exclusive).
 */
export function wrap(value: number, minimum: number, maximum: number): number
{
	if (value < minimum)
		value = maximum - 1;
	else if (value >= maximum)
		value = minimum;
	
	return value;
}



/**
 * Clamps the specified value in a range from 'minimum' to 'maximum'.
 * 
 * @param value The specified value.
 * @param minimum The minimum amount of the range (inclusive).
 * @param maximum The maximum amount of the range (exclusive).
 */
export function clamp(value: number, minimum: number, maximum: number): number
{
	if (value < minimum)
		value = minimum;
	else if (value >= maximum)
		value = maximum - 1;

	return value;
}


/**
 * Checks if the index is a valid index for this array.
 * 
 * @param array The array to check.
 * @param index The index to check.
 */
export function isValidIndex(array: any[] | null, index: number): boolean
{
	return (array !== null && index >= 0 && index < array.length)
}
