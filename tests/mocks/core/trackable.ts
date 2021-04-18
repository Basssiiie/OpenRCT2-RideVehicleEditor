/**
 * Simplified version of the trackable type, to help constructing it.
 */
type TrackableConstructor<T> = T &
{
	[name: string]: unknown;
	gets: Record<string, number>;
	sets: Record<string, number>;
};


/**
 * Allows any reads and writes to the object of T to be tracked.
 */
export type Trackable<T> = T &
{
	/**
	 * Returns the amount of times a value has been read.
	 */
	gets: Record<keyof T, number>;


	/**
	 * Returns the amount of times a value has been reassigned.
	 */
	sets: Record<keyof T, number>;
};


/**
 * Allows any reads and writes to the object of T to be tracked.
 */
export default function track<T>(source: T): Trackable<T>
{
	const trackable = source as TrackableConstructor<T>;
	trackable.gets = {};
	trackable.sets = {};
    const internal: Record<string, unknown> = {};

    Object.keys(source).forEach(function(key: string)
	{
        internal[key] = trackable[key];
		trackable.gets[key] = 0;
		trackable.sets[key] = 0;

        Object.defineProperty(source, key,
		{
            get: function()
			{
				trackable.gets[key]++;
                return internal[key];
            },
            set: function(value)
			{
				trackable.sets[key]++;
                internal[key] = value;
            },
            enumerable: true
        });
    });
    return trackable as Trackable<T>;
}