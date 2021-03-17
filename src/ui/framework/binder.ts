import Log from "../../helpers/logger";
import { Filter } from "../../helpers/utilityHelpers";
import BindingContext from "./contexts/bindingContext";
import Observable from "./observable";


// Base for a binding on a viewmodel.
type BindingBase<TViewModel, TKind> = Partial<Record<keyof TViewModel, TKind>>;


/**
 * A binding that only updates a view (the target) when the viewmodel has changed.
 */
export type ToTarget<TView> = keyof TView;


/**
 * A binding that only updates a viewmodel (the source) when the view has changed.
 */
export type ToSource<TView> = { update: keyof Filter<TView, Function> };


/**
 * A binding that only updates a view (the target) when the viewmodel (the source) 
 * has changed, and also updates the viewmodel when the view has changed.
 */
export type TwoWay<TView> = { bind: keyof TView } & ToSource<TView>;


/**
 * An object that defines all bindings between a viewmodel (the source) and a view 
 * (the target).
 */
export type Bindings<TViewModel, TView> = BindingBase<TViewModel, ToTarget<TView> | ToSource<TView> | TwoWay<TView>>;


/**
 * Applies a specific binding to the view-model, returns true if succesful or false 
 * if it could not find a suitable observable to bind to.
 */
function applyBinding<TView, TViewModel>(context: BindingContext<TView>, viewmodel: TViewModel, bindings: Bindings<TViewModel, TView>, bindSource: Extract<keyof TViewModel, string>): boolean
{
	const observable = viewmodel[bindSource];
	if (observable === undefined)
	{
		return false;
	}
	if (!(observable instanceof Observable))
	{
		Log.debug(`Binding failed: Observable is not an observable, but of type '${typeof observable}'`);
		return false;
	}

	const binding = bindings[bindSource];

	const toTarget = Binder.getBindingToTarget<TView>(binding);
	if (toTarget !== null)
	{
		context.setField(toTarget, observable.get());
		observable.subscribe(value => context.setField(toTarget, value));
	}

	const toSource = Binder.getBindingToSource<TView>(binding);
	if (toSource !== null)
	{
		const toSource = binding as ToSource<TView>; 
		context.setField(toSource.update, <any>((v: unknown) => observable.set(v)));
	}

	Log.debug("Binding created: " + (
		(toTarget === null) ? `'${bindSource}' <- '${toSource}'` :
		(toSource === null) ? `'${bindSource}' -> '${toTarget}'` :
		`'${bindSource}' <-> '${toTarget}:${toSource}'`
	));
	return true;
}


/**
 * A binder module that can bind a context to viewmodels.
 */
module Binder
{
	export function getBindingToTarget<TView>(binding?: ToTarget<TView> | ToSource<TView> | TwoWay<TView>): keyof TView | null
	{
		if (typeof(binding) === "string")
		{
			return binding as ToTarget<TView>;
		}
		else if (typeof(binding) === "object" && binding !== null && "bind" in binding) 
		{
			return (binding as TwoWay<TView>).bind;
		}
		return null;
	}


	export function getBindingToSource<TView>(binding?: ToTarget<TView> | ToSource<TView> | TwoWay<TView>): keyof TView | null
	{
		if (typeof(binding) === "object" && binding !== null && "update" in binding) 
		{
			return (binding as ToSource<TView>).update;
		}
		return null;
	}


	/**
	 * Binds a view context to a viewmodel through selected bindings.
	 * 
	 * @param context The context of the view (target).
	 * @param viewmodel The viewmodel (source) to bind to.
	 * @param bindings The properties to bind to.
	 */
	export function apply<TView, TViewModel>(context: BindingContext<TView>, viewmodel: TViewModel, bindings: Bindings<TViewModel, TView>)
	{
		for (let bindSource in bindings) // on the viewmodel
		{
			if (!applyBinding(context, viewmodel, bindings, bindSource))
			{
				Log.warning(`Could not find observable property on viewmodel for '${bindSource}'`);
			}
		}
	}


	/**
	 * Binds a view context to multiple viewmodels through selected bindings.
	 * 
	 * @param context The context of the view (target).
	 * @param viewmodels The viewmodels (source) to bind to.
	 * @param bindings The properties to bind to.
	 */
	export function applyAll<TView, TViewModel>(context: BindingContext<TView>, viewmodels: TViewModel[], bindings: Bindings<TViewModel, TView>)
	{
		for (let bindSource in bindings) // on the viewmodel
		{
			let success = false;
			for (let vm of viewmodels)
			{
				success = (applyBinding(context, vm, bindings, bindSource) || success);
			}

			if (!success)
			{
				Log.warning(`Could not find observable property on any viewmodels for '${bindSource}'`);
			}
		}
	}
}
export default Binder;