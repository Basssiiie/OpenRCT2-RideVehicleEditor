/**
 * Allows partial mocking of the specified type.
 * 
 * @param source A partial of T containing the mocked methods and values.
 * @returns The specified partial as a fully typed T.
 */
export function mock<T>(source?: Partial<T>): T
{
	return source as T;
}


/**
 * Returns a mocked version of the OpenRCT2 UI interface.
 * 
 * @param container A container to retrieve certain values set inside the UI.
 */
export function mockUI(container: any = {}): Ui
{
	return mock<Ui>(
	{
		openWindow(desc: WindowDesc)
		{
			container.windowDesc = desc;
			container.window = mock<globalThis.Window>(
			{
				widgets: desc.widgets?.map(w => ({ ...w })),

				findWidget<T extends Widget>(name: string) : T
				{
					return this.widgets?.find(w => w.name === name) as T;
				}
			});
			return container.window;
		}
	});
}