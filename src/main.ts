import { isUiAvailable } from './helpers';
import { VehicleEditorWindow } from './window';


const main = (): void => {
	if (!isUiAvailable) {
		return;
	}

	ui.registerMenuItem("Edit ride vehicles", () => {
		VehicleEditorWindow.show();
	})
};

export default main;
