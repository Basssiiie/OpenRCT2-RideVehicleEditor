import mock from "./core/mock";


/**
 * Mock that adds additional configurations to the game map.
 */
export interface WindowMock extends Window
{
	classificationName: string;
	isOpen: boolean;

	onClose?: () => void;
	onUpdate?: () => void;
	onTabChange?: () => void;
}


/**
 * A mock of a window with basic functionality.
 */
export default function mock_Window(template?: Partial<Window | WindowDesc>): WindowMock
{
	let classId, className;
	if (template)
	{
		// Fix inconsistencies between number and string classification fields.
		if (template.classification)
		{
			const classValue: unknown = template.classification;
			const classType = typeof classValue;
			if (classType === "string")
			{
				className = classValue as string;
			}
			else if (classType === "number")
			{
				classId = classValue as number;
			}
		}

		// Give viewports proper functions.
		if (template.widgets)
		{
			for (const widget of (template.widgets as ViewportWidget[]))
			{
				const viewport = widget.viewport;
				if (viewport && !viewport.moveTo)
				{
					viewport.moveTo = (pos: CoordsXY | CoordsXYZ): void =>
					{
						viewport.left = pos.x;
						viewport.top = pos.y;
					};
				}
			}
		}
	}

	return mock<WindowMock>({
		classificationName: className,
		findWidget<T extends Widget>(name: string): T
		{
			const result = this.widgets?.find(w => w.name === name);
			if (!result)
				throw new Error(`Widget not found: '${name}'`);

			return result as T;
		},

		...template,
		classification: classId,
	});
}