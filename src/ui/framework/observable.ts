/**
 * An object that can be subscribed to and whose subscriptions will be notified 
 * when the value has changed.
 */
export default class Observable<T>
{
	private _value: T;
	private _subscriptions?: Array<(value: T) => void>; 


	/**
	 * Create a new observable object with the specified value.
	 * 
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
	 * 
	 * @param value The new value.
	 */
	set(value: T)
	{
		if (this._value !== value)
		{
			this._value = value;
			this.invoke();
		}
	}


	/**
	 * Subscribes to this observable. The subscription will be called when the value
	 * within this observable has changed.
	 * 
	 * @param callback The action to perfom when the value within this observable 
	 * has changed.
	 */
	subscribe(callback: (value: T) => void)
	{
		if (!this._subscriptions)
		{
			this._subscriptions = [ callback ];
		}
		else
		{
			this._subscriptions.push(callback);
		}
	}


	/**
	 * Notifies all subscriptions that the value has been changed.
	 */
	private invoke()
	{
		if (this._subscriptions)
		{
			for (let subscription of this._subscriptions)
			{
				subscription(this._value);
			}
		}
	}
}