import { OpenWindow, tabwindow, WindowTemplate, WritableStore } from "openrct2-flexui";
import { createNamingTab } from "./tabs/namingTab";
import { createPositionalTab } from "./tabs/positionalTab";
import { createPropertiesTab } from "./tabs/propertiesTab";
import { createRideTab } from "./tabs/rideTab";
import { createStylingTab } from "./tabs/stylingTab";
import { multiplier } from "./utilityControls";
import { getWindowColours } from "./widgets/constants";
import { EditorViewModel } from "../viewmodels/editorViewModel";
import { SelectionViewModel } from "../viewmodels/selectionViewModel";
import { SynchronizationViewModel } from "../viewmodels/synchronizationViewModel";


let editorWindow: WindowTemplate<EditorViewModel> | undefined;

export function openEditorWindow(store: WritableStore<OpenWindow | null>, selection: SelectionViewModel, synchronization: SynchronizationViewModel): void
{
	editorWindow ||= createEditorWindow();

	const model = new EditorViewModel(store, selection, synchronization);
	const window = editorWindow.open(model);
	store.set(window);
}

function createEditorWindow(): WindowTemplate<EditorViewModel>
{
	return tabwindow<EditorViewModel>(model =>
	({
		title: model._naming._name,
		colours: getWindowColours(true),
		width: { value: 300, min: 250, max: 400 },
		height: "auto",
		onClose: model._close.bind(model),
		static: [
			multiplier(model._multiplierIndex)
		],
		tabs: [
			createStylingTab(model._selection, model._styling),
			createPositionalTab(model._selection, model._positional, model._multiplier),
			createPropertiesTab(model._selection, model._properties, model._multiplier),
			createRideTab(model._ride, model._multiplier),
			createNamingTab(model._naming)
		]
	}));
}
