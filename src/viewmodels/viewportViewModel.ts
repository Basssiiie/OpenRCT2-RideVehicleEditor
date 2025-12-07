import { store } from "openrct2-flexui";
import { applyToTargets, CopyFilter, getVehicleSettings, VehicleSettings } from "../services/vehicleCopier";
import { locate } from "../services/vehicleLocater";
import { toggleVehiclePicker } from "../services/vehiclePicker";
import { EditorViewModel } from "./editorViewModel";
import { SelectionViewModel } from "./selectionViewModel";

export class ViewportViewModel
{
	readonly _selection: SelectionViewModel;
	readonly _editor: EditorViewModel;

	readonly _isPicking = store<boolean>(false);
	readonly _isDragging = store<boolean>(false);
	readonly _clipboard = store<VehicleSettings | null>(null);

	_isOpen?: boolean; // todo merge??

	constructor(selection: SelectionViewModel)
	{
		this._selection = selection;
		this._editor = new EditorViewModel(selection);
	}


	/**
	 * Toggle the vehicle picker on or off.
	 */
	_setPicker(active: boolean, onSelect?: () => void): void
	{
		this._isPicking.set(active);
		toggleVehiclePicker(
			active,
			car =>
			{
				if (onSelect)
				{
					onSelect();
				}
				this._selection._setFromCar(car);
			},
			() => this._isPicking.set(false)
		);
	}

	/**
	 * Toggle the vehicle dragger on or off.
	 */
	_setDragger(active: boolean): void
	{
		if (this._isOpen)
		{
			this._isDragging.set(active);
			// todo uncomment
			//toggleVehicleDragger(active, this._selection._vehicle, this._x, this._y, this._z, this._trackLocation, this._trackProgress, () => this._isDragging.set(false));
		}
	}

	/**
	 * Copies the currently selected vehicle to the clipboard, or clears clipboard.
	 */
	_copy(active: boolean): void
	{
		if (this._isOpen)
		{
			const vehicle = this._selection._vehicle.get();
			this._clipboard.set((active && vehicle) ? getVehicleSettings(vehicle[0], CopyFilter.All) : null);
		}
	}

	/**
	 * Pastes the vehicle settings on the clipboard to the currently selected vehicle.
	 */
	_paste(): void
	{
		if (!this._isOpen)
		{
			return;
		}

		const vehicle = this._selection._vehicle.get();
		const settings = this._clipboard.get();
		if (vehicle && settings)
		{
			applyToTargets(settings, [[vehicle[0]._id, 1]]);
		}
	}
	/**
	 * Locates the currently selected vehicle on the main viewport.
	 */
	_locate(): void
	{
		const vehicle = this._selection._vehicle.get();
		if (this._isOpen && vehicle)
		{
			locate(vehicle[0]);
		}
	}
}
