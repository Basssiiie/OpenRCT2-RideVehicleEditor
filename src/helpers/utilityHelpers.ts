/**
 * Returns true if the UI is available, or false if the game is running in headless mode.
 */
export const isUiAvailable = (typeof ui !== 'undefined');


/**
 * Returns true if debug mode is enabled, or false otherwise.
 */
export const isDebugMode = false;


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
	console.error((method)
		? `Error (${method}): ${message}`
		: `Error: ${message}`);
}


/**
 * Wraps the specified value in a range from 0 to 'maximum'.
 * 
 * @param value The specified value.
 * @param maximum The maximum amount of the range.
 */
export function wrap(value: number, maximum: number): number
{
	return (value < 0)
		? (maximum - 1)
		: (value % maximum);
}

