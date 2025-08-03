import test from "ava";
import * as ArrayHelper from "../../src/utilities/array";


test("isValidIndex()", t =>
{
	const array = ["one", "two", "three"];

	t.true(ArrayHelper.isValidIndex(array, 0));
	t.true(ArrayHelper.isValidIndex(array, 1));
	t.true(ArrayHelper.isValidIndex(array, 2));

	t.false(ArrayHelper.isValidIndex(array, -1));
	t.false(ArrayHelper.isValidIndex(array, 3));
	t.false(ArrayHelper.isValidIndex(array, 5));
	t.false(ArrayHelper.isValidIndex(array, null));
	t.false(ArrayHelper.isValidIndex(array, undefined!));
	t.false(ArrayHelper.isValidIndex([], 0));
	t.false(ArrayHelper.isValidIndex(null, 0));
	t.false(ArrayHelper.isValidIndex(undefined!, 0));
});


test("getAtIndex()", t =>
{
	const array = ["one", "two", "three"];

	t.is(ArrayHelper.getAtIndex(array, 0), "one");
	t.is(ArrayHelper.getAtIndex(array, 1), "two");
	t.is(ArrayHelper.getAtIndex(array, 2), "three");

	t.is(ArrayHelper.getAtIndex(array, -1), null);
	t.is(ArrayHelper.getAtIndex(array, 3), null);
	t.is(ArrayHelper.getAtIndex(array, 5), null);
	t.is(ArrayHelper.getAtIndex(array, null), null);
	t.is(ArrayHelper.getAtIndex(array, undefined!), null);
	t.is(ArrayHelper.getAtIndex([], 0), null);
	t.is(ArrayHelper.getAtIndex(null, 0), null);
	t.is(ArrayHelper.getAtIndex(undefined!, 0), null);
});


test("findIndex()", t =>
{
	const array = ["one", "two", "three"];

	t.is(ArrayHelper.findIndex(array, i => i.indexOf("o") === 0), 0);
	t.is(ArrayHelper.findIndex(array, i => i.indexOf("tw") === 0), 1);
	t.is(ArrayHelper.findIndex(array, i => i.indexOf("th") === 0), 2);
	t.is(ArrayHelper.findIndex(array, () => true), 0);

	t.is(ArrayHelper.findIndex(array, i => i.indexOf("z") === 0), null);
	t.is(ArrayHelper.findIndex(array, () => false), null);
	t.is(ArrayHelper.findIndex([], () => false), null);
});
