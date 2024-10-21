import { RideTrain } from "../objects/rideTrain";
import * as Log from "../utilities/logger";
import { getTileByCoords } from "../utilities/map";
import { abs } from "../utilities/math";
import { isNull, isUndefined } from "../utilities/type";
import { getSubpositionTranslationDistance, getTrackDistances, TrackDistances } from "./subpositionHelper";


const MaxForwardIterations = 10;
const MaximumDistanceFromCap = 3277;
const ForwardDistanceCap = (13_962 - MaximumDistanceFromCap);
const BackwardDistanceCap = (0 + MaximumDistanceFromCap);


/**
 * Gets the amount of travelling distance for the specified car, by the preferred amount of track progress.
 */
export function getDistanceFromProgress(car: Car, trackProgress: number): number
{
	const currentTrackLocation = car.trackLocation;
	const currentTrackIndex = getIndexForTrackElementAt(currentTrackLocation);
	if (isNull(currentTrackIndex))
	{
		Log.debug("Could not find track for car at position;", currentTrackLocation.x, ",", currentTrackLocation.y, ",", currentTrackLocation.z, ", direction:", currentTrackLocation.direction);
		return 0;
	}

	const iterator = getTrackIteratorAtLocation(currentTrackLocation);
	if (!iterator)
	{
		return 0;
	}

	let iteratorSegment = iterator.segment;
	if (!iteratorSegment)
	{
		Log.debug("Track iterator does not have segment for car at position;", currentTrackLocation.x, ",", currentTrackLocation.y, ",", currentTrackLocation.z, ", direction:", currentTrackLocation.direction, ", index:", currentTrackIndex);
		return 0;
	}

	const currentProgress = car.trackProgress;
	const subposition = car.subposition;
	const subpositionIterator = (trackProgress >= 0)
		? new ForwardIterator(trackProgress, currentProgress)
		: new BackwardIterator(abs(trackProgress), currentProgress);

	let trackPosition: CoordsXYZD = currentTrackLocation;
	let trackDistances = getTrackDistances(iteratorSegment, subposition, trackPosition.direction);
	subpositionIterator._setInitialDistanceFromCarRemainingDistance(car.remainingDistance);

	while (subpositionIterator._remainingProgress > 0 && iteratorSegment)
	{
		Log.debug("Remaining progress:", subpositionIterator._remainingProgress, ", total:", subpositionIterator._totalDistance);

		const trackPieceLength = trackDistances._progressLength;

		if (subpositionIterator._distanceIndex === 0 && subpositionIterator._remainingProgress >= trackPieceLength)
		{
			// Quick add whole segment.
			subpositionIterator._totalDistance += trackDistances._totalDistance;
			subpositionIterator._remainingProgress -= trackPieceLength;
			Log.debug("total +=", trackDistances._totalDistance, "=", subpositionIterator._totalDistance, "(whole segment)");
		}
		else
		{
			subpositionIterator._iterateSegment(trackDistances);
		}

		if (!subpositionIterator._remainingProgress || !subpositionIterator._jumpSegment(iterator))
		{
			// Quit all progress is applied, or end of track.
			break;
		}

		iteratorSegment = iterator.segment;
		if (!iteratorSegment)
		{
			break;
		}

		const nextTrackPosition = iterator.position;
		const nextTrackDistance = getTrackDistances(iteratorSegment, subposition, nextTrackPosition.direction);

		subpositionIterator._remainingProgress--;
		subpositionIterator._totalDistance += subpositionIterator._getDistanceBetweenSegments(trackPosition, trackDistances, nextTrackPosition, nextTrackDistance);
		trackPosition = nextTrackPosition;
		trackDistances = nextTrackDistance;
	}

	const totalDistance = subpositionIterator._totalDistance;
	Log.debug("Move vehicle", totalDistance, "; progress change:", trackProgress);
	return (trackProgress < 0) ? -totalDistance : totalDistance;
}

// Cache last spacing calculation
let lastPrecedingVehicleX: number | undefined;
let lastPrecedingVehicleY: number | undefined;
let lastPrecedingVehicleZ: number | undefined;
let lastFollowingVehicleX: number | undefined;
let lastFollowingVehicleY: number | undefined;
let lastFollowingVehicleZ: number | undefined;
let lastSpacingResult: number | null | undefined;


/**
 * Calculate how much spacing there is between the current vehicle and the preceding
 * vehicle on the specified train. Returns "null" if it is too far away.
 */
