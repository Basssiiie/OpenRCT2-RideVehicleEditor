import mock_Window, { WindowMock } from "./window";
import mock from "./core/mock";


/**
 * Mock that adds additional configurations to the game map.
 */
export interface UiMock extends Ui
{
	createdWindows?: WindowMock[]
}


/**
 * A mock of the user interface api.
 */
export default function mock_Ui(template?: Partial<UiMock>): UiMock
{
	return mock<UiMock>({
		createdWindows: [],
		openWindow(desc: WindowDesc): Window
		{
			const window = mock_Window(desc);
			this.createdWindows?.unshift(window);
			return window;
		},
		getWindow(id: string | number): Window
		{
			let window = this.createdWindows?.find(w => w.classificationName === id || w.classification === id);
			if (!window)
			{
				window = { title: "not-found" } as WindowMock;
			}
			return window as Window;
		},

		...template,
	});
}