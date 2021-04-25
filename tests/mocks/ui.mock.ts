import mock_Window, { WindowMock } from "./window.mock";
import mock from "./core/mock";
import mock_Viewport from "./viewport.mock";


/**
 * Mock that adds additional configurations to the game map.
 */
export interface UiMock extends Ui
{
	createdWindows: WindowMock[]
}


/**
 * A mock of the user interface api.
 */
export default function mock_Ui(template?: Partial<UiMock>): UiMock
{
	return mock<UiMock>({
		mainViewport: mock_Viewport(),
		createdWindows: [],
		openWindow(desc: WindowDesc): Window
		{
			const window = mock_Window(desc);
			window.isOpen = true;
			this.createdWindows?.unshift(window);
			return window;
		},
		closeWindows(classification: string, id?: number): void
		{
			this.createdWindows
				?.filter(w => w.classificationName === classification
					&& (id === undefined || id === w.number))
				.forEach(w =>
				{
					w.onClose?.();
					w.isOpen = false;
				});
		},
		getWindow(id: string | number): Window
		{
			const window = this.createdWindows?.find(w => w.classificationName === id || w.classification === id);
			if (!window)
				return <Window><unknown>null;

			return window as Window;
		},

		...template,
	});
}