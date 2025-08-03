/// <reference path="../../lib/duktape.d.ts" />
/* istanbul ignore file */

import * as Environment from "../environment";


/**
 * The available levels of logging.
 */
type LogLevel = "debug" | "warning" | "error";


/**
 * Returns true if Duktape is available, or false if not.
 */
const isDuktapeAvailable = (typeof Duktape !== "undefined");


/**
 * Prints a message with the specified logging and plugin identifier.
 */
function print(level: LogLevel, messages: unknown[]): void
{
	const message = messages
		.map(v => (typeof v === "string" ? v : Duktape.enc("jx", v)))
		.join(" ");

	console.log(`\x1b[1;33m<RVE/${level}>\x1b[37m ${message}`);
}


/**
 * Returns the current call stack as a string.
 */
function stacktrace(): string
{
	if (!isDuktapeAvailable)
	{
		return "  (stacktrace unavailable)\r\n";
	}

	const depth = -4; // skips act(), stacktrace() and the calling method.
	let entry: DukStackEntry | undefined;
	let result = "";

	for (let i = depth; (entry = Duktape.act(i)); i--)
	{
		const functionName = entry.function.name;
		const prettyName = functionName
			? (`${functionName}()`)
			: "<anonymous>";

		result += `   -> ${prettyName}: line ${entry.lineNumber}\r\n`;
	}
	return result;
}


/**
 * Enable stack-traces on errors in development mode.
 */
if (Environment.isDevelopment && isDuktapeAvailable)
{
	Duktape.errCreate = function onError(error): Error
	{
		error.message += (`\r\n${stacktrace()}`);
		return error;
	};
}


/**
 * Prints a debug message if the plugin is run in development mode.
 */
export function debug(...messages: unknown[]): void
{
	if (Environment.isDevelopment)
	{
		print("debug", messages);
	}
}


/**
 * Prints a warning message to the console.
 */
export function warning(...messages: unknown[]): void
{
	print("warning", messages);
}


/**
 * Prints an error message to the console and an additional stacktrace
 * if the plugin is run in development mode.
 */
export function error(...messages: unknown[]): void
{
	if (Environment.isDevelopment)
	{
		messages.push(`\r\n${stacktrace()}`);
	}
	print("error", messages);
}


/**
 * Prints an error message to the console and an additional stacktrace
 * if the assert fails and the plugin is run in development mode.
 */
export function assert(condition: boolean, ...messages: unknown[]): void
{
	if (Environment.isDevelopment && !condition)
	{
		throw Error(`Assertion failed! ${messages.join(" ")}`);
	}
	return <never>0;
}
