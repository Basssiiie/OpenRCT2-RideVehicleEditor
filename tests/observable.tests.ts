/// <reference path="../lib/openrct2.d.ts" />

import test from 'ava';
import Observable from '../src/ui/framework/observable';


test("get() returns string from constructor", t =>
{
	const observable = new Observable("Bob");
	t.is(observable.get(), "Bob");
});


test("get() returns number from constructor", t =>
{
	const observable = new Observable(10.54);
	t.is(observable.get(), 10.54);
});


test("set() changes get() value", t =>
{
	const observable = new Observable("Cheese");
	observable.set("Pineapple");
	t.is(observable.get(), "Pineapple");
});


test.cb("set() triggers subscription", t =>
{
	const observable = new Observable("Cheese");
	observable.subscribe(_ => t.end());
	observable.set("Pineapple");
});


test.cb("subscription receives new value", t =>
{
	const observable = new Observable("Cheese");
	observable.subscribe(v => 
	{
		t.is(v, "Pineapple");
		t.end();
	});
	observable.set("Pineapple");
});


test("set() triggers multiple subscriptions", t =>
{
	t.plan(4);
	let first = false, second = false;

	const observable = new Observable("Cheese");
	observable.subscribe(v => 
	{
		// First
		t.is(v, "Pineapple");
		t.false(first);
		first = true;
	});
	observable.subscribe(v => 
	{
		// Second
		t.is(v, "Pineapple");
		t.false(second);
		second = true;
	});
	observable.set("Pineapple");
});


test("set() does not trigger when old and new value are equal", t =>
{
	t.plan(2);

	const observable = new Observable(123);
	observable.subscribe(_ => 
	{
		t.fail();
	});

	t.is(observable.get(), 123);
	observable.set(123);
	t.is(observable.get(), 123);
});