export function getSpacingToPrecedingVehicle(train: RideTrain, car: Car, carIndex: number): number | null
{
	if (carIndex <= 0)
	{
		return null;
	}

	const carInFront = train._at(carIndex - 1)._car();

	// Check if spacing calculation is already cached:
	const followingCarX = car.x, followingCarY = car.y, followingCarZ = car.z,
		precedingCarX = carInFront.x, precedingCarY = carInFront.y, precedingCarZ = carInFront.z;

	if (isUndefined(lastSpacingResult)
		|| followingCarX !== lastFollowingVehicleX || followingCarY !== lastFollowingVehicleY || followingCarZ !== lastFollowingVehicleZ
		|| precedingCarX !== lastPrecedingVehicleX || precedingCarY !== lastPrecedingVehicleY || precedingCarZ !== lastPrecedingVehicleZ)
	{
		Log.debug("Cached spacing value invalid; recalculate...");
		lastFollowingVehicleX = followingCarX;
		lastFollowingVehicleY = followingCarY;
		lastFollowingVehicleZ = followingCarZ;
		lastPrecedingVehicleX = precedingCarX;
		lastPrecedingVehicleY = precedingCarY;
		lastPrecedingVehicleZ = precedingCarZ;
		lastSpacingResult = calculateSpacingToPrecedingVehicle(car, carInFront);
	}
	return lastSpacingResult;
}

/**
 * Performs the actual spacing calculation.
 */
function calculateSpacingToPrecedingVehicle(car: Car, carInFront: Car): number | null
{
	const currentProgress = car.trackProgress;
	const inFrontProgress = carInFront.trackProgress;
	const currentTrackLocation = car.trackLocation;
	const inFrontTrackLocation = carInFront.trackLocation;

	if (isLocationEqual(currentTrackLocation, inFrontTrackLocation))
	{
		return (inFrontProgress - currentProgress);
	}

	const iterator = getTrackIteratorAtLocation(currentTrackLocation);
	if (!iterator)
	{
		return null;
	}

	let iteratorSegment = iterator.segment;
	if (!iteratorSegment)
	{
		Log.debug("Track iterator does not have segment for car at position;", currentTrackLocation.x, ",", currentTrackLocation.y, ",", currentTrackLocation.z, ", direction;", currentTrackLocation.direction);
		return null;
	}

	const subposition = car.subposition;
	let distances = getTrackDistances(iteratorSegment, subposition, currentTrackLocation.direction);
	let totalDistance = (distances._progressLength - currentProgress);
	for (let i = 0; i < MaxForwardIterations; i++)
	{
		iterator.next();
		totalDistance++;

		const iteratorPosition = iterator.position;
		if (isLocationEqual(iteratorPosition, inFrontTrackLocation))
		{
			return (totalDistance + inFrontProgress);
		}

		iteratorSegment = iterator.segment;
		if (isNull(iteratorSegment))
		{
			return null;
		}

		distances = getTrackDistances(iteratorSegment, subposition, iteratorPosition.direction);
		totalDistance += distances._progressLength;
	}
	return null;
}

/**
 * Get a track iterator for the specified track location.
 */
function getTrackIteratorAtLocation(trackLocation: CoordsXYZD): TrackIterator | null
{
	const currentTrackIndex = getIndexForTrackElementAt(trackLocation);
	if (isNull(currentTrackIndex))
	{
		Log.debug("Could not find track for car at position;", trackLocation.x, ",", trackLocation.y, ",", trackLocation.z, ", direction;", trackLocation.direction);
		return null;
	}

	const iterator = map.getTrackIterator(trackLocation, currentTrackIndex);
	if (!iterator)
	{
		Log.debug("Could not start track iterator for car at position;", trackLocation.x, ",", trackLocation.y, ",", trackLocation.z, ", direction;", trackLocation.direction, ", index;", currentTrackIndex);
		return null;
	}
	return iterator;
}

/**
 * Finds the index of a matching track element on the specified tile.
 */
function getIndexForTrackElementAt(coords: CoordsXYZD): number | null
{
	const tile = getTileByCoords(coords.x, coords.y);
	const allElements = tile.elements, len = allElements.length;

	for (let i = 0; i < len; i++)
	{
		const element = tile.elements[i];
		if (element.type === "track"
			&& element.baseZ === coords.z
			&& element.direction === coords.direction
			&& element.sequence === 0)
		{
			return i;
		}
	}
	return null;
}

/**
 * Returns true if the two locations are exactly equal, or false if not.
 */
function isLocationEqual(left: CoordsXYZD, right: CoordsXYZD): boolean
{
	return left.x === right.x
		&& left.y === right.y
		&& left.z === right.z
		&& left.direction === right.direction;
}


/**
 * Base class for a track piece subposition iterator that calculates the amount
 * of travelled distance.
 */
