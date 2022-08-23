import { RideTrain } from "../objects/rideTrain";
import { getTrackDistances } from "./subpositionHelper";
import * as Log from "../utilities/logger";

const MaxForwardIterations = 5;
const UnitsPerTile = 32;


export function getDistanceFromProgress(car: Car, trackProgress: number): number
{
	const currentTrackLocation = car.trackLocation;
	const currentTrackIndex = getIndexForTrackElementAt(currentTrackLocation);
	if (currentTrackIndex === null)
	{
		Log.debug(`Could not find track for car at position; ${currentTrackLocation.x}, ${currentTrackLocation.y}, ${currentTrackLocation.z}, direction; ${currentTrackLocation.direction}`);
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
		Log.debug(`Track iterator does not have segment for car at position; ${currentTrackLocation.x}, ${currentTrackLocation.y}, ${currentTrackLocation.z}, direction; ${currentTrackLocation.direction}, index; ${currentTrackIndex}`);
		return 0;
	}

	const currentProgress = car.trackProgress;
	const subposition = car.subposition;
	const backwards = (trackProgress < 0);
	const nextSegment = (backwards) ? iterator.previous : iterator.next;
	let distanceIndex = currentProgress;
	let remainingProgress = Math.abs(trackProgress);
	let totalDistance = 0;

	do
	{
		const trackDistances = getTrackDistances(iteratorSegment, subposition, currentTrackLocation.direction);
		const distances = trackDistances._distances;
		const length = trackDistances._length;

		if (distanceIndex === 0 && remainingProgress > length)
		{
			// Quick add whole segment
			totalDistance += trackDistances._totalDistance;
			remainingProgress -= length;
		}
		else
		{
			for (; distanceIndex < length && remainingProgress >= 0; distanceIndex++, remainingProgress--)
			{
				totalDistance += distances[distanceIndex];
			}
			distanceIndex = 0;
		}

		nextSegment();
		iteratorSegment = iterator.segment;
	}
	while (remainingProgress > 0 && iteratorSegment);

	Log.debug(`Move vehicle ${totalDistance}; backwards: ${backwards}`);
	return (backwards) ? -totalDistance : totalDistance;
}


export function getSpacingToPrecedingVehicle(train: RideTrain, car: Car, carIndex: number): number | null
{
	if (carIndex <= 0)
	{
		return null;
	}

	const carInFront = train.at(carIndex - 1).car();

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
		Log.debug(`Track iterator does not have segment for car at position; ${currentTrackLocation.x}, ${currentTrackLocation.y}, ${currentTrackLocation.z}, direction; ${currentTrackLocation.direction}`);
		return null;
	}

	const subposition = car.subposition;
	let distances = getTrackDistances(iteratorSegment, subposition, currentTrackLocation.direction);
	let totalDistance = (distances._length - currentProgress);
	for (let i = 0; i < MaxForwardIterations; i++)
	{
		iterator.next();

		const iteratorPosition = iterator.position;
		if (isLocationEqual(iteratorPosition, inFrontTrackLocation))
		{
			return (totalDistance + inFrontProgress);
		}

		iteratorSegment = iterator.segment;
		if (iteratorSegment === null)
		{
			return null;
		}

		distances = getTrackDistances(iteratorSegment, subposition, iteratorPosition.direction);
		totalDistance += distances._length;
	}
	return null;
}


function getTrackIteratorAtLocation(trackLocation: CoordsXYZD): TrackIterator | null
{
	const currentTrackIndex = getIndexForTrackElementAt(trackLocation);
	if (currentTrackIndex === null)
	{
		Log.debug(`Could not find track for car at position; ${trackLocation.x}, ${trackLocation.y}, ${trackLocation.z}, direction; ${trackLocation.direction}`);
		return null;
	}

	const iterator = map.getTrackIterator(trackLocation, currentTrackIndex);
	if (!iterator)
	{
		Log.debug(`Could not start track iterator for car at position; ${trackLocation.x}, ${trackLocation.y}, ${trackLocation.z}, direction; ${trackLocation.direction}, index; ${currentTrackIndex}`);
		return null;
	}
	return iterator;
}


function getIndexForTrackElementAt(coords: CoordsXYZD): number | null
{
	const tile = map.getTile(coords.x / UnitsPerTile, coords.y / UnitsPerTile);
	const allElements = tile.elements, len = allElements.length;

	for (let i = 0; i < len; i++)
	{
		const element = tile.elements[i];
		if (element.type === "track"
			&& element.baseZ === coords.z
			&& element.direction === coords.direction)
		{
			return i;
		}
	}
	return null;
}


function isLocationEqual(left: CoordsXYZD, right: CoordsXYZD): boolean
{
	return left.x === right.x
		&& left.y === right.y
		&& left.z === right.z
		&& left.direction === right.direction;
}