import mock from "./_mock";

/**
 * A mock of a window with basic functionality.
 */
export default function mock_Window(template?: Partial<Window>): Window
{
	return mock<Window>({
		findWidget<T extends Widget>(name: string): T
		{
			const result = this.widgets?.find(w => w.name === name);
			if (!result)
				throw new Error(`Widget not found: '${name}'`);

			return result as T;
		},

		...template,
	});
}