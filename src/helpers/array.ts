module Array
{
	/**
	 * Checks if the index is a valid index for this array.
	 * 
	 * @param array The array to check.
	 * @param index The index to check.
	 */
	export function isValidIndex(array: any[] | null, index: number | null): boolean
	{
		return (array !== null && index !== null  && index >= 0 && index < array.length);
	}


	/**
	 * Gets the item at the index if the index is a valid index for this array.
	 * 
	 * @param array The array to check.
	 * @param index The index to check.
	 */
	export function getAtIndex<T>(array: T[] | null, index: NonNullable<number> | null): T | null
	{
		return (array !== null && index !== null && index >= 0 && index < array.length) ? array[index] : null;
	}


	/**
	 * Gets index of the first matching item.
	 * 
	 * @param array The array to check.
	 * @param predicate The function to match the items against.
	 */
	export function findIndex<T>(array: T[], predicate: (item: T) => boolean): number
	{
		for (let i = 0; i < array.length; i++)
		{
			if (predicate(array[i]))
			{
				return i;
			}
		}
		return -1;
	}
}
export default Array;