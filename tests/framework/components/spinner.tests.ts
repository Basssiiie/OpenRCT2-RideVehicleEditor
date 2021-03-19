/// <reference path="../../../lib/openrct2.d.ts" />

import test from 'ava';
import Spinner from '../../../src/ui/framework/controls/spinner';


test("template has correct values", t =>
{
	const spinner = new Spinner({
		x: 15, y: 25, width: 50, height: 40
	});

	t.is(spinner.template.type, "spinner");
	t.is(spinner.template.x, 15);
	t.is(spinner.template.y, 25);
	t.is(spinner.template.width, 50);
	t.is(spinner.template.height, 40);
	t.truthy(spinner.template.name);
});