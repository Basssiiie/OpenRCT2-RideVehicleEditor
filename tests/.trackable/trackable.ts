/**
 * Keeps count of what happened with a set of keys from T.
 */
export type Tracker<T> = Record<keyof T, number> &
{
	/**
	 * Gets the total amount of times any of the properties on
	 * the object have been accessed.
	 */
	total(): number;
};


/**
 * Allows any reads and writes to the object of T to be tracked.
 */
export type Trackable<T> = T &
{
	/**
	 * Returns the amount of times a value has been read.
	 */
	_gets: Tracker<T>;


	/**
	 * Returns the amount of times a value has been reassigned.
	 */
	_sets: Tracker<T>;
};


/**
 * Function that calculates the total of all number properties on this object.
 */
function calculateTotal(this: Record<string, number>): number
{
	return Object
		.keys(this)
		.map(k => this[k])
		.filter(k => typeof k === "number")
		.reduce((sum, value): number => (sum + value), 0);
}


/**
 * Creates a counter property on the root that counts the total of accessings of
 * this key in all the children.
 */
function createTotalCounter<T>(root: Trackable<T>, children: Trackable<T>[], key: string, selector: (tracker: Trackable<T>) => Tracker<T>): void
{
	const tracker = selector(root);
	tracker.total = calculateTotal;

	if (!Object.prototype.hasOwnProperty.call(tracker, key))
	{
		Object.defineProperty(tracker, key,
		{
			get: function()
			{
				return children
					.map(t => selector(t)[key as keyof T] as number)
					.reduce((sum, cur) => sum + cur);
			},
			enumerable: true,
		});
	}
}


/**
 * Allows any reads and writes to the object of T to be tracked.
 */
export default function track<T>(source: T[]): Trackable<Trackable<T>[]>;
export default function track<T>(source: T): Trackable<T>;
export default function track<T>(source: T | T[]): Trackable<T> | Trackable<Trackable<T>[]>
{
	if (Array.isArray(source))
	{
		return trackArray(source);
	}
	return trackObject(source);
}


/**
 * Tracks all geter and setter accessings on all items in source,
 * and adds totals to the array object.
 */
function trackArray<T>(source: T[]): Trackable<Trackable<T>[]>
{
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const tracker = source as Trackable<any>;
	Object.defineProperty(tracker ,"_gets", { value: {} });
	Object.defineProperty(tracker ,"_sets", { value: {} });

	const subtrackers: Trackable<T>[] = new Array(source.length);

	for (const item of source)
	{
		for (const key of Object.keys(source[0]))
		{
			createTotalCounter(tracker, subtrackers, key, t => t._gets);
			createTotalCounter(tracker, subtrackers, key, t => t._sets);
		}
		subtrackers.push(track<T>(item));
	}
	return tracker as Trackable<Trackable<T>[]>;
}


/**
 * Tracks all geter and setter accessings on source.
 */
function trackObject<T>(source: T): Trackable<T>
{
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const trackable = source as Trackable<any>;
    const internal: Record<string, unknown> = {};

    const keys = Object.keys(source);
	Object.defineProperty(trackable ,"_gets", { value: { total: calculateTotal } });
	Object.defineProperty(trackable ,"_sets", { value: { total: calculateTotal } });

	for (const key of keys)
	{
        internal[key] = trackable[key];
		trackable._gets[key] = 0;
		trackable._sets[key] = 0;

        Object.defineProperty(source, key,
		{
            get: function()
			{
				trackable._gets[key]++;
                return internal[key];
            },
            set: function(value)
			{
				trackable._sets[key]++;
                internal[key] = value;
            },
        });
    }
    return trackable as Trackable<T>;
}