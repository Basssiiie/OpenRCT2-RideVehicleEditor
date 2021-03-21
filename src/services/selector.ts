import ArrayHelper from "../helpers/arrayHelper";
import Log from "../helpers/logger";
import { getRidesInPark, ParkRide, RideTrain, RideVehicle } from "../helpers/ridesInPark";
import { clamp } from "../helpers/utilityHelpers";
import VehicleEditorWindow from "../ui/editorWindow";


// Records of the last selected ride, train and vehicle, for restoring
// after the window is reopened again.
let lastSelectedRideId: number;
let lastSelectedTrainIndex: number;
let lastSelectedVehicleIndex: number;


/**
 * Service that allows to select a single vehicle in the park.
 */
export default class VehicleSelector
{
	/**
	 * Returns the currently selected ride, if any was selected.
	 */
	get selectedRide(): (ParkRide | null)
	{
		return ArrayHelper.getAtIndex(this._parkRides, this._selectedRideIndex);
	}
	// Index into the 'parkRides' array for the selected ride.
	private _selectedRideIndex: number = -1;


	/**
	 * Returns the currently selected train, if any was selected.
	 */
	get selectedTrain(): (RideTrain | null)
	{
		return ArrayHelper.getAtIndex(this._rideTrains, this._selectedTrainIndex);
	}
	// Index into the 'rideTrains' array for the selected train.
	private _selectedTrainIndex: number = -1;


	/**
	 * Returns the currently selected vehicle, if any was selected.
	 */
	get selectedVehicle(): (RideVehicle | null)
	{
		return ArrayHelper.getAtIndex(this._trainVehicles, this._selectedVehicleIndex);
	}
	// Index into the 'trainVehicles' array for the selected vehicle.
	private _selectedVehicleIndex: number = -1;


	/**
	 * Triggers when a new vehicle is selected.
	 */
	onSelect?: (vehicle: RideVehicle | null) => void;


	private _parkRides!: ParkRide[];
	private _rideTrains: (RideTrain[] | null) = null;
	private _trainVehicles: (RideVehicle[] | null) = null;


	/**
	 * Create a new selector service that updates the specified window.
	 * 
	 * @param window A vehicle editor window that should be updated according
	 * to the items that are selected.
	 */
	constructor(readonly window: VehicleEditorWindow)
	{
		this.reloadRideList();

		// Restore last selected ride, train and vehicle.
		const rideIndex = this.findRideIndexFromRideId(lastSelectedRideId);
		if (rideIndex !== null)
		{
			Log.debug("(selector) Restore previous selection succesfull.");
			this.window.ridesInParkList.set(rideIndex);
			this.selectRide(rideIndex, lastSelectedTrainIndex, lastSelectedVehicleIndex);
		}
		else
		{
			// Not found, select first available ride.
			Log.debug("(selector) Restore selection failed: ride not found.");
			this.selectRide(0);
		}

		window.ridesInParkList.onSelect = (i => this.selectRide(i));
		window.trainList.onSelect = (i => this.selectTrain(i));
		window.vehicleList.onSelect = (i => this.selectVehicle(i));
	}


	/**
	 * Reloads the list with rides in the park.
	 */
	reloadRideList()
	{
		Log.debug("(selector) Reloaded the list of rides in the park.");
		const currentRideId = this.selectedRide?.rideId;

		this._parkRides = getRidesInPark();
		this.window.setRideList(this._parkRides);

		if (currentRideId && currentRideId !== this.selectedRide?.rideId)
		{
			// Ride index has changed; find the new index.
			const rideIndex = this.findRideIndexFromRideId(currentRideId);

			if (rideIndex === null)
			{
				// Not found, reset to ride at index 0.
				this.selectRide(0);
				return;
			}

			// Only need to update the dropdown, rest of UI needs no refresh.
			this._selectedRideIndex = rideIndex;
			this.window.ridesInParkList.set(rideIndex);
		}
	}


	/**
	 * Select a ride from the list in the park.
	 * 
	 * @param rideIndex The index into the ride list.
	 * @param trainIndex The index of the train in the train list.
	 * @param vehicleIndex The index of the vehicle in the vehicle list.
	 */
	selectRide(rideIndex: number, trainIndex: number = 0, vehicleIndex: number = 0)
	{
		if (this._parkRides && this._parkRides.length > 0)
		{
			this._selectedRideIndex = rideIndex = clamp(rideIndex, 0, this._parkRides.length);

			const parkRide = this._parkRides[rideIndex];
			Log.debug(`(selector) Selected ride ${parkRide.name} (index: ${rideIndex})`);

			this._rideTrains = parkRide.getTrains();
			this.selectTrain(trainIndex, vehicleIndex);
			
			this.window.setTrainList(this._rideTrains);
			this.window.trainList.set(this._selectedTrainIndex);
			lastSelectedRideId = parkRide.rideId;
		}
		else
		{
			Log.debug("(selector) This park has no rides.");
			this._selectedRideIndex = -1;
			this.deselect();
		}
	}


