import { abs, floor } from "./math";
import * as Log from "../utilities/logger";


/**
 * The names of all the months in the game.
 */
export const monthNames = [ "March", "April", "May", "June", "July", "August", "September", "October" ];

/**
 * The amount of months in the game.
 */
const monthCount = 8;


/**
 * Get the month part from the date.
 * @param date Total amount of months since March year 1.
 * @returns The index of the month from 0 to 7 inclusive.
 */
export function getDateMonth(date: number): number
{
	return (((date % monthCount) + monthCount) % monthCount);
}

/**
 * Get the year part of the date.
 * @param date Total amount of months since March year 1.
 * @returns The number of the year.
 */
export function getDateYear(date: number): number
{
	return floor(date / monthCount) + 1;
}

/**
 * Updates the date number to be in the specified month without changing the year.
 * @param date Total amount of months since March year 1.
 * @param month The index of the month from 0 to 7 inclusive.
 */
export function updateDateMonth(date: number, month: number): number
{
	const year = (getDateYear(date) - 1);
	Log.debug("UPDATE MONRTH -> date", date, ", year", year, ", month", month, "=", ((year * monthCount) + month));
	return ((year * monthCount) + month);
}

/**
 * Updates the date number to be in the specified year without changing the month.
 * @param date Total amount of months since March year 1.
 * @param year The number of the year.
 */
export function updateDateYear(date: number, year: number): number
{
	const month = getDateMonth(date);
	Log.debug("UPDATE YEAR -> date", date, ", year", year, ", month", month, "=", month + ((year - 1) * monthCount));
	return month + ((year - 1) * monthCount);
}

/**
 * Format any amount of months in the past to "2 months, 3 years ago" and
 * in the future to "In 3 months, 1 year".
 */
export function formatRelativeDate(relativeDate: number): string
{
	const
		absolute = abs(relativeDate),
		month = getDateMonth(absolute),
		year = (getDateYear(absolute) - 1),
		monthString = combineAndPluralise(month, "month"),
		yearString = combineAndPluralise(year, "year");

	const combined = (monthString && yearString)
		? (yearString + ", " + monthString)
		: (monthString || yearString || "This month");

	if ((relativeDate < 0))
	{
		return (combined + " ago");
	}
	else if (relativeDate > 0)
	{
		return ("In " + combined);
	}
	else
	{
		return combined;
	}
}


/**
 * Combines the amount of items with the noun, and postfixes a 's' if there's more than one item.
 */
function combineAndPluralise(amount: number, noun: string): string | null
{
	if (amount > 0)
	{
		let combination = (amount + " " + noun);
		if (amount > 1)
		{
			combination += "s";
		}
		return combination;
	}
	return null;
}
