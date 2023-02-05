import * as Log from "../utilities/logger";


const pickerToolId = "rve-pick-vehicle";


/**
 * Starts a tool that allows the user to click on a vehicle to select it.
 */
export function toggleVehiclePicker(isPressed: boolean, onPick: (car: Car) => void, onCancel: () => void): void
{
	if (!isPressed)
	{
		cancelVehiclePicker();
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
					Log.debug("(selector) Invalid entity id selected:", entityId);
					return;
				}

				onPick(<Car>entity);
				ui.tool?.cancel();
			}
		},
		onFinish: onCancel
	});
}


/**
 * Cancels the vehicle picker if it's currently active.
 */
export function cancelVehiclePicker(): void
{
	const tool = ui.tool;
	if (tool && tool.id === pickerToolId)
	{
		tool.cancel();
	}
}