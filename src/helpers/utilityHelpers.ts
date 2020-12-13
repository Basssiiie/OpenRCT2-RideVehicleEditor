/**
 * Returns true if the UI is available, or false if the game is running in headless mode.
 */
export const isUiAvailable = (typeof ui !== 'undefined');


/**
 * Returns true if debug mode is enabled, or false otherwise.
 */
export const isDebugMode = true;


/**
 * Logs a message is debug mode is enabled, or does nothing otherwise.
 *
 * @param message The error message to be logged.
 */
export function log(message: string): void
{
	if (isDebugMode)
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
 * @param maximum The maximum amount of the range (inclusive).
 */
export function wrap(value: number, minimum: number, maximum: number): number
{
	if (value < minimum)
		value = maximum;
	else if (value > maximum)
		value = minimum;
	
	return value;
}



/**
 * Clamps the specified value in a range from 'minimum' to 'maximum'.
 * 
 * @param value The specified value.
 * @param minimum The minimum amount of the range (inclusive).
 * @param maximum The maximum amount of the range (inclusive).
 */
export function clamp(value: number, minimum: number, maximum: number): number
{
	if (value < minimum)
		value = maximum;
	else if (value > maximum)
		value = minimum;

	return value;
}
