import { isNull } from "./type";

/**
 * Checks if the index is a valid index for this array.
 * @param array The array to check.
 * @param index The index to check.
 */
export function isValidIndex(array: unknown[] | null, index: number | null): boolean
{
	return (array != null && index != null && index >= 0 && index < array.length);
}

/**
 * Gets the item at the index if the index is a valid index for this array.
 * @param array The array to check.
 * @param index The index to check.
 */
export function getAtIndex<T>(array: T[] | null, index: number | null): T | null
{
	return (array != null && index != null && index >= 0 && index < array.length) ? array[index] : null;
}

/**
 * Gets index of the first matching item. Returns -1 if no items match the predicate.
 * @param array The array to check.
 * @param predicate The function to match the items against.
 */
export function findIndex<T>(array: T[], predicate: (item: T) => boolean): number | null
{
	for (let idx = 0, end = array.length; idx < end; idx++)
	{
		if (predicate(array[idx]))
		{
			return idx;
		}
	}
	return null;
}

/**
 * Gets the first matching item. Returns null if no items match the predicate.
 * @param array The array to check.
 * @param predicate The function to match the items against.
 */
export function find<T>(array: T[], predicate: (item: T) => boolean): T | null
{
	const idx = findIndex(array, predicate);
	return (isNull(idx)) ? null : array[idx];
}

/**
 * Gets the first item of the array, or null if it has no items.
 * @param array The array to check.
 */
export function firstOrNull<T>(array: T[]): T | null
{
	return (array.length > 0) ? array[0] : null;
}

/**
 * Sorting function that can order an array by name alphabetically.
 */
export function orderByName(left: { name: string }, right: { name: string }): number
{
	return left.name.localeCompare(right.name);
}

/**
 * Sorting function that can order an array by name alphabetically, followed by order by id if the names are equal.
 */
export function orderByNameThenById(left: { id: number; name: string }, right: { id: number; name: string }): number
{
	return orderByName(left, right) || left.id - right.id;
}

/**
 * Sorting function that can order an array by name alphabetically, followed by order by identifier if the names are equal.
 */
export function orderByNameThenByIdentifier(left: { identifier: string; name: string }, right: { identifier: string; name: string }): number
{
	return orderByName(left, right) || left.identifier.localeCompare(right.identifier);
}
