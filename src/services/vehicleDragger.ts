import { Store } from "openrct2-flexui";
import { isMultiplayer } from "../environment";
import { getCarById, RideVehicle } from "../objects/rideVehicle";
import * as Log from "../utilities/logger";
import { alignWithMap, getTileElement, toTileUnit, getIndexForTrackElementAt } from "../utilities/map";
import { cancelCurrentTool, cancelTools } from "../utilities/tools";
import { isNumber, isUndefined } from "../utilities/type";
import { register } from "./actions";
import { invoke, refreshVehicle } from "./events";
import { getDistanceFromProgress } from "./spacingEditor";
import { getTrackTypeDistances } from "./subpositionHelper";


const execute = register<DragVehicleArgs>("rve-drag-car", updateVehicleDrag);

/**
 * Id of the vehicle drag tool.
 */
export const dragToolId = "rve-drag-vehicle";

/**
 * Enable or disable a tool to drag the vehicle to a new location.
 */
export function toggleVehicleDragger(isPressed: boolean, storeVehicle: Store<[RideVehicle, number] | null>, storeX: Store<number>, storeY: Store<number>, storeZ: Store<number>,
	storeTrackLocation: Store<CarTrackLocation | null>, storeTrackProgress: Store<number>, onCancel: () => void): void
{
	const rideVehicle = storeVehicle.get();
	if (!isPressed || !rideVehicle)
	{
		cancelTools(dragToolId);
		return;
	}

	const multiplayer = isMultiplayer();
	const trackLocation = storeTrackLocation.get();
	const originalPosition = <DragPosition>
	{
		rawCoords: {
			x: storeX.get(),
			y: storeY.get(),
			z: storeZ.get()
		},
		trackState: trackLocation ? {
			trackElementIndex: getIndexForTrackElementAt(trackLocation, trackLocation.trackType),
			trackTile: { x: toTileUnit(trackLocation.x), y: toTileUnit(trackLocation.y) },
			progress: storeTrackProgress.get()
		} : null
	};

	let lastPosition: DragPosition = originalPosition;
	let revert = true;

	ui.activateTool({
		id: dragToolId,
		cursor: "picker",
		onMove: args =>
		{
			if (multiplayer && date.ticksElapsed % 5 !== 0)
			{
				// Limit updates to 8 fps to avoid bringing down multiplayer servers
				return;
			}
			const vehicle = rideVehicle[0];
			const position = getPositionFromTool(args, vehicle);
			if (position && isNewPosition(position, lastPosition))
			{
				updateCarPosition(rideVehicle, position, DragState.Dragging);
				const selection = position.trackState 
					? position.trackState.trackTile
					: position.rawCoords
						? { x: alignWithMap(position.rawCoords.x), y: alignWithMap(position.rawCoords.y) }
						: null;
				if (selection)
				{
					ui.tileSelection.tiles = [selection];
				}
				lastPosition = position;
			}
		},
		onDown: () =>
		{
			revert = false;
			Log.debug("[VehicleDragger] Place down vehicle at", lastPosition);
			updateCarPosition(rideVehicle, lastPosition, DragState.Complete);
			cancelCurrentTool();
		},
		onFinish: () =>
		{
			if (revert)
			{
				Log.debug("[VehicleDragger] Finish tool & revert position to", originalPosition, rideVehicle[0]._car());
				updateCarPosition(rideVehicle, originalPosition, DragState.Cancel);
			}
			ui.tileSelection.tiles = [];
			onCancel();
		}
	});
}

function isNewPosition(position: DragPosition, lastPosition: DragPosition): boolean
{
	if (position.rawCoords && (lastPosition.rawCoords == null
		|| position.rawCoords.x !== lastPosition.rawCoords.x
		|| position.rawCoords.y !== lastPosition.rawCoords.y
		|| position.rawCoords.z !== lastPosition.rawCoords.z))
	{
		return true;
	}
	if (position.trackState && (lastPosition.trackState == null
		|| position.trackState.trackElementIndex !== lastPosition.trackState.trackElementIndex
		|| position.trackState.trackTile.x !== lastPosition.trackState.trackTile.x
		|| position.trackState.trackTile.y !== lastPosition.trackState.trackTile.y
		|| position.trackState.progress !== lastPosition.trackState.progress))
	{
		return true;
	}
	
	return false;
}

