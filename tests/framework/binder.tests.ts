/// <reference path="../../lib/openrct2.d.ts" />

import test from 'ava';
import Binder, { ToSource, ToTarget, TwoWay } from '../../src/ui/framework/binder';
import BindingContext from '../../src/ui/framework/contexts/bindingContext';
import Observable from '../../src/ui/framework/observable';


function getCheckbox(): CheckboxWidget
{
	return {
		type: "checkbox",
		x: 1, y: 1, width: 80, height: 20,
		text: "Check this",
		isChecked: false,
		onChange: () => {}
	}
}


function getContext<TView>(view: TView): BindingContext<TView>
{
	return {
		setField<TField extends keyof TView>(key: keyof TView, value: TView[TField]): void
		{
			view[key] = value;
		}
	}
}


interface TestViewModel1
{
	text?: Observable<string>,
	value?: Observable<number>,
	toggle?: Observable<boolean>
}



test("Viewmodel updates view 'isChecked'", t =>
{
	const checkbox = getCheckbox();
	const context = getContext(checkbox);
	const viewmodel: TestViewModel1 = 
	{ 
		toggle: new Observable<boolean>(false) 
	};
	
	Binder.apply(context, viewmodel, 
	{
		toggle: "isChecked",
	});

	t.false(checkbox.isChecked);
	viewmodel.toggle!.set(true);
	t.true(checkbox.isChecked);
});


test("Viewmodel updates view 'text'", t =>
{
	const checkbox = getCheckbox();
	const context = getContext(checkbox);
	const viewmodel: TestViewModel1 = 
	{ 
		text: new Observable<string>(checkbox.name!) 
	};
	
	Binder.apply(context, viewmodel, 
	{
		text: "text",
	});

	t.not(checkbox.text, "new name");
	viewmodel.text!.set("new name");
	t.is(checkbox.text, "new name");
});


test("Viewmodel updates view 'width'", t =>
{
	const checkbox = getCheckbox();
	const context = getContext(checkbox);
	const viewmodel: TestViewModel1 = 
	{ 
		value: new Observable<number>(checkbox.width) 
	};
	
	Binder.apply(context, viewmodel, 
	{
		value: "width",
	});

	t.not(checkbox.width, 123_456.789);
	viewmodel.value!.set(123_456.789);
	t.is(checkbox.width, 123_456.789);
});


test("(2-way) Viewmodel updates view 'isChecked'", t =>
{
	const checkbox = getCheckbox();
	const context = getContext(checkbox);
	const viewmodel: TestViewModel1 = 
	{ 
		toggle: new Observable<boolean>(false) 
	};
	
	Binder.apply(context, viewmodel, 
	{
		toggle: { bind: "isChecked", update: "onChange" },
	});

	t.not(checkbox.isChecked, true);
	viewmodel.toggle!.set(true);
	t.is(checkbox.isChecked, true);
});


test("(2-way) View updates viewmodel 'isChecked'", t =>
{
	const checkbox = getCheckbox();
	const context = getContext(checkbox);
	const viewmodel: TestViewModel1 = 
	{ 
		toggle: new Observable<boolean>(false) 
	};
	
	Binder.apply(context, viewmodel, 
	{
		toggle: { bind: "isChecked", update: "onChange" },
	});

	t.not(viewmodel.toggle!.get(), true);
	checkbox.onChange!(true);
	t.is(viewmodel.toggle!.get(), true);
});


interface TestViewModel2
{
	words: Observable<string>,
}


test("Apply all viewmodels", t =>
{
	const checkbox = getCheckbox();
	const context = getContext(checkbox);
	const viewmodel1: TestViewModel1 = 
	{ 
		toggle: new Observable<boolean>(false) 
	};
	const viewmodel2: TestViewModel2 = 
	{ 
		words: new Observable<string>("blub") 
	};
	
	Binder.applyAll(context, [ viewmodel1, viewmodel2 ],
	{
		toggle: "isChecked",
		words: "tooltip"
	});

	t.false(checkbox.isChecked);
	viewmodel1.toggle!.set(true);
	t.true(checkbox.isChecked);
	
	t.not(checkbox.tooltip, "pizza");
	viewmodel2.words!.set("pizza");
	t.is(checkbox.tooltip, "pizza");
});


test("getBindingToTarget: one way to target", t =>
{
	const bind: ToTarget<LabelWidget> = "text";
	const binding = Binder.getBindingToTarget(bind);

	t.is(binding, "text");
});


test("getBindingToTarget: one way to source is null", t =>
{
	const bind: ToSource<LabelWidget> = {
		update: "onChange"
	};
	const binding = Binder.getBindingToTarget(bind);

	t.is(binding, null);
});


test("getBindingToTarget: two way", t =>
{
	const bind: TwoWay<LabelWidget> = {
		bind: "tooltip",
		update: "onChange"
	};
	const binding = Binder.getBindingToTarget(bind);

	t.is(binding, "tooltip");
});


test("getBindingToSource: one way to target is null", t =>
{
	const bind: ToTarget<SpinnerWidget> = "text";
	const binding = Binder.getBindingToSource(bind);

	t.is(binding, null);
});


test("getBindingToSource: one way to source", t =>
{
	const bind: ToSource<SpinnerWidget> = {
		update: "onIncrement"
	};
	const binding = Binder.getBindingToSource(bind);

	t.is(binding, "onIncrement");
});


test("getBindingToSource: two way", t =>
{
	const bind: TwoWay<SpinnerWidget> = {
		bind: "text",
		update: "onDecrement"
	};
	const binding = Binder.getBindingToSource(bind);

	t.is(binding, "onDecrement");
});
