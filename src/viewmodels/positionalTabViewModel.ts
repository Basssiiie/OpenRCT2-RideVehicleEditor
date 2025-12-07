import { store } from "openrct2-flexui";
import { getDistanceFromProgress } from "../services/spacingEditor";
import { CopyFilter } from "../services/vehicleCopier";
import { VehicleSpan } from "../services/vehicleSpan";
import { SelectionViewModel } from "./selectionViewModel";

export class PositionalTabViewModel
{
	readonly _trackProgress = store<number>(0);
	readonly _trackLocation = store<CarTrackLocation | null>(null);
	readonly _spacing = store<number | null>(0);
	readonly _x = store<number>(0);
	readonly _y = store<number>(0);
	readonly _z = store<number>(0);
	readonly _spin = store<number>(0);


	private readonly _selection: SelectionViewModel;

	constructor(selection: SelectionViewModel)
	{
		this._selection = selection;
	}

	/**
	 * Apply the same amount of track progress to all selected vehicles based on the currently selected car.
	 */
	applyTrackProgressChange(action: (vehicles: VehicleSpan[], value: number) => void, increment: number, filter: CopyFilter): void
	{
		const selectedVehicle = this._selection._vehicle.get();
		if (selectedVehicle)
		{
			const distance = getDistanceFromProgress(selectedVehicle[0]._car(), increment);
			model._modifyVehicle(action, distance, filter);
		}
	}

}
