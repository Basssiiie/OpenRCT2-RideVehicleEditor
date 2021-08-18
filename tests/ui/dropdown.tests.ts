/// <reference path="../../lib/openrct2.d.ts" />

import test from "ava";
import Mock from "openrct2-mocks";
import DropdownControl from "../../src/ui/dropdown";


test("Widget parameters are set", t =>
{
	const dropdown = new DropdownControl({
		x: 1, y: 2, width: 3, height: 4,
		name: "drop the name",
		tooltip: "tipper"
	});
	t.is(dropdown.params.x, 1);
	t.is(dropdown.params.y, 2);
	t.is(dropdown.params.width, 3);
	t.is(dropdown.params.height, 4);
	t.is(dropdown.params.name, "drop the name");
	t.is(dropdown.params.tooltip, "tipper");
});


test("Default widget parameters are set", t =>
{
	const dropdown = new DropdownControl({
		name: "test", x: 1, y: 2, width: 3, height: 4
	});
	t.deepEqual(dropdown.params.items, []);
	t.is(dropdown.params.disabledMessage, "Not available");
	t.true(dropdown.params.disableSingleItem);
});


test("Configured widget parameters are not overwritten", t =>
{
	const dropdown = new DropdownControl({
		name: "test", x: 1, y: 2, width: 3, height: 4,
		items: [ "test" ],
		disabledMessage: "test disabled",
		disableSingleItem: false,
	});
	t.deepEqual(dropdown.params.items, [ "test" ]);
	t.is(dropdown.params.disabledMessage, "test disabled");
	t.false(dropdown.params.disableSingleItem);
});


test("Created widget is complete", t =>
{
	const control = new DropdownControl({
		name: "test", x: 1, y: 2, width: 3, height: 4,
		items: [ "one", "two" ]
	});
	const widget = control.createWidget();

	t.is(widget.x, 1);
	t.is(widget.y, 2);
	t.is(widget.width, 3);
	t.is(widget.height, 4);
	t.deepEqual(widget.items, [ "one", "two" ]);
	t.is(widget.type, "dropdown");
	t.is(widget.selectedIndex, 0);
	t.truthy(widget.onChange);
});


test("set() updates selected index", t =>
{
	const control = new DropdownControl({
		name: "test", x: 1, y: 2, width: 3, height: 4,
		items: [ "one", "two", "three" ],
		onSelect: (): void => t.fail("Event should be silenced when using 'set'")
	});
	const widget = control.createWidget();
	const window = Mock.window({
		widgets: [ widget ]
	});
	control.bind(window);

	control.set(2); // select 'three' via control

	t.is(widget.selectedIndex, 2);
});


test.skip("set() does nothing when control inactive", t =>
{
	const control = new DropdownControl({
		name: "test", x: 1, y: 2, width: 3, height: 4,
		items: [ "one", "two", "three" ],
		onSelect: (): void => t.fail("Event should be silenced when using 'set'")
	});
	const widget = control.createWidget();
	const window = Mock.window({
		widgets: [ widget ]
	});
	control.bind(window);

	control.set(2); // select 'three' via control
	control.active(false);
	control.set(1); // select 'two' via control

	t.is(widget.selectedIndex, 2);
});


test("Widget onChange updates control", t =>
{
	t.plan(2);

	const control = new DropdownControl({
		name: "test", x: 1, y: 2, width: 3, height: 4,
		items: [ "one", "two", "three" ],
		onSelect: (idx): void => t.is(idx, 1)
	});
	const widget = control.createWidget();
	const window = Mock.window({
		widgets: [ widget ]
	});
	control.bind(window);

	widget.onChange?.(1); // select 'two' via widget

	t.is(widget.selectedIndex, 0); // control should not update widget
});


test("selectedIndex triggering onChange does not trigger onSelect", t =>
{
	const tokens: string[] = [];
	const control = new DropdownControl({
		name: "test", x: 1, y: 2, width: 3, height: 4,
		items: [ "one", "two", "three" ],
		onSelect: (): void =>
		{
			t.fail("Should not trigger");
		}
	});
	const widget = control.createWidget();
	Object.defineProperty(widget, "selectedIndex", {
		get: function (): number
		{
			tokens.push("get");
			return this.internal_selectedIndex;
		},
		set: function (value: number): void
		{
			tokens.push("set");
			this.internal_selectedIndex = value;
			if (value !== undefined)
			{
				tokens.push("trigger");
				this.onChange?.(value);
			}
		}
	});
	const window = Mock.window({
		widgets: [ widget ]
	});
	control.bind(window);

	control.set(2); // select 'three' via control

	t.is(tokens.filter(k => k === "get").length, 0);
	t.is(tokens.filter(k => k === "set").length, 1);
	t.is(tokens.filter(k => k === "trigger").length, 1);
	t.is(widget.selectedIndex, 2); // control should not update widget
	t.is(tokens.filter(k => k === "get").length, 1);
});