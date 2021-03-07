/**
 * Allows access to the duktape object.
 * Reference: https://duktape.org/guide.html#builtin-duktape
 */
declare const Duktape: Duktape;


/**
 * Allows access to the duktape object.
 * Reference: https://duktape.org/guide.html#builtin-duktape
 */
interface Duktape
{
	/**
	 * Returns an entry on the call stack.
	 */
	act(depth: number): DukStackEntry;
}


/**
 * An entry on the call stack.
 * Reference: https://duktape.org/guide.html#builtin-duktape-act
 */
interface DukStackEntry
{
	function: Function;
	lineNumber: number;
	pc: number;
}