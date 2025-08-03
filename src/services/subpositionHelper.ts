import { abs } from "../utilities/math";


/**
 * @see https://github.com/OpenRCT2/OpenRCT2/blob/develop/src/openrct2/ride/VehicleData.cpp#L801
 */
const subpositionTranslationDistances = [
	0,      // no movement
	8716,   // X translation
	8716,   // Y translation
	12327,  // XY translation
	6554,   // Z translation
	10905,  // XZ translation
	10905,  // YZ translation
	13961   // XYZ translation
];


const distanceCache: Record<string, TrackDistances | undefined> = {};


/**
 * Gets distance information about the current track segment.
 */
export function getTrackSegmentDistances(track: TrackSegment, subpositionType: number, direction: Direction): Readonly<TrackDistances>
{
	const key = createCacheKey(track.type, subpositionType, direction);
	let value = distanceCache[key];
	if (!value)
	{
		value = new TrackDistances(track, subpositionType, direction);
		distanceCache[key] = value;
	}
	return value;
}


/**
 * Gets distance information about the specified track type.
 */
export function getTrackTypeDistances(trackType: number, subpositionType: number, direction: Direction): Readonly<TrackDistances>
{
	const key = createCacheKey(trackType, subpositionType, direction);
	let value = distanceCache[key];
	if (!value)
	{
		const segment = context.getTrackSegment(trackType);
		if (!segment)
		{
			throw Error("Unknown track piece");
		}

		value = new TrackDistances(segment, subpositionType, direction);
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
function createCacheKey(trackType: number, subposition: number, direction: Direction): string
{
	return (trackType + "-" + direction + "-" + subposition);
}


/**
 * Gets the non-square root distance between two positions.
 */
function distance(start: Readonly<CoordsXYZ>, end: Readonly<CoordsXYZ>): number
{
	const deltaX = (start.x - end.x);
	const deltaY = (start.y - end.y);
	const deltaZ = (start.z - end.z);
	return abs(deltaX * deltaX + deltaY * deltaY + deltaZ + deltaZ);
}


/**
 * Rotates the coordinates by 90 degrees a specified amount of times.
 */
function rotate(coordinates: CoordsXY, by: number): void
{
	const rotation = (by & 3);
	const x = coordinates.x;
	const y = coordinates.y;

	if (rotation == 1)
	{
		coordinates.x = y;
		coordinates.y = -x;
	}
	else if (rotation == 2)
	{
		coordinates.x = -x;
		coordinates.y = -y;
	}
	else if (rotation == 3)
	{
		coordinates.x = -y;
		coordinates.y = x;
	}
}


/**
 * A single sequence in a multi-tile track-piece.
 */
interface TrackSequence extends CoordsXYZ
{
	// Progress' values closest to the center of that sequence element.
	progress: number | null;
}


/**
 * The positional data for a specific track element.
 */
export class TrackDistances
{
	// Offsets of the starting subposition.
	_startX: number;
	_startY: number;
	_startZ: number;
	// Offsets of the ending subposition.
	_endX: number;
	_endY: number;
	_endZ: number;
	// Direction of the track piece.
	_direction: Direction;
	// Distances between each of the subpositions.
	_distances: Uint16Array;
	// All the sequences in a potentially multi-part track piece.
	_sequences: TrackSequence[];
	// Total length of the track segment/piece.
	_progressLength: number;
	// Total distance of all subpositions on the track segment/piece.
	_totalDistance: number;

	constructor(track: TrackSegment, subpositionType: number, direction: Direction)
	{
		// Note: optimized to reduce external Duktape calls.
		const subpositions = track.getSubpositions(subpositionType, direction);
		const subpositionsLength = subpositions.length;
		const elements = track.elements;
		const elementsLength = elements.length;
		const start = subpositions[0];
		const distances = new Uint16Array(subpositionsLength - 1);
		const sequences = new Array<TrackSequence>(elementsLength);
		let totalDistance = 0;
		let idx = 1;

		let { x, y, z } = start;
		this._startX = x;
		this._startY = y;
		this._startZ = z;

		// Get the distance between each of the subpositions.
		for (; idx < subpositionsLength; idx++)
		{
			const next = subpositions[idx];
			const distance = getSubpositionTranslationDistance(x, y, z, next.x, next.y, next.z);

			totalDistance += distance;
			distances[idx - 1] = distance;

			x = next.x;
			y = next.y;
			z = next.z;
		}

		// Check if current subposition is closest to any sequence center.
		for (idx = 0; idx < elementsLength; idx++)
		{
			const element = elements[idx];
			const center = <TrackSequence>{ x: element.x, y: element.y, z: element.z };
			let subposition = 0;
			let closestSubposition: number | null = null;
			let closestDistance = 10_000; // About max. 3 tiles away (100*100 units, non-square rooted).
			let currentDistance;

			rotate(center, direction);
			center.x += 16;
			center.y += 16;

			for (; subposition < subpositionsLength; subposition++)
			{
				currentDistance = distance(center, subpositions[subposition]);
				if (currentDistance < closestDistance)
				{
					closestDistance = currentDistance;
					closestSubposition = subposition;
				}
			}

			// Reuse allocated center object for storing the sequence.
			center.x -= 16;
			center.y -= 16;
			center.progress = closestSubposition;

			sequences[idx] = center;
		}

		this._endX = x;
		this._endY = y;
		this._endZ = z;
		this._direction = direction;
		this._distances = distances;
		this._sequences = sequences;
		this._progressLength = distances.length;
		this._totalDistance = totalDistance;
	}

	/**
	 * Get the origin of a track piece in world coordinates.
	 */
	_origin(x: number, y: number, z: number, sequence: number): CoordsXYZD
	{
		const element = this._sequences[sequence];
		return {
			x: x - element.x,
			y: y - element.y,
			z: z - element.z,
			direction: this._direction
		};
	}
}
