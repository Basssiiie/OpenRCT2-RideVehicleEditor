/**
 * Helpers for arrays and lists.
 */
module ArrayHelper
{
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
	
	
	/**
	 * Gets the item at the index if the index is a valid index for this array.
	 * 
	 * @param array The array to check.
	 * @param index The index to check.
	 */
	export function getAtIndex<T>(array: T[] | null, index: number | null): T | null
	{
		return (array !== null && index !== null && index >= 0 && index < array.length) ? array[index] : null;
	}


	/**
	 * Gets index of the first matching item. Returns -1 if no items match the predicate.
	 * 
	 * @param array The array to check.
	 * @param predicate The function to match the items against.
	 */
	export function findIndex<T>(array: T[], predicate: (item: T) => boolean): number | null
	{
		for (let i = 0; i < array.length; i++)
		{
			if (predicate(array[i]))
			{
				return i;
			}
		}
		return null;
	}
}
export default ArrayHelper