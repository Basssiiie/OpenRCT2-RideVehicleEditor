/**
 * Checks whether the target is undefined or not.
 */
export function isUndefined(target: unknown): target is undefined
{
	return (target === undefined);
}

/**
 * Checks whether the target is null or not.
 */
export function isNull(target: unknown): target is null
{
	return (target === null);
}

/**
 * Checks whether the target is a number or not.
 */
export function isNumber(value: unknown): value is number
{
	return (typeof value === "number");
}
