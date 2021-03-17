/// <reference path="../../lib/openrct2.d.ts" />

import test from 'ava';
import Observable from '../../src/ui/framework/observable';
import Window from '../../src/ui/framework/window';
import WindowTemplate from '../../src/ui/framework/windowTemplate';
import { mockUI as mockUi } from '../mocks';


test("window has unique id", t =>
{
	global.ui = mockUi();

	const template = new WindowTemplate(
		{ title: "test", width: 100,  height: 50 },
		_ => {}
	);

	const window1 = new Window(template);
	t.truthy(window1.id);
	
	const window2 = new Window(template);
	t.truthy(window2.id);

	t.not(window1.id, window2.id);
});


test("window template parameters are correct", t =>
{
	global.ui = mockUi();

	const template = new WindowTemplate(
		{ title: "test", width: 100,  height: 50 },
		_ => ({})
	);

	const window = new Window(template);
	const description = window.description;

	t.truthy(description);
	t.is(description.title, "test");
	t.is(description.width, 100);
	t.is(description.height, 50);
});


test("window widget parameters are correct", t =>
{
	global.ui = mockUi();

	const template = new WindowTemplate(
		{ title: "test", width: 100,  height: 50 },
		wb => 
		({
			label: wb.label({ x: 10, y: 5, width: 80, height: 30 })
		})
	);

	const window = new Window(template);
	const description = window.description;
	t.is(description.widgets?.length, 1);

	const label = description.widgets![0];
	t.truthy(label.name);
	t.is(label.type, "label");
	t.is(label.x, 10);
	t.is(label.y, 5);
	t.is(label.width, 80);
	t.is(label.height, 30);
});


class TestViewModel
{
	value = new Observable<string>("default")
}


test("bind viewmodel to widget", t =>
{
	let container: any = {};
	global.ui = mockUi(container);

	const template = new WindowTemplate(
		{ title: "test", width: 100,  height: 50 },
		wb => 
		({
			label: wb
				.label({ x: 10, y: 5, width: 80, height: 30 })
				.bind<TestViewModel>({ "value": "text" })
		})
	);

	const viewmodel = new TestViewModel();
	const window = new Window(template, viewmodel);
	window.open();

	const instance: globalThis.Window = container.window;
	const label: LabelWidget = instance.widgets[0] as LabelWidget;

	t.is(label.text, "default");
});