import { Store } from "openrct2-flexui";
import { RideVehicle } from "../objects/rideVehicle";
import { cancelCurrentTool, cancelTools } from "../utilities/tools";
import { floor } from "../utilities/math";
import { register } from "./actions";
import { invoke, refreshVehicle } from "./events";
import { isMultiplayer } from "../environment";


const execute = register<DragVehicleArgs>("rve-drag-car", updateVehicleDrag);

/**
 * Id of the vehicle drag tool.
 */
export const dragToolId = "rve-drag-vehicle";

/**
 * Enable or disable a tool to drag the vehicle to a new location.
 */
export function toggleVehicleDragger(isPressed: boolean, storeVehicle: Store<[RideVehicle, number] | null>, storeX: Store<number>, storeY: Store<number>, storeZ: Store<number>, onCancel: () => void): void
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
		z: storeZ.get()
	};
	let lastPosition: CoordsXYZ = originalPosition;

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
			const position = getPositionFromTool(args, rideVehicle[0]._type());
			if (position && (position.x !== lastPosition.x || position.y !== lastPosition.y || position.z !== lastPosition.z))
			{
				updateCarPosition(rideVehicle, position, DragState.Dragging);
				ui.tileSelection.tiles = [{ x: alignWithMap(position.x), y : alignWithMap(position.y) }];
				lastPosition = position;
			}
		},
		onDown: () =>
		{
			originalPosition.revert = false;
			updateCarPosition(rideVehicle, lastPosition, DragState.Complete);
			cancelCurrentTool();
		},
		onFinish: () =>
		{
			if (originalPosition.revert)
			{
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
 * Arguments of a currently dragged vehicle.
 */
interface DragVehicleArgs
{
	target: number;
	position: CoordsXYZ;
	state: DragState;
}

/**
 * Get a possible position to drag the vehicle to.
 */
function getPositionFromTool(args: ToolEventArgs, vehicleType: RideObjectVehicle | null): CoordsXYZ | null
{
	const { entityId, mapCoords, tileElementIndex } = args;
	let x: number | undefined, y: number | undefined, z: number | undefined;

	if (entityId !== undefined)
	{
		const entity = map.getEntity(entityId);
		x = entity.x;
		y = entity.y;
		z = entity.z;
	}
	else if (mapCoords && tileElementIndex !== undefined)
	{
		x = (mapCoords.x + 16);
		y = (mapCoords.y + 16);
		const tile = map.getTile(x / 32, y / 32);
		const element = tile.getElement(tileElementIndex);
		const type = element.type;
		const tabHeight = (vehicleType) ? vehicleType.tabHeight : 0;

		z = (type === "footpath" || type === "banner" || type === "wall")
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

		// Increase height for certain vehicles like inverted ones based on the height in the tab icon
		//  29 for actual inverted, inverted tabheight for other negatives, 0 for big cars
		z += (tabHeight < -10) ? 29 : (tabHeight < 0) ? -tabHeight : 0;
	}
	else
	{
		return null;
	}
	return { x, y, z };
}

/**
 * Trigger the game action to inform all clients of the new location.
 */
function updateCarPosition(vehicle: [RideVehicle, number], position: CoordsXYZ, state: DragState): void
{
	execute({ target: vehicle[0]._id, position, state });
}

/**
 * Updates the vehicle to the new position according to the drag event.
 */
function updateVehicleDrag(args: DragVehicleArgs): void
{
	const id = args.target;
	const car = map.getEntity(args.target);
	if (!car || car.type !== "car")
	{
		return;
	}

	const position = args.position;
	car.x = position.x;
	car.y = position.y;
	car.z = position.z;

	invoke(refreshVehicle, id);
}

/**
 * Align the coordinate with the edge of a map tile.
 */
function alignWithMap(coordinate: number): number
{
	return floor(coordinate / 32) * 32;
}