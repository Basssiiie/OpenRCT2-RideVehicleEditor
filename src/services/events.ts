/**
 * Event list with typed parameters.
 */
export type Event<T = never> = ((params: T) => void)[];


/**
 * Invoke the specified event and all its registered callbacks.
 */
export function invoke(event: Event): void;
export function invoke<T>(event: Event<T>, params: T): void;
export function invoke(event: Event, params?: never): void
{
	for (let i = 0, e = event.length; i < e; i++)
	{
		event[i](<never>params);
	}
}


/**
 * Event to indicate the specified vehicle should be refreshed.
 */
export const refreshVehicle: Event<number> = [];


/**
 * Event to indicate the specified ride should be refreshed.
 */
export const refreshRide: Event<number> = [];
