/// <reference path="../../lib/openrct2.d.ts" />

import test from 'ava';
import Control, { ControlParams } from "../../src/ui/control";
import mock_Window from "../mocks/window";


class ControlMock extends Control<ControlParams>
{
	mock_refreshWidget?: (widget: Widget) => void;

	protected refreshWidget(widget: Widget): void
	{
		if (this.mock_refreshWidget)
		{
			this.mock_refreshWidget(widget);
		}
	}
}


test("Widget parameters are set", t =>
{
	const control = new ControlMock({
		x: 10, y: 20, width: 30, height: 40,
		name: "test-name",
		tooltip: "test a tip"
	});
	t.is(control.params.x, 10);
	t.is(control.params.y, 20);
	t.is(control.params.width, 30);
	t.is(control.params.height, 40);
	t.is(control.params.name, "test-name");
	t.is(control.params.tooltip, "test a tip");
});


test.cb("Refresh triggers refresh of widget", t =>
{
	t.plan(1);

	const widget: GroupBoxWidget = {
		x: 10, y: 20, width: 30, height: 40,
		name: "test-widget", type: "groupbox"
	};
	const window = mock_Window({
		widgets: [ widget as Widget ]
	});
	const control = new ControlMock(widget as ControlParams);
	control.bind(window);
	control.mock_refreshWidget = (w): void =>
	{
		t.is(w, widget);
		t.end();
	};

	control.refresh();
});
