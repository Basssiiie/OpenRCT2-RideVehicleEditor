



export default class Observable<T>
{
	private _value: T;
	private _subscriptions?: Array<(value: T) => void>; 


	constructor(value: T)
	{
		this._value = value;
	}


	get(): T
	{
		return this._value;
	}


	set(value: T)
	{
		if (this._value !== value)
		{
			this._value = value;
			this.invoke();
		}
	}


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