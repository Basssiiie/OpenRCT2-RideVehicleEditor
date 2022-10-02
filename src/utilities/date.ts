const monthNames = [ "Mar.", "Apr.", "May", "Jun.", "Jul.", "Aug.", "Sep.", "Oct." ];


/**
 * Format any amount of months to "[month in year], year [year number]".
 */
export function formatMonthAndYear(months: number): string
{
	const amountOfMonths = monthNames.length;
	const month = (((months % amountOfMonths) + amountOfMonths) % amountOfMonths);
	const year = (Math.floor(months / amountOfMonths) + 1);

	return `${monthNames[month]}, year ${year}`;
}


/**
 * Format any amount of months in the past to "2 months, 3 years ago" and
 * in the future to "In 3 months, 1 year".
 */
export function formatRelativeDate(relativeDate: number): string
{
	const
		amountOfMonths = monthNames.length,
		absolute = Math.abs(relativeDate),
		month = (absolute % amountOfMonths),
		year = Math.floor(absolute / amountOfMonths),
		monthString = combineAndPluralise(month, "month"),
		yearString = combineAndPluralise(year, "year");

	const combined = (monthString && yearString)
		? (`${yearString}, ${monthString}`)
		: (monthString || yearString || "This month");

	if ((relativeDate < 0))
	{
		return `${combined} ago`;
	}
	else if (relativeDate > 0)
	{
		return `In ${combined}`;
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
		let combination = `${amount} ${noun}`;
		if (amount > 1)
		{
			combination += "s";
		}
		return combination;
	}
	return null;
}
