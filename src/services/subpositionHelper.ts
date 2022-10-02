/**
 * @see https://github.com/OpenRCT2/OpenRCT2/blob/develop/src/openrct2/ride/VehicleData.cpp#L801
 */
const subpositionTranslationDistances =
[
	0,      // no movement
	8716,   // X translation
	8716,   // Y translation
	12327,  // XY translation
	6554,   // Z translation
	10905,  // XZ translation
	10905,  // YZ translation
	13961,  // XYZ translation
];


type CacheKey = `${number}-${Direction}-${number}`;

const distanceCache: Record<CacheKey, TrackDistances> = {};


/**
 * Gets distance information about the current track segment.
 */
export function getTrackDistances(track: TrackSegment, subpositionType: number, direction: Direction): Readonly<TrackDistances>
{
	const key = createCacheKey(track.type, subpositionType, direction);
	let value = distanceCache[key];
	if (!value)
	{
		value =  new TrackDistances(track.getSubpositions(subpositionType, direction));
		distanceCache[key] = value;
	}
	return value;
}


/**
 * Returns the constant translation distance between two subpositions.
 */
export function getSubpositionTranslationDistance(x1: number, y1: number, z1: number, x2: number, y2: number, z2: number): number
{
	// Mimic OpenRCT2 source code, but as a one-liner to improve minification.
	const translationIdx = +(x1 != x2) | (+(y1 != y2) << 1) | (+(z1 != z2) << 2);

	return subpositionTranslationDistances[translationIdx];
}


/**
 * Creates a key for caching subposition data for the specific track element.
 */
function createCacheKey(trackType: number, subposition: number, direction: Direction): CacheKey
{
	return `${trackType}-${direction}-${subposition}`;
}


/**
 * The positional data for a specific track element.
 */
export class TrackDistances
{
	_startX: number;
	_startY: number;
	_startZ: number;
	_endX: number;
	_endY: number;
	_endZ: number;
	_distances: Uint16Array;
	_progressLength: number;
	_totalDistance: number;

	constructor(subpositions: TrackSubposition[])
	{
		const length = subpositions.length;
		const start = subpositions[0];
		const distances = new Uint16Array(length - 1);
		let totalDistance = 0;

		// Note: optimized to reduce external Duktape calls.
		let { x, y, z } = start;
		this._startX = x;
		this._startY = y;
		this._startZ = z;

		for (let idx = 1; idx < length; idx++)
		{
			const next = subpositions[idx];
			const distance = getSubpositionTranslationDistance(x, y, z, next.x, next.y, next.z);

			totalDistance += distance;
			distances[idx - 1] = distance;

			x = next.x;
			y = next.y;
			z = next.z;
		}
		this._endX = x;
		this._endY = y;
		this._endZ = z;
		this._distances = distances;
		this._progressLength = distances.length;
		this._totalDistance = totalDistance;
	}
}