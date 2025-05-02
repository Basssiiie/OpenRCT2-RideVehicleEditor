import { Store } from "openrct2-flexui";
import { isMultiplayer } from "../environment";
import { getCarById, RideVehicle } from "../objects/rideVehicle";
import * as Log from "../utilities/logger";
import { alignWithMap, getIndexForTrackElementAt, getTileElement, toTileUnit } from "../utilities/map";
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
export function toggleVehicleDragger(isPressed: boolean, storeVehicle: Store<[RideVehicle, number] | null>, storeX: Store<number>, storeY: Store<number>, storeZ: Store<number>, storeTrackLocation: Store<CarTrackLocation | null>, storeTrackProgress: Store<number>, onCancel: () => void): void
{
	const rideVehicle = storeVehicle.get();
	if (!isPressed || !rideVehicle)
	{
		cancelTools(dragToolId);
		return;
	}

	const multiplayer = isMultiplayer();
	const originalPosition =
	{
		revert: true,
		x: storeX.get(),
		y: storeY.get(),
		z: storeZ.get(),
		track: storeTrackLocation.get(),
		progress: storeTrackProgress.get()
	};
	let lastPosition: DragPosition = originalPosition;
	let resetTrack: CarTrackLocation | null | undefined;

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
			if (position && (position.x !== lastPosition.x || position.y !== lastPosition.y || position.z !== lastPosition.z))
			{
				if (isNumber(position.trackElementIndex))
				{
					// Remember where to reset track location to when moving off track again.
					resetTrack ||= originalPosition.track;
				}
				else if (resetTrack)
				{
					// Reset back to original track piece.
					position.track = resetTrack;
					position.trackElementIndex = getIndexForTrackElementAt(resetTrack);
					position.progress = originalPosition.progress;
					resetTrack = null;
				}

				Log.debug("Selected position:", JSON.stringify(position));
				updateCarPosition(rideVehicle, position, DragState.Dragging);
				ui.tileSelection.tiles = [{ x: alignWithMap(position.x), y: alignWithMap(position.y) }];
				lastPosition = position;
			}
		},
		onDown: () =>
		{
			originalPosition.revert = false;
			Log.debug("[VehicleDragger] Place down vehicle at", lastPosition);
			updateCarPosition(rideVehicle, lastPosition, DragState.Complete);
			cancelCurrentTool();
		},
		onFinish: () =>
		{
			if (originalPosition.revert)
			{
				Log.debug("[VehicleDragger] Finish tool & revert position to", originalPosition, rideVehicle[0]._car());

				const track = originalPosition.track;
				if (track)
				{
					(<DragPosition>originalPosition).trackElementIndex = getIndexForTrackElementAt(track);
				}

				updateCarPosition(rideVehicle, originalPosition, DragState.Cancel);
			}
			ui.tileSelection.tiles = [];
			onCancel();
		}
	});
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

/**
 * Position currently selected by the drag tool.
 */
interface DragPosition extends CoordsXYZ
{
	trackElementIndex?: number | null;
	progress?: number | null;

	/** The track to move on to. Only available when cancelling the tool. */
	track?: CarTrackLocation | null;
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
	const result = <DragPosition>{};
	let x: number | undefined, y: number | undefined, z: number | undefined;

	if (!isUndefined(entityId) && entityId !== vehicle._id)
	{
		const entity = map.getEntity(entityId);
		x = entity.x;
		y = entity.y;
		z = entity.z;
	}
	else if (mapCoords && !isUndefined(tileElementIndex))
	{
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

				result.trackElementIndex = tileElementIndex;
				result.progress = distances._sequences[sequence].progress;
			}
		}

		x += 16;
		y += 16;
		// Increase height for certain vehicles like inverted ones based on the height in the tab icon
		//  29 for actual inverted, inverted tabheight for other negatives, 0 for big cars
		z += (tabHeight < -10) ? 29 : (tabHeight < 0) ? -tabHeight : 0;
	}
	else
	{
		return null;
	}

	result.x = x;
	result.y = y;
	result.z = z;

	return result;
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

	const position = args.position;
	const progress = position.progress;
	let skipCarXYZ: boolean | undefined;

	if (isNumber(position.trackElementIndex) && isNumber(progress))
	{
		const track = position.track;
		const target: CoordsXY = track || position;

		car.moveToTrack(toTileUnit(target.x), toTileUnit(target.y), position.trackElementIndex);
		car.travelBy(getDistanceFromProgress(car, progress - car.trackProgress));

		// If track variable available, then apply XYZ as preferred vehicle position.
		skipCarXYZ = !track;
	}

	if (!skipCarXYZ)
	{
		car.x = position.x;
		car.y = position.y;
		car.z = position.z;
	}

	invoke(refreshVehicle, id);
}
