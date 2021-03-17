/// <reference path="../../lib/openrct2.d.ts" />

import test from 'ava';
import WidgetBuilder from '../../src/ui/framework/widgetBuilder';


test("builder creates button", t =>
{
	const builder = new WidgetBuilder();
	const button = builder.button({ x: 10, y: 20, width: 100, height: 100 });

	t.is(button.template.type, "button");
});


test("builder creates checkbox", t =>
{
	const builder = new WidgetBuilder();
	const checkbox = builder.checkbox({ x: 10, y: 20, width: 100, height: 100 });

	t.is(checkbox.template.type, "checkbox");
});


test("builder creates dropdown", t =>
{
	const builder = new WidgetBuilder();
	const dropdown = builder.dropdown({ x: 10, y: 20, width: 100, height: 100 });

	t.is(dropdown.template.type, "dropdown");
});


test("builder creates groupbox", t =>
{
	const builder = new WidgetBuilder();
	const groupbox = builder.groupbox({ x: 10, y: 20, width: 100, height: 100 });

	t.is(groupbox.template.type, "groupbox");
});


test("builder creates label", t =>
{
	const builder = new WidgetBuilder();
	const label = builder.label({ x: 10, y: 20, width: 100, height: 100 });

	t.is(label.template.type, "label");
});


test("builder creates spinner", t =>
{
	const builder = new WidgetBuilder();
	const spinner = builder.spinner({ x: 10, y: 20, width: 100, height: 100 });

	t.is(spinner.template.type, "spinner");
});


test("builder creates viewport", t =>
{
	const builder = new WidgetBuilder();
	const viewport = builder.viewport({ x: 10, y: 20, width: 100, height: 100 });

	t.is(viewport.template.type, "viewport");
});





