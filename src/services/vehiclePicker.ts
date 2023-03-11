import * as Log from "../utilities/logger";
import { cancelCurrentTool, cancelTools } from "../utilities/tools";


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
			const entityId = args.entityId;
			if (entityId)
			{
				const entity = map.getEntity(entityId);
				if (!entity || entity.type !== "car")
				{
					Log.debug("[VehiclePicker] Invalid entity id selected:", entityId);
					return;
				}

				onPick(<Car>entity);
				cancelCurrentTool();
			}
		},
		onFinish: onCancel
	});
}