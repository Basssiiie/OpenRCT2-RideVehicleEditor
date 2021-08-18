import test from "ava";
import track from "./trackable";


test("Gets are counted", t =>
{
	const obj = track({
		a: "apricot",
		b: "bob"
	});

	t.is(obj._gets.a, 0);
	t.is(obj._gets.total(), 0);

	t.is(obj.a, "apricot");
	t.is(obj._gets.a, 1);
	t.is(obj._gets.total(), 1);

	t.is(obj.a, "apricot");
	t.is(obj._gets.a, 2);
	t.is(obj._gets.total(), 2);
	t.is(obj._gets.b, 0);

	t.is(obj.b, "bob");
	t.is(obj._gets.b, 1);
	t.is(obj._gets.total(), 3);

	t.is(obj.b, "bob");
	t.is(obj._gets.b, 2);
	t.is(obj._gets.total(), 4);

	t.is(obj._sets.total(), 0); // sets is unaffected
});


test("Sets are counted", t =>
{
	const obj = track({
		a: "abc",
		b: "xyz"
	});

	t.is(obj._sets.a, 0);
	t.is(obj._sets.total(), 0);

	obj.a = "def";
	t.is(obj._sets.a, 1);
	t.is(obj._sets.total(), 1);

	obj.a = "ghi";
	t.is(obj._sets.a, 2);
	t.is(obj._sets.total(), 2);
	t.is(obj._sets.b, 0);

	obj.b = "abc";
	t.is(obj._sets.b, 1);
	t.is(obj._sets.total(), 3);

	obj.b = "def";
	t.is(obj._sets.b, 2);
	t.is(obj._sets.total(), 4);

	t.is(obj._gets.total(), 0); // gets is unaffected
});



test("Array items are counted", t =>
{
	const array = track([
		{ a: "aa" },
		{ a: "bb" },
	]);

	t.is(array._gets.total(), 0);
	t.is(array._sets.total(), 0);

	array[0].a = "cc";
	t.is(array[0]._sets.a, 1);
	t.is(array._sets.total(), 1);

	array[0].a = "dd";
	t.is(array[0]._sets.a, 2);
	t.is(array._sets.total(), 2);
	t.is(array[1]._sets.a, 0);

	array[1].a = "ee";
	t.is(array[1]._sets.a, 1);
	t.is(array._sets.total(), 3);

	t.is(array._gets.total(), 0); // gets is unaffected
});