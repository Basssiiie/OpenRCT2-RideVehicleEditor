import { Store } from "openrct2-flexui";
import { isMultiplayer } from "../environment";
import { getCarById, RideVehicle } from "../objects/rideVehicle";
import { getTileElement } from "../utilities/map";
import { floor } from "../utilities/math";
import { cancelCurrentTool, cancelTools } from "../utilities/tools";
import { isNull, isUndefined } from "../utilities/type";
import { register } from "./actions";
import { invoke, refreshVehicle } from "./events";
import { getDistanceFromProgress } from "./spacingEditor";
import { equalCoordsXYZ } from "../utilities/coords";


const execute = register<DragVehicleArgs>("rve-drag-car", updateVehicleDrag);

/**
 * Id of the vehicle drag tool.
 */
export const dragToolId = "rve-drag-vehicle";

/**
 * Enable or disable a tool to drag the vehicle to a new location.
 */
export function toggleVehicleDragger(isPressed: boolean,
	storeVehicle: Store<[RideVehicle, number] | null>,
	storeXYZ: Store<CoordsXYZ>,
	storeTrackLocation: Store<CarTrackLocation | null>,
	storeTrackProgress: Store<number>,
	onCancel: () => void): void
{
	const rideVehicle = storeVehicle.get();
	if (!isPressed || !rideVehicle)
	{
		cancelTools(dragToolId);
		return;
	}

	const originalXYZ = storeXYZ.get();
	const multiplayer = isMultiplayer();
	const originalPosition =
	{
		revert: true,
		x: originalXYZ.x,
		y: originalXYZ.y,
		z: originalXYZ.z,
	};
	const originalTrackPosition = storeTrackLocation.get();
	const originalTrackProgress = storeTrackProgress.get();
	let lastPosition: CoordsXYZ = originalPosition;
	let lastTrackPosition: CarTrackLocation | null = originalTrackPosition;

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
			const [tilePosition, trackPosition] = getPositionFromTool(args, rideVehicle[0]._type(), rideVehicle[0]._id);
			if (tilePosition && trackPosition && !equalCoordsXYZ(trackPosition, lastTrackPosition) ||
				!trackPosition && tilePosition && !equalCoordsXYZ(tilePosition, lastPosition))
			{
				const position = {
					tilePosition,
					trackPosition,
					trackProgress: null,
				};
				updateCarPosition(rideVehicle, position, DragState.Dragging);
				ui.tileSelection.tiles = [{ x: alignWithMap(tilePosition.x), y : alignWithMap(tilePosition.y) }];
				lastPosition = tilePosition;
				lastTrackPosition = trackPosition;
			}
		},
		onDown: () =>
		{
			originalPosition.revert = false;
			const position = {
				tilePosition: lastPosition,
				trackPosition: lastTrackPosition,
				trackProgress: null,
			};
			updateCarPosition(rideVehicle, position, DragState.Complete);
			cancelCurrentTool();
		},
		onFinish: () =>
		{
			if (originalPosition.revert)
			{
				const position = {
					tilePosition: originalPosition,
					trackPosition: originalTrackPosition,
					trackProgress: originalTrackProgress,
				};
				updateCarPosition(rideVehicle, position, DragState.Cancel);
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

interface DragPosition
{
	tilePosition: CoordsXYZ,
	trackPosition: CarTrackLocation | null,
	trackProgress: number | null,
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
function getPositionFromTool(args: ToolEventArgs, vehicleType: RideObjectVehicle | null, currentId: number): [CoordsXYZ | null, CarTrackLocation | null]
{
	const { entityId, mapCoords, tileElementIndex } = args;
	let x: number | undefined, y: number | undefined, z: number | undefined;
	let trackLocation: CarTrackLocation | null = null;

	if (!isUndefined(entityId) && entityId !== currentId)
	{
		const entity = map.getEntity(entityId);
		x = entity.x;
		y = entity.y;
		z = entity.z;
	}
	else if (mapCoords && !isUndefined(tileElementIndex))
	{
		x = (mapCoords.x + 16);
		y = (mapCoords.y + 16);
		const element = getTileElement(x, y, tileElementIndex);
		const type = element.type;
		const tabHeight = (vehicleType) ? vehicleType.tabHeight : 0;

		z = (type === "footpath" || type === "banner" || type === "wall" || type === "track")
			? element.baseZ : element.clearanceZ;

		// Custom heights for surface elements
		if (type === "surface")
		{
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

		if (type === "track") {
			const iterator = map.getTrackIterator({x, y}, tileElementIndex);
			if (!isNull(iterator)) {
				trackLocation = {
					x: iterator.position.x-16, // back to block center
					y: iterator.position.y-16,
					z: iterator.position.z,
					direction: element.direction,
					trackType: element.trackType
				};
			}
		}

		// Increase height for certain vehicles like inverted ones based on the height in the tab icon
		//  29 for actual inverted, inverted tabheight for other negatives, 0 for big cars
		z += (tabHeight < -10) ? 29 : (tabHeight < 0) ? -tabHeight : 0;
	}
	else
	{
		return [null, null];
	}
	return [{ x, y, z }, trackLocation];
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

	if (isNull(args.position.trackPosition)) {
		const position = args.position.tilePosition;
		car.x = position.x;
		car.y = position.y;
		car.z = position.z;
	} else {
		car.trackLocation = args.position.trackPosition;
		if (!isNull(args.position.trackProgress)) {
			car.travelBy(getDistanceFromProgress(car, args.position.trackProgress));
		} else {
			// internally, travelBy calls MoveTo so the car will render on the holding
			// track
			// HACK: seems to make the vehicle update render properly
			car.travelBy(getDistanceFromProgress(car, 1));
			car.travelBy(getDistanceFromProgress(car, -1));
		}
	}

	invoke(refreshVehicle, id);
}

/**
 * Align the coordinate with the edge of a map tile.
 */
function alignWithMap(coordinate: number): number
{
	return floor(coordinate / 32) * 32;
}