	/**
	 * Selects a train from the list of trains of the selected ride.
	 * 
	 * @param trainIndex The index of the train in the train list.
	 * @param vehicleIndex The index of the vehicle in the vehicle list.
	 */
	selectTrain(trainIndex: number, vehicleIndex: number = 0)
	{
		Log.debug(`(selector) Selected train at index: ${trainIndex}`);

		if (this._rideTrains && this._rideTrains.length > 0)
		{
			this._selectedTrainIndex = trainIndex = clamp(trainIndex, 0, this._rideTrains.length);

			const train = this._rideTrains[trainIndex];
			this._trainVehicles = train.getVehicles();

			this.selectVehicle(vehicleIndex);

			this.window.setVehicleList(this._trainVehicles);
			this.window.vehicleList.set(this._selectedVehicleIndex);			
			lastSelectedTrainIndex = trainIndex;
		}
		else
		{
			Log.debug("(selector) This ride has no trains.");
			this.deselect();
		}
	}


	/**
	 * Selects a vehicle from the list of vehicles of the selected train.
	 * 
	 * @param vehicleIndex The index of the vehicle in the vehicle list.
	 */
	selectVehicle(vehicleIndex: number)
	{
		Log.debug(`(selector) Selected vehicle at index ${vehicleIndex}`);
		if (this._trainVehicles && this._trainVehicles.length > 0)
		{
			this._selectedVehicleIndex = vehicleIndex = clamp(vehicleIndex, 0, this._trainVehicles.length);

			const vehicle = this._trainVehicles[vehicleIndex];
			if (this.onSelect)
			{
				this.onSelect(vehicle);
			}
			
			lastSelectedVehicleIndex = vehicleIndex;
		}
		else
		{
			Log.debug("(selector) This train has no vehicles.");
			this.deselect();
		}
	}


	/**
	 * Disables the editor controls and sets the selected train and vehicle to null.
	 */
	deselect()
	{
		this._rideTrains = null;
		this._trainVehicles = null;

		this.window.setTrainList(null);
		this.window.setVehicleList(null);
		this.window.disableEditorControls();

		if (this.onSelect)
		{
			this.onSelect(null);
		}
	}


	/**
	 * Refreshes the currently selected ride, train and vehicle.
	 */
	refresh()
	{
		const ride = this.selectedRide;

		if (!ride)
		{
			Log.debug(`(selector) Reselection failed; no ride selected.`);
			return;
		}

		Log.debug(`(selector) Reselect current ride '${ride.name}'.`);

		let trainIndex = this._selectedTrainIndex;
		let vehicleIndex = this._selectedVehicleIndex;

		this._rideTrains = ride.getTrains();

		// Check if this train still exists.
		if (!ArrayHelper.isValidIndex(this._rideTrains, trainIndex))
		{
			Log.debug(`(selector) Reselection failed; selected train ${trainIndex} is gone, set to train 0.`);
			trainIndex = 0;
		}

		this.window.setTrainList(this._rideTrains);
		this.window.trainList.set(trainIndex);

		const train = this._rideTrains[trainIndex];
		this._trainVehicles = train.getVehicles();

		// Check if this vehicle still exists.
		if (!ArrayHelper.isValidIndex(this._trainVehicles, vehicleIndex))
		{
			Log.debug(`(selector) Reselection failed; selected vehicle ${vehicleIndex} is gone, set to vehicle 0.`);
			vehicleIndex = 0;
		}

		this.window.setVehicleList(this._trainVehicles);
		this.window.vehicleList.set(vehicleIndex);

		this.selectVehicle(vehicleIndex);
	}


	/**
	 * Finds the index into the 'parkRides' array for the specified ride id.
	 * 
	 * @param rideId The id of the ride in the loaded park.
	 */
	private findRideIndexFromRideId(rideId: number): number | null
	{
		for (let i = 0; i < this._parkRides.length; i++)
		{
			if (rideId === this._parkRides[i].rideId)
			{
				return i;
			}
		}
		return null;
	}
}