/**
 * Current state of the dragging tool.
 */
const enum DragState
{
	Dragging,
	Complete,
	Cancel
}

interface TrackState
{
	trackElementIndex: number;
	trackTile: CoordsXY;
	progress: number;
}

/**
 * Position currently selected by the drag tool.
 */
interface DragPosition
{
	rawCoords?: CoordsXYZ | null;
	trackState?: TrackState | null;
}

/**
 * Arguments of a currently dragged vehicle.
 */
interface DragVehicleArgs
{
	target: number;
	position: DragPosition;
	state: DragState;
}

/**
 * Get a possible position to drag the vehicle to.
 */
function getPositionFromTool(args: ToolEventArgs, vehicle: RideVehicle): DragPosition | null
{
	const { entityId, mapCoords, tileElementIndex } = args;	

	if (!isUndefined(entityId) && entityId !== vehicle._id)
	{
		const entity = map.getEntity(entityId);
		return {
			rawCoords: {
				x: entity.x,
				y: entity.y,
				z: entity.z
			}
		};
	}
	else if (mapCoords && !isUndefined(tileElementIndex))
	{
		let x: number, y: number, z: number;
		x = mapCoords.x;
		y = mapCoords.y;
		const element = getTileElement(x, y, tileElementIndex);
		const type = element.type;
		const vehicleType = vehicle._type();
		const tabHeight = (vehicleType) ? vehicleType.tabHeight : 0;

		z = (type === "footpath" || type === "banner" || type === "wall")
			? element.baseZ : element.clearanceZ;

		if (type === "surface")
		{
			// Adjust height for surface elements slopes and water
			const waterZ = element.waterHeight;
			if (waterZ > z)
			{
				z = waterZ;
			}
			else if (element.slope)
			{
				z += 8;
			}
		}
		else if (type === "track")
		{
			// Find correct track offsets for track pieces
			const sequence = element.sequence;
			if (isNumber(sequence))
			{
				const trackType = element.trackType;
				const subposition = vehicle._car().subposition;
				const distances = getTrackTypeDistances(trackType, subposition, element.direction);

				const progress = distances._sequences[sequence].progress;
				if (progress)
				{
					return {
						trackState: {
							trackElementIndex: tileElementIndex,
							trackTile: { x: toTileUnit(x), y: toTileUnit(y) },
							progress
						}
					};
				}
			}
		}

		x += 16;
		y += 16;
		// Increase height for certain vehicles like inverted ones based on the height in the tab icon
		//  29 for actual inverted, inverted tabheight for other negatives, 0 for big cars
		z += (tabHeight < -10) ? 29 : (tabHeight < 0) ? -tabHeight : 0;

		return {
			rawCoords: { x, y, z }
		};
	}
	else
	{
		return null;
	}
}

/**
 * Trigger the game action to inform all clients of the new location.
 */
function updateCarPosition(vehicle: [RideVehicle, number], position: DragPosition, state: DragState): void
{
	execute({ target: vehicle[0]._id, position, state });
}

/**
 * Updates the vehicle to the new position according to the drag event.
 */
function updateVehicleDrag(args: DragVehicleArgs): void
{
	const id = args.target;
	const car = getCarById(args.target);
	if (!car)
	{
		return;
	}

	if (args.position.trackState)
	{
		const trackState = args.position.trackState;
		car.moveToTrack(trackState.trackTile.x, trackState.trackTile.y, trackState.trackElementIndex);
		car.travelBy(getDistanceFromProgress(car, trackState.progress - car.trackProgress));
	}

	if (args.position.rawCoords)
	{
		const rawCoords = args.position.rawCoords;
		car.x = rawCoords.x;
		car.y = rawCoords.y;
		car.z = rawCoords.z;
	}

	invoke(refreshVehicle, id);
}
