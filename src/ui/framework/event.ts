import { Filter } from "../../helpers/utility";


/**
 * This value is either a standard function or a function targeting an event.
 */
type EventTrigger = Function & { targetEvent?: Event<any> };


/**
 * An object that can act as an event, to which multiple listeners can subscribe
 * to be notified when the event gets triggered.
 */
export default class Event<TSource>
{
	// All callbacks to call when the event gets invoked.
	private _listeners?: Function[] = [];


	/**
	 * Adds the specified callback to the list of listeners on this event. If the 
	 * callback is an unbound function, 'this' will be bound to the source.
	 * 
	 * @param callback The function to call when the event gets invoked.
	 */
	add(callback: Function)
	{
		if (!this._listeners)
		{
			this._listeners = [ callback ];
		}
		else
		{
			this._listeners.push(callback);
		}
	}


	/**
	 * Calls all listeners registered on this event with the specified arguments.
	 * 
	 * @param source Any source to use for unbound listeners.
	 * @param args Any arguments to pass through the listeners.
	 */
	invoke(source?: TSource, ...args: any[])
	{
		if (this._listeners)
		{
			for (let i = 0; i < this._listeners.length; i++)
			{
				const callback = this._listeners[i];
				callback.apply(source, args);
			}
		}
	}


	/**
	 * If the assigned field on the source is not an registered event yet, it will create 
	 * a new event object and assigns the invoke callback to the field. If the field is 
	 * already an event, it will add the specified callback to the existing event.
	 * 
	 * @param source The source object which will be modified.
	 * @param field The field on the source object to modify.
	 * @param callback The function to call when the event gets invoked.
	 */
	static register<TSource>(source: Partial<Filter<TSource, EventTrigger>>, field: keyof Filter<TSource, EventTrigger>, callback: Function)
	{
		const sourceValue = source[field];
		let event: Event<TSource>;

		if (sourceValue && sourceValue.targetEvent)
		{
			// Value is already a registered event...
			event = sourceValue.targetEvent;
		}
		else
		{
			// Value is not yet an registered event...
			event = new Event();
			if (sourceValue instanceof Function)
			{
				event.add(sourceValue);
			}

			// Create new unbound callback that invokes the event..
			const eventCallback = function(this: TSource, ...args: any[])	
			{ 
				event.invoke(this, ...args); 
			}
			eventCallback.targetEvent = event;
			source[field] = eventCallback;
		}

		event.add(callback);
	}
}