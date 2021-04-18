import * as Log from "./logger";


/**
 * An object that can be subscribed to and whose subscriptions will be notified
 * when the value has changed.
 */
export default class Observable<T>
{
	private _value: T;
	private _listeners?: ((value: T) => void)[];


	/**
	 * Create a new observable object with the specified value.
	 * @param value The value that the object will be initialized with.
	 */
	constructor(value?: T);
	constructor(value: T);
	constructor(value: T)
	{
		this._value = value;
	}


	/**
	 * Returns the current value.
	 */
	get(): T
	{
		return this._value;
	}


	/**
	 * Updates the current value to a new one, and notifies all subscribers if
	 * the value does not equal the old one.
	 * @param value The new value.
	 */
	set(value: T): void
	{
		if (this._value !== value)
		{
			this._value = value;
			Log.debug(`(observable) Value updated for ${this._listeners?.length ?? 0} listeners: ${JSON.stringify(value)?.slice(0, 50)}`);

			this.invoke(value);
		}
		else
		{
			Log.debug(`(observable) Value is already set to: ${JSON.stringify(value)?.slice(0, 50)}`);
		}
	}


	/**
	 * Subscribes to this observable. The subscription will be called when the value
	 * within this observable has changed.
	 * @param callback The action to perfom when the value within this observable
	 * has changed.
	 */
	subscribe(callback: (value: T) => void): void
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
	 */
	private invoke(value: T): void
	{
		if (this._listeners)
		{
			for (let i = 0; i < this._listeners.length; i++)
			{
				const callback = this._listeners[i];
				callback(value);
			}
		}
	}
}