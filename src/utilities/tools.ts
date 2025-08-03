import { isUiAvailable } from "../environment";


/**
 * Cancels the current active tool regardless of what it is.
 */
export function cancelCurrentTool(): void
{
	if (isUiAvailable)
	{
		const tool = ui.tool;
		if (tool)
		{
			tool.cancel();
		}
	}
}

/**
 * Cancels one or more specified tool if they're currently active.
 */
export function cancelTools(...toolIds: string[]): void
{
	if (isUiAvailable)
	{
		const tool = ui.tool;
		if (tool && toolIds.indexOf(tool.id) !== -1)
		{
			tool.cancel();
		}
	}
}
