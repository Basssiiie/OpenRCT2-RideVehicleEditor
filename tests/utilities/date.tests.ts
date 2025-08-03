import test from "ava";
import { updateDateMonth, updateDateYear } from "../../src/utilities/date";


test("updateDateMonth()", t =>
{
	// (yearInMonths + monthInYear), newMonth, expectedMonths
	t.is(updateDateMonth(4, 5), 5);            // 1y; 4m -> 5m
	t.is(updateDateMonth(4, 3), 3);            // 1y; 4m -> 3m
	t.is(updateDateMonth(2, 2), 2);            // 1y; 2m -> 2m
	t.is(updateDateMonth(8 + 0, 0), 8 + 0);    // 2y; 0m -> 0m
	t.is(updateDateMonth(8 + 2, 6), 8 + 6);    // 2y; 2m -> 6m
	t.is(updateDateMonth(24 + 0, 0), 24);      // 4y; 0m -> 0m
	t.is(updateDateMonth(24 + 0, 1), 25);      // 4y; 0m -> 1m
	t.is(updateDateMonth(16 + 7, 0), 16);      // 3y; 7m -> 0m
	t.is(updateDateMonth(0, 0), 0);            // 1y; 0m -> 0m
	t.is(updateDateMonth(0, 7), 7);            // 1y; 0m -> 7m

	// -(yearInMonths - monthInYear), newMonth, expectedMonths
	t.is(updateDateMonth(-(8 - 0), 0), -8);    // 0y; 0m -> 0m
	t.is(updateDateMonth(-(8 - 7), 0), -8);    // 0y; 7m -> 0m
	t.is(updateDateMonth(-(8 - 7), 7), -1);    // 0y; 7m -> 7m
	t.is(updateDateMonth(-(16 - 0), 0), -16);  // 1y; 0m -> 0m
	t.is(updateDateMonth(-(16 - 7), 7), -9);   // 1y; 7m -> 7m
	t.is(updateDateMonth(-(16 - 0), 7), -9);   // 1y; 0m -> 7m
	t.is(updateDateMonth(-(16 - 7), 0), -16);  // 1y; 7m -> 0m
	t.is(updateDateMonth(-(24 - 0), 0), -24);  // 2y; 0m -> 0m
	t.is(updateDateMonth(-(24 - 0), 7), -17);  // 2y; 0m -> 7m
	t.is(updateDateMonth(-(24 - 7), 0), -24);  // 2y; 7m -> 0m
});

test("updateDateYear()", t =>
{
	// (yearInMonths + monthInYear), newYear, expectedMonths
	t.is(updateDateYear(0, 1), 0);             // 1y -> 1y; 0m
	t.is(updateDateYear(0, 3), 16);            // 1y -> 3y; 0m
	t.is(updateDateYear(0, 0), -8);            // 1y -> 0y; 0m
	t.is(updateDateYear(7, 1), 7);             // 1y -> 1y; 7m
	t.is(updateDateYear(8 + 7, 1), 7);         // 2y -> 1y; 7m
	t.is(updateDateYear(16 + 0, 10), 72 + 0);  // 3y -> 10y; 0m
	t.is(updateDateYear(16 + 7, 10), 72 + 7);  // 3y -> 10y; 7m

	// -(yearInMonths - monthInYear), newYear, expectedMonths
	t.is(updateDateYear(-(8 - 0), 1), 0);        // 0y -> 1y; 0m
	t.is(updateDateYear(-(8 - 7), 1), 7);        // 0y -> 1y; 7m
	t.is(updateDateYear(-(8 - 0), -1), -16);     // 0y -> -1y; 0m
	t.is(updateDateYear(-(8 - 7), -1), -16 + 7); // 0y -> -1y; 7m
});
