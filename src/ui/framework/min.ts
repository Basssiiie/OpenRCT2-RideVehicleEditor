/*
 * min.js
 *
 * By lewisjb - 19/1/17
 *
 * github/lewisjb
 * lewisjb.com
 *
 * ----------------------------------------------------------------------------
 * This is meant to be a minimal MVVM written in JS.
 * The goals were to make it usable, minimal, and
 * not require transpiling.
 *
 * The usage was heavily inspired by Knockout.js
 * ----------------------------------------------------------------------------
 *
 * JS Usage:
 * ----------------------------------------------------------------------------
 * $min.o(val)      | Creates an observable
 *                  | Getting - `var()` where `var` is an observable
 *                  | Setting - `var(newVal)`
 * $min.c(fn)       | Creates a computed
 *                  | Getting - `var()` where `var` is a computed
 * $min.scope(s, e) | Applies scope `s` (obj/fn) to element `e`
 * var.sub(fn)      | Adds `fn` as a subscriber to `var` (where var is ob/comp)
 * ----------------------------------------------------------------------------
 * 
 * HTML Usage:
 * ----------------------------------------------------------------------------
 * data-b='<JSON>'  | Binds the data from the JSON to the element
 *                  | e.g.
 *                  | <input type="text" data-b='{"value": "var"}' />
 *                  | Now when `var` in the scope changes, so will this
 *                  | element's value.
 *                  | The keys of the JSON correspond to the JS
 *                  | keys/attributes of the element, and the values
 *                  | are the names of the variables in the scope.
 *                  | Nested JSON is supported.
 *                  |
 *                  | For two-way bindings, the key needs "<->" in it.
 *                  | e.g.
 *                  | <input type="text" data-b='{"value<->onchange": "v"}' />
 *                  | The name on the left side is the getter/setter, and
 *                  | the name on the right side is the hook to know
 *                  | when to update the variable.
 *-----------------------------------------------------------------------------
 */
/*
 type Callback = (newVal: unknown, stack: unknown) => void;
type StackEntry = Function[]


const $min = 
{
	__get_dependency(args: IArguments, stack_?: Function[]): Function | null
	{
		var stack = stack_ || [];
		var callerFunction = args.callee.caller;

		if(stack.indexOf(callerFunction) !== -1) 
		{ 
			return null; 
		}

		if(!callerFunction || callerFunction.__c) 
		{ 
			return callerFunction; 
		}

		return $min.__get_dependency(callerFunction.arguments, stack.concat([callerFunction]));
	},


	__gen_base(val: unknown) 
	{

		var me = 
		{
			val: val, 
			subs: new Array<{ __update: Callback }>(), 
			dependentObservables: [],

			subscribe(callback: Callback) 
			{ 
				me.subs.push({ __update: callback }); 
			},

			_unsubscribe(callback: { __update: Callback }) 
			{
				var i = me.subs.indexOf(callback);
				if(i !== -1) 
				{ 
					me.subs.splice(i, 1) 
				};
			},

			_ping(newVal: unknown, stack: []) 
			{
				for(var i = 0; i < me.subs.length; i++) 
				{
					me.subs[i].__update(newVal, stack);
				}
			},

			__add_dependencies(args: IArguments) 
			{
				var dep = $min.__get_dependency(args);
				if(dep && dep.__c) 
				{
					if(me.subs.indexOf(dep.__c) === -1) 
					{ 
						me.subs.push(dep.__c); 
					}
					if(dep.__c.dependentObservables.indexOf(me) === -1) 
					{ 
						dep.__c.dependentObservables.push(me);
					}
				}
			}
		};
		return me;
	},

	observable(val: unknown) 
	{
		interface Observable extends Function
		{
			(): unknown;
			__o: unknown,
			subscribe: (callback: Callback) => void,
			mutated: () => void
		}

		var me = $min.__gen_base(val);

		var out: Observable = function() 
		{
			me.__add_dependencies(arguments);
			if(arguments.length > 0 && arguments[0] != me.val) 
			{
				me.val = arguments[0];
				me._ping(me.val, [me]);
			}
			return me.val;
		};

		out.__o = me;
		out.subscribe = me.subscribe;
		out.mutated = function() 
		{ 
			me._ping(me.val, [me]); 
		};
		return out;
	},

	computed(fn) 
	{
		var me = $min.__gen_base(fn);

		me.__call = function() {
			var old = me.dependentObservables; 
			me.dependentObservables = [];

			var v = me.val();
			for(var i = 0; i < old.length; i++) 
			{
				if(me.dependentObservables.indexOf(old[i]) === -1) { old[i]._unsubscribe(me); }
			}
			return v;
		};

		me.__update = function(v, _stack) 
		{
			var stack = _stack || [];
			if(stack.indexOf(me) !== -1) 
			{ 
				return; 
			}

			var res = me.__call();
			me._ping(res, stack.concat([me]));
		};

		me.__update.__c = me; // So the dependency tracker knows this is a dep
		var out = function() 
		{
			me.__add_dependencies(arguments);
			return me.__call();
		}

		out.__c = me;
		out.subscribe = me.subscribe;
		out();
		return out;
	},

	scope(viewModel: { [property: string]: unknown } | Function, element: HTMLElement) 
	{
		viewModel = (typeof viewModel === "function") ? viewModel() : viewModel;
		var elementList = element.querySelectorAll<HTMLElement>('[data-b]');

		for(var i = 0; i < elementList.length; i++) 
		{
			var currentElement = elementList[i];
			var info = JSON.parse(currentElement.dataset.b);

			function apply(bindKey: string | null, bindInfo: object | Function, currentElement: HTMLElement) 
			{
				if(typeof bindInfo === "object") 
				{
					var keys = Object.keys(bindInfo);
					for(var i = 0; i < keys.length; i++) 
					{
						apply(keys[i], bindInfo[keys[i]], (bindKey) ? currentElement[bindKey] : currentElement);
					}
				} 
				else 
				{
					var observable = viewModel[bindInfo] || bindInfo;
					var value = observable;

					if(observable.__c || observable.__o) 
					{
						if(bindKey.indexOf("<->") !== -1) 
						{
							// subscribe to event on html element
							var fn = function() { observable(currentElement.value); };
							currentElement[bindKey.split('<->')[1]] = fn;
							bindKey = bindKey.split('<->')[0];
						}

						// update html element on change
						observable.subscribe(function(newVal) { currentElement[bindKey] = newVal; });
						value = observable();
					}
					currentElement[bindKey] = value;
				}
			}
			apply(null, info, currentElement);
		}
	}
};*/