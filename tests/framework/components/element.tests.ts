/// <reference path="../../../lib/openrct2.d.ts" />

import test from 'ava';
import Element from '../../../src/ui/framework/controls/element';
import Observable from '../../../src/ui/framework/observable';


test("template has correct values", t =>
{
	const label = new Element<LabelWidget>({
		type: "label",
		x: 10, y: 20, width: 100, height: 50
	});

	t.is(label.template.type, "label");
	t.is(label.template.x, 10);
	t.is(label.template.y, 20);
	t.is(label.template.width, 100);
	t.is(label.template.height, 50);
});


test("named template keeps assigned name", t =>
{
	const label = new Element<LabelWidget>({
		name: "i have a name",
		type: "label",
		x: 10, y: 20, width: 100, height: 50
	});

	t.is(label.template.name, "i have a name");
});


test("unnamed template gets assigned name", t =>
{
	const label = new Element<LabelWidget>({
		type: "label",
		x: 10, y: 20, width: 100, height: 50
	});

	t.truthy(label.template.name);
});


test("unnamed template gets unique name", t =>
{
	const labelCount = 100;
	const labels: Element<LabelWidget>[] = [];

	for (let i = 0; i < labelCount; i ++)
	{
		labels.push(new Element<LabelWidget>({
			type: "label",
			x: 10, y: 20, width: 100, height: 50
		}));
	}

	t.is(labels.length, labelCount);

	for (let x = 0; x < labelCount; x++)
	{
		for (let y = 0; y < labelCount; y++)
		{
			if (x === y)
			{
				t.is(labels[x].template.name, labels[y].template.name);
			}
			else
			{
				t.not(labels[x].template.name, labels[y].template.name);
			}
		}
	}
});


class TestViewModel1
{
	information = new Observable<string>();
}


test("one way bind to text returns binding", t =>
{
	const label = new Element<LabelWidget>({
		type: "label",
		x: 10, y: 20, width: 100, height: 50
	});

	label.bind<TestViewModel1>({
		"information": "text"
	});

	t.truthy(label.bindings);
	t.is(label.bindings!["information"], "text")
});


class TestViewModel2
{
	data = new Observable<string>();
	value = new Observable<number>();
}


test("multiple binds returns all binding", t =>
{
	const label = new Element<LabelWidget>({
		type: "label",
		x: 10, y: 20, width: 100, height: 50
	});

	label.bind<TestViewModel2>({
		"data": "text",
	});
	
	label.bind<TestViewModel2>({
		"value": { bind: "height", update: "onChange" }
	});

	t.truthy(label.bindings);
	t.is(label.bindings!["data"], "text");
	t.deepEqual(label.bindings!["value"], { bind: "height", update: "onChange" });
});


test("multiple binds of same name return original", t =>
{
	const label = new Element<LabelWidget>({
		type: "label",
		x: 10, y: 20, width: 100, height: 50
	});

	label.bind<TestViewModel2>({
		"data": "name",
	});
	
	label.bind<TestViewModel2>({
		"data": "text",
	});

	t.truthy(label.bindings);
	t.is(label.bindings!["data"], "name");
});