abstract class SubpositionIterator
{
	_remainingProgress: number;
	_distanceIndex: number;
	_totalDistance: number = 0;

	constructor (remainingProgress: number, currentProgress: number)
	{
		this._remainingProgress = remainingProgress;
		this._distanceIndex = currentProgress;
	}

	/**
	 * Add some extra distance to offset the game's internal movement cap. This fixes a +1 not
	 * actually doing a +1 because the vehicle didn't reach the cap for moving yet.
	 */
	abstract _setInitialDistanceFromCarRemainingDistance(remainingDistance: number): void;

	/**
	 * Walk through a track piece subposition list until the remaining progress runs out.
	 */
	abstract _iterateSegment(trackDistances: Readonly<TrackDistances>): void;

	/**
	 * Move the track iterator to the next track piece.
	 */
	abstract _jumpSegment(trackIterator: TrackIterator): boolean;

	/**
	 * Get the distance between the connecting start and endpoints of two track pieces.
	 */
	abstract _getDistanceBetweenSegments(previousTile: CoordsXYZ, previousTrack: Readonly<TrackDistances>, nextTile: CoordsXYZ, nextTrack: Readonly<TrackDistances>): number;
}

/**
 * Track piece subposition iterator that moves forward.
 */
class ForwardIterator extends SubpositionIterator
{
	override _setInitialDistanceFromCarRemainingDistance(remainingDistance: number): void
	{
		if (remainingDistance < ForwardDistanceCap)
		{
			this._totalDistance += (ForwardDistanceCap - remainingDistance);
		}
	}
	override _iterateSegment(trackDistances: Readonly<TrackDistances>): void
	{
		const trackPieceLength = trackDistances._progressLength;
		const distances = trackDistances._distances;
		let remainingProgress = this._remainingProgress;
		let distanceIdx = this._distanceIndex;

		for (; distanceIdx < trackPieceLength && remainingProgress > 0; distanceIdx++)
		{
			this._totalDistance += distances[distanceIdx];
			Log.debug("total +=", distances[distanceIdx], "=", this._totalDistance, "(step:", distanceIdx, ", remaining:", remainingProgress, ")");
			remainingProgress--;
		}

		this._remainingProgress = remainingProgress;
		this._distanceIndex = 0;
	}
	override _jumpSegment(trackIterator: TrackIterator): boolean
	{
		return trackIterator.next();
	}
	override _getDistanceBetweenSegments(previousTile: CoordsXYZ, previousTrack: Readonly<TrackDistances>, nextTile: CoordsXYZ, nextTrack: Readonly<TrackDistances>): number
	{
		return getSubpositionTranslationDistance(
			previousTile.x + previousTrack._endX,
			previousTile.y + previousTrack._endY,
			previousTile.z + previousTrack._endZ,
			nextTile.x + nextTrack._startX,
			nextTile.y + nextTrack._startY,
			nextTile.z + nextTrack._startZ
		);
	}
}

/**
 * Track piece subposition iterator that moves backwards.
 */
class BackwardIterator extends SubpositionIterator
{
	override _setInitialDistanceFromCarRemainingDistance(remainingDistance: number): void
	{
		if (remainingDistance > BackwardDistanceCap)
		{
			this._totalDistance += (remainingDistance - BackwardDistanceCap);
		}
	}
	override _iterateSegment(trackDistances: Readonly<TrackDistances>): void
	{
		const trackPieceLength = trackDistances._progressLength;
		const distances = trackDistances._distances;
		let remainingProgress = this._remainingProgress;
		let distanceIdx = this._distanceIndex || (trackPieceLength - 1);

		while (--distanceIdx >= 0 && remainingProgress > 0)
		{
			this._totalDistance += distances[distanceIdx];
			Log.debug("total +=", distances[distanceIdx], "=", this._totalDistance, "(step:", distanceIdx, ", remaining:", remainingProgress, ")");
			remainingProgress--;
		}
		this._remainingProgress = remainingProgress;
		this._distanceIndex = 0;
	}
	override _jumpSegment(trackIterator: TrackIterator): boolean
	{
		return trackIterator.previous();
	}
	override _getDistanceBetweenSegments(previousTile: CoordsXYZ, previousTrack: Readonly<TrackDistances>, nextTile: CoordsXYZ, nextTrack: Readonly<TrackDistances>): number
	{
		return getSubpositionTranslationDistance(
			previousTile.x + previousTrack._startX,
			previousTile.y + previousTrack._startY,
			previousTile.z + previousTrack._startZ,
			nextTile.x + nextTrack._endX,
			nextTile.y + nextTrack._endY,
			nextTile.z + nextTrack._endZ
		);
	}
}
