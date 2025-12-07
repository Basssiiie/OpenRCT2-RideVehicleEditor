import { compute, OpenWindow, store, WritableStore } from "openrct2-flexui";
import { SelectionViewModel } from "./selectionViewModel";
import { applyToTargets, CopyFilter, CopyOptions, getTargets, getVehicleSettings, VehicleSettings } from "../services/vehicleCopier";
import * as Log from "../utilities/logger";
import { VehicleSpan } from "../services/vehicleSpan";


export class SynchronizationViewModel
{
	readonly _copyFilters = store(CopyFilter.Default);
	readonly _copyTargetOption = store<CopyOptions>(0);
	readonly _synchronizeTargets = store<boolean>(false);
	readonly _clipboard = store<VehicleSettings | null>(null);

	readonly _copyTargets;

	private readonly _window;
	private readonly _selection;

	constructor(window: WritableStore<OpenWindow | null>, selection: SelectionViewModel)
	{
		Log.debug("Synchronization window opened");
		this._window = window;
		this._selection = selection;

		this._copyTargets = compute(this._copyTargetOption, selection._vehicle, (o, v) => getTargets(o, selection._ride.get(), selection._train.get(), v));
	}

	_close()
	{
		this._window.set(null);
	}

	/**
	 * Toggle a filter on or off.
	 */
	_setFilter(filter: CopyFilter, toggle: boolean): void
	{
		const enabledFilters = this._copyFilters.get();

		this._copyFilters.set((toggle)
			? (enabledFilters | filter)
			: (enabledFilters & ~filter));
	}

	/**
	 * Attempt to modify the vehicle with the specified action, if a vehicle is selected.
	 */
	_modify<T>(action: (vehicles: VehicleSpan[], value: T) => void, value: T, filter: CopyFilter): void
	{
		// if (this._isRefreshing)
		// {
		// 	Log.debug("Vehicle modify ignored, is refreshing!");
		// 	return;
		// }
		const vehicle = this._selection._vehicle.get();
		if (vehicle)
		{
			// Only apply if action matches filter.
			if (this._synchronizeTargets.get() && (!filter || ((this._copyFilters.get() || CopyFilter.All) & filter)))
			{
				action(this._copyTargets.get(), value);
			}
			else
			{
				action([[vehicle[0]._id, 1]], value);
			}
		}
		else
		{
			// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
			Log.debug("Failed to modify vehicle with", (<any>action).name, "to", value, "; none is selected.");
		}
	}

	/**
	 * Apply settings of current vehicle to other vehicles in the ride.
	 */
	_applySelectedSettings(): void
	{
		const selection = this._selection;
		const vehicle = selection._vehicle.get();
		if (vehicle)
		{
			applyToTargets(
				getVehicleSettings(vehicle[0], this._copyFilters.get()),
				getTargets(this._copyTargetOption.get(), selection._ride.get(), selection._train.get(), vehicle)
			);
		}
	}
}
