/// <reference path="../../../lib/openrct2.d.ts" />

import test from 'ava';
import Event from '../../../src/ui/framework/components/event';


test("added callback gets invoked once", t =>
{
	t.plan(1);
	const event = new Event<object>();

	event.add(() => t.pass());
	event.invoke();
});


test("invoke arguments pass to callback", t =>
{
	t.plan(2);
	const event = new Event<object>();

	event.add((text: string, value: number) => {
		t.is(text, "hello");
		t.is(value, 246);
	});
	event.invoke(undefined, "hello", 246);
});


test("'this' value in function is invoked source", t =>
{
	t.plan(1);
	const event = new Event<string>();

	event.add(function(this: string) 
	{ 
		t.is(this, "function this");
	});
	event.invoke("function this");
});


test("all listeners get called", t =>
{
	t.plan(3);
	const event = new Event<object>();

	event.add(() => t.pass("first"));
	event.add(() => t.pass("second"));
	event.add(() => t.pass("third"));

	event.invoke();
});


interface ObjectWithEvent
{
	onChange?: (value: number) => void;
}


test("register adds event callback", t =>
{
	t.plan(2);

	const obj: ObjectWithEvent = {};
	Event.register<ObjectWithEvent>(obj, "onChange", (v: number) => t.is(v, 357));

	t.truthy(obj.onChange);
	obj.onChange!(357);
});


test("register includes original callback", t =>
{
	const passes: string[] = [];
	const obj: ObjectWithEvent = {
		onChange: v => 
		{
			t.is(v, 1234);
			passes.push("original");
		}
	};

	Event.register<ObjectWithEvent>(obj, "onChange", (v: number) => 
	{
		t.is(v, 1234);
		passes.push("new");
	});

	obj.onChange!(1234);
	t.true(passes.includes("original"));
	t.true(passes.includes("new"));
	t.is(passes.length, 2);
});


test("multiple registers all merge into one", t =>
{
	const passes: string[] = [];
	const obj: ObjectWithEvent = {
		onChange: v => 
		{
			t.is(v, 432);
			passes.push("original");
		}
	};

	Event.register<ObjectWithEvent>(obj, "onChange", (v: number) => 
	{
		t.is(v, 432);
		passes.push("new 1");
	});
	Event.register<ObjectWithEvent>(obj, "onChange", (v: number) => 
	{
		t.is(v, 432);
		passes.push("new 2");
	});

	obj.onChange!(432);
	t.true(passes.includes("original"));
	t.true(passes.includes("new 1"));
	t.true(passes.includes("new 2"));
	t.is(passes.length, 3);
});