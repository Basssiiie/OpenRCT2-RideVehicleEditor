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
 */
export function log(message: string): void {
    if (isDebugMode) {
        console.log(message);
	}
}


/**
 * Wraps the specified value in a range from 0 to 'maximum'.
 * 
 * @param value the specified value.
 * @param maximum the maximum amount of the range.
 */
export function wrap(value: number, maximum: number): number {
    return (value < 0)
        ? (maximum - 1)
        : (value % maximum);
}

