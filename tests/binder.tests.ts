/// <reference path="../lib/openrct2.d.ts" />

import test from 'ava';
import Binder from '../src/ui/framework/binder';
import BindingContext from '../src/ui/framework/contexts/bindingContext';
import Observable from '../src/ui/framework/observable';


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


interface TestViewModel
{
	text?: Observable<string>,
	value?: Observable<number>,
	toggle?: Observable<boolean>
}



test("Viewmodel updates view 'isChecked'", t =>
{
	const checkbox = getCheckbox();
	const context = getContext(checkbox);
	const viewmodel: TestViewModel = 
	{ 
		toggle: new Observable<boolean>(false) 
	};
	
	Binder.Apply(context, viewmodel, 
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
	const viewmodel: TestViewModel = 
	{ 
		text: new Observable<string>(checkbox.name!) 
	};
	
	Binder.Apply(context, viewmodel, 
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
	const viewmodel: TestViewModel = 
	{ 
		value: new Observable<number>(checkbox.width) 
	};
	
	Binder.Apply(context, viewmodel, 
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
	const viewmodel: TestViewModel = 
	{ 
		toggle: new Observable<boolean>(false) 
	};
	
	Binder.Apply(context, viewmodel, 
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
	const viewmodel: TestViewModel = 
	{ 
		toggle: new Observable<boolean>(false) 
	};
	
	Binder.Apply(context, viewmodel, 
	{
		toggle: { bind: "isChecked", update: "onChange" },
	});

	t.not(viewmodel.toggle!.get(), true);
	checkbox.onChange!(true);
	t.is(viewmodel.toggle!.get(), true);
});