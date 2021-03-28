/**
 * Helpers for the user interface.
 */
module UI
{
	/**
	 * Returns true if the UI is available, or false if the game is running in headless mode.
	 */
	export const isAvailable = (typeof ui !== 'undefined');
}
export default UI;