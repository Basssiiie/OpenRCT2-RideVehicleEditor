import { store } from "openrct2-flexui";
import * as Log from "../utilities/logger";
import { VehicleLoadSettings } from "../services/vehicleLoader";
import { ParkRide } from "../objects/parkRide";
import { forEachVehicle, VehicleSpan } from "../services/vehicleSpan";
import { getAllRideVehicles } from "../services/vehicleCopier";

const storage = context.getParkStorage("OpenRCT2-RideVehicleEditor");

export class VehiclePickerModel
{
    readonly _selectedSave = store<[VehicleLoadSettings[], number]>(); // value, index in _saves
    readonly _saves = store<[string, VehicleLoadSettings[]][]>([]); // storage key, value array

    readonly _ride = store<ParkRide | null>(null);
    readonly _rideVehicles = store<VehicleSpan[]>([]);

    // private _isOpen?: boolean;

    constructor()
	{
        this._ride.subscribe(() => {
            this._rideVehicles.set(this._allRideVehicles());
        });
    }

    _allRideVehicles(): VehicleSpan[]
    {
        const r = this._ride.get();
        return (r) ? getAllRideVehicles([r,0]) : [];
    }

	_open(): void
	{
        Log.debug("[VehiclePickerModel] Window opened!");
        // this._isOpen = true;
        this._updateSaves();
	}

	_close(): void
	{
		Log.debug("[VehiclePickerModel] Window closed!");
        // this._isOpen = false;
	}

    _updateSaves(): void
    {
        this._saves.set(getSavedVehicles());
        this._selectedSave.set(undefined);
    }

    _select(saveIdx: number): void
    {
        const saves = this._saves.get();
        this._selectedSave.set([saves[saveIdx][1], saveIdx]);
    }

    _selectByKey(saveKey: string): void
    {
        const index = this._findByKey(saveKey);
        if (index !== -1) {
            this._select(index);
        } else {
            Log.debug(`[VehiclePickerModel] Save key ${saveKey} not found!`);
        }
    }

    _findByKey(saveKey: string): number
    {
        const saves = this._saves.get();
        for (let i = 0; i < saves.length; i++) {
            if (saves[i][0] === saveKey) {
                return i;
            }
        }
        return -1;
    }

    _createSave(name: string): void
    {
        const save : VehicleLoadSettings[] = [];
        forEachVehicle(this._rideVehicles.get(), car => {
            const vehicleLoadSettings: VehicleLoadSettings = {
                trackLocation: car.trackLocation,
                trackProgress: car.trackProgress,
            };

            // Push the VehicleLoadSettings object into the save array
            save.push(vehicleLoadSettings);
        });
        console.log("saving", save);
        const newKey = "savedVehicles." + name;
        storage.set(newKey, save);
        this._updateSaves();
    }

    _deleteSelected(): void
    {
        const selected = this._selectedSave.get();
        if (selected === undefined) {
            Log.debug("[VehiclePickerModel] Delete target is not set!");
            return;
        }

        const storageKey = this._saves.get()[selected[1]][0];
        storage.set(storageKey, undefined);
        this._updateSaves();
    }

    _renameSelected(newName: string): void
    {
        const selected = this._selectedSave.get();
        if (selected === undefined) {
            Log.debug("[VehiclePickerModel] Rename target is not set!");
            return;
        }

        const storageKey = this._saves.get()[selected[1]][0];
        const newKey = "savedVehicles." + newName;
        storage.set(storageKey, undefined);
        storage.set(newKey, selected[0]);

        // Reselect old entry by new storage key
        this._updateSaves();
        this._selectByKey(newKey);
    }
}

function getSavedVehicles(): [string, VehicleLoadSettings[]][] {
    const saves = storage.getAll("savedVehicles");
    return Object.keys(saves).map(key => [key, saves[key]]);
}
