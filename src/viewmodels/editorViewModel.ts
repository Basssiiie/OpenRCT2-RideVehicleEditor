/* eslint-disable @typescript-eslint/no-extraneous-class */
import { compute, OpenWindow, store, WritableStore } from "openrct2-flexui";
import { NamingViewModel } from "./namingViewModel";
import { PositionalViewModel } from "./positionalViewModel";
import { PropertiesViewModel } from "./propertiesViewModel";
import { RideViewModel } from "./rideViewModel";
import { SelectionViewModel } from "./selectionViewModel";
import { StylingViewModel } from "./stylingViewModel";
import { SynchronizationViewModel } from "./synchronizationViewModel";
import { TabViewModel } from "./tabViewModel";
import { refreshVehicle, watch } from "../services/events";
import * as Log from "../utilities/logger";


export class EditorViewModel
{
	readonly _selection;

	readonly _styling;
	readonly _positional;
	readonly _properties;
	readonly _ride;
	readonly _naming;

	readonly _multiplierIndex;
	readonly _multiplier;

	private readonly _window;
	private readonly _tabs: TabViewModel[];

	private readonly _onVehicleSelect;
	private readonly _onVehicleUpdated;
	private readonly _onGameTick;

	private _currentTab!: number;

	constructor(window: WritableStore<OpenWindow | null>, selection: SelectionViewModel, synchronization: SynchronizationViewModel)
	{
		const styling = new StylingViewModel(synchronization);
		const positional = new PositionalViewModel(selection, synchronization, styling);
		const properties = new PropertiesViewModel(selection, synchronization, styling);
		const ride = new RideViewModel(selection);
		const naming = new NamingViewModel(selection);
		const multiplierIndex = store<number>(0);
		const selectedVehicle = selection._vehicle;
		const selectedRide = selection._ride.get();

		this._window = window;
		this._tabs = [styling, positional, properties, ride, naming];
		this._selection = selection;
		this._styling = styling;
		this._positional = positional;
		this._properties = properties;
		this._ride = ride;
		this._naming = naming;

		this._multiplierIndex = multiplierIndex;
		this._multiplier = compute(multiplierIndex, idx => (10 ** idx));
		this._naming._name.set(selectedRide ? selectedRide[0]._ride().name : "<unknown ride>");

		if (selectedVehicle.get())
		{
			this._tabChange(0);
		}
		else
		{
			this._tabChange(3); // todo: figure out how to default to the ride tab
			//this._window.get().setTab(3);
		}

		this._onVehicleSelect = selectedVehicle.subscribe(vehicle =>
		{
			if (vehicle)
			{
				this._updateTab(true);
			}
		});
		this._onVehicleUpdated = watch(refreshVehicle, (id: number) =>
		{
			const vehicle = selectedVehicle.get();
			if (vehicle && vehicle[0]._id === id)
			{
				this._updateTab(true);
			}
			Log.debug("[VehicleViewModel] Refresh of vehicle:", id, (vehicle && vehicle[0]._id === id) ? "(selected)" : "(not selected)");
		});
		this._onGameTick = context.subscribe("interval.tick", this._updateTab.bind(this));
	}

	_tabChange(index: number): void
	{
		const tabs = this._tabs;
		const oldTab = tabs[this._currentTab];
		const newTab = tabs[index];

		if (oldTab && oldTab._close)
		{
			oldTab._close();
		}
		if (newTab && newTab._open)
		{
			newTab._open();
		}

		this._currentTab = index;
	}

	_close(): void
	{
		this._window.set(null);
		this._onVehicleSelect();
		this._onVehicleUpdated();
		this._onGameTick.dispose();
	}

	private _updateTab(full?: boolean): void
	{
		const tab = this._tabs[this._currentTab];
		if (tab._updateVehicle)
		{
			const vehicle = this._selection._vehicle.get();
			if (vehicle)
			{
				tab._updateVehicle(vehicle[0]._car(), vehicle[1], full);
			}
		}
		if (full && tab._updateRide)
		{
			const ride = this._selection._ride.get();
			if (ride)
			{
				tab._updateRide(ride[0]._ride(), full);
			}
		}
	}
}

