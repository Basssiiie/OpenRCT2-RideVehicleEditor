/// <reference path="../../lib/duktape.d.ts" />
import { isDevelopment } from "../environment";


/**
 * The available levels of logging.
 */
type LogLevel = "debug" | "warning" | "error";


/**
 * Prints a message with the specified logging and plugin identifier.
 */
function print(level: LogLevel, message: string)
{
	console.log(`[RVE/${level}] ${message}`);
}


/**
 * Returns the current call stack as a string.
 */
function stacktrace(): string
{
	if (typeof Duktape === 'undefined')
	{
		return "  (stacktrace unavailable)\r\n";
	}

	let entry: DukStackEntry, result: string = "";

	for (let i = -1; (entry = Duktape.act(i)); i--) 
	{
		result += `  at ${entry.function.name} (line: ${entry.lineNumber})\r\n`;
	}
	return result;
}


/**
 * Exposes a few helper methods to log various messages to the console.
 */
module Log
{
	/**
	 * Prints a debug message if the plugin is run in development mode.
	 */
	export function debug(message: string)
	{
		if (isDevelopment)
		{
			print("debug", message);
		}
	}


	/**
	 * Prints a warning message to the console.
	 */
	export function warning(message: string)
	{
		print("warning", message);
	}


	/**
	 * Prints an error message to the console and an additional stacktrace
	 * if the plugin is run in development mode.
	 */
	export function error(message: string)
	{
		if (isDevelopment)
		{
			message += ("\r\n" + stacktrace());
		}
		print("error", message);
	}
}
export default Log;