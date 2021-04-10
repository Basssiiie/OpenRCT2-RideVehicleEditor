/**
 * Allows partial mocking of the specified type.
 *
 * @param source A partial of T containing the mocked methods and values.
 * @returns The specified partial as a fully typed T.
 */
export function mock<T>(source?: Partial<T>): T
{
	return source as T;
}