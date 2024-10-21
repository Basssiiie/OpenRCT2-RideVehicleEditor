import { getCarById, isCar } from "../objects/rideVehicle";
import * as Log from "../utilities/logger";
import { getTileElement } from "../utilities/map";
import { cancelCurrentTool, cancelTools } from "../utilities/tools";
import { isUndefined } from "../utilities/type";


// How far away from the tile element the entity is allowed to be.
const selectionHeightEdge = 18;


/**
 * Id of the picker tool.
 */
export const pickerToolId = "rve-pick-vehicle";


/**
 * Starts a tool that allows the user to click on a vehicle to select it.
 */
export function toggleVehiclePicker(isPressed: boolean, onPick: (car: Car) => void, onCancel: () => void): void
{
	if (!isPressed)
	{
		cancelTools(pickerToolId);
		return;
	}

	ui.activateTool({
		id: pickerToolId,
		cursor: "cross_hair",
		onDown: args =>
		{
			let carToSelect: Car | undefined;
			const entityId = args.entityId;
			Log.debug("[VehiclePicker] Pick args:", JSON.stringify(args));

			if (entityId)
			{
				const entity = getCarById(entityId);
				if (entity)
				{
					carToSelect = entity;
				}
				else
				{
					Log.debug("[VehiclePicker] Invalid entity id selected:", entityId);
				}
			}
			else
			{
				const elementIdx = args.tileElementIndex;
				const coords = args.mapCoords;
				if (coords && coords.x > 0 && !isUndefined(elementIdx))
				{
					carToSelect = findCarNearbyTileElement(coords, elementIdx);
				}
				else
				{
					Log.debug("[VehiclePicker] Unknown pick...");
				}
			}
			if (carToSelect)
			{
				onPick(carToSelect);
				cancelCurrentTool();
			}
		},
		onFinish: onCancel
	});
}

/**
 * Finds a car within a certain range of the selected tile element.
 */
function findCarNearbyTileElement(coords: CoordsXY, elementIdx: number): Car | undefined
{
	const element = getTileElement(coords.x, coords.y, elementIdx);
	const entitiesOnTile = map.getAllEntitiesOnTile("car", coords);
	let carToSelect: Car | undefined;
	let amountOfCars = 0;

	Log.debug("[VehiclePicker] Try find car at", JSON.stringify(coords), "for range", element.baseZ, "to", element.clearanceZ);
	for (const entity of entitiesOnTile)
	{
		if (isCar(entity)
			&& (element.baseZ - entity.z) < selectionHeightEdge
			&& (entity.z - element.clearanceZ) < selectionHeightEdge)
		{
			Log.debug("[VehiclePicker] Car", entity.id, "in range at", entity.z);
			carToSelect = entity;
			amountOfCars++;
		}
	}

	if (amountOfCars > 1)
	{
		Log.debug("[VehiclePicker] Too many cars on tile nearby element:", amountOfCars, "cars found");
		return;
	}
	return carToSelect;
}
