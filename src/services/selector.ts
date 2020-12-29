import { getRidesInPark, ParkRide, RideTrain, RideVehicle } from "../helpers/ridesInPark";
import { error, isValidIndex, log } from "../helpers/utilityHelpers";
import VehicleEditorWindow from "../ui/editorWindow";


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
		return (isValidIndex(this._parkRides, this._selectedRideIndex))
			? this._parkRides[this._selectedRideIndex] : null;
	}
	private _selectedRideIndex: number = -1;


	/**
	 * Returns the currently selected train, if any was selected.
	 */
	get selectedTrain(): (RideTrain | null)
	{
		return (isValidIndex(this._rideTrains, this._selectedTrainIndex))
			? this._rideTrains![this._selectedTrainIndex] : null;
	}
	private _selectedTrainIndex: number = -1;


	/**
	 * Returns the currently selected vehicle, if any was selected.
	 */
	get selectedVehicle(): (RideVehicle | null)
	{
		return (isValidIndex(this._trainVehicles, this._selectedVehicleIndex))
			? this._trainVehicles![this._selectedVehicleIndex] : null;
	}
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
		this.selectRide(0);

		window.ridesInParkList.onSelect = (i => this.selectRide(i));
		window.trainList.onSelect = (i => this.selectTrain(i));
		window.vehicleList.onSelect = (i => this.selectVehicle(i));
	}


	/**
	 * Reloads the list with rides in the park.
	 */
	reloadRideList()
	{
		log("(selector) Reloaded the list of rides in the park.");
		const currentRideId = this.selectedRide?.rideId;

		this._parkRides = getRidesInPark();
		this.window.setRideList(this._parkRides);

		if (currentRideId && currentRideId !== this.selectedRide?.rideId)
		{
			// Ride index has changed; find the new index.
			for (let i = 0; i < this._parkRides.length; i++)
			{
				if (currentRideId === this._parkRides[i].rideId)
				{
					this._selectedRideIndex = i;
					this.window.ridesInParkList.set(i);
					return;
				}
			}
			this.selectRide(0);
		}
	}


	/**
	 * Select a ride from the list in the park.
	 * 
	 * @param rideIndex The index into the ride list.
	 */
	selectRide(rideIndex: number)
	{
		if (this._parkRides && this._parkRides.length > 0)
		{
			this._selectedRideIndex = rideIndex;

			const parkRide = this._parkRides[rideIndex];
			log(`(selector) Selected ride ${parkRide.name} (index: ${rideIndex})`);

			this._rideTrains = parkRide.getTrains();
			this.window.setTrainList(this._rideTrains);
			this.window.trainList.set(0);

			this.selectTrain(0);
		}
		else
		{
			error("This park has no rides.", "selectRide");
			this._selectedRideIndex = -1;
			this.deselect();
		}
	}


	/**
	 * Selects a train from the list of trains of the selected ride.
	 * 
	 * @param trainIndex The index of the train in the train list.
	 */
	selectTrain(trainIndex: number)
	{
		log(`(selector) Selected train at index: ${trainIndex}`);
		if (this._rideTrains && this._rideTrains.length > 0)
		{
			this._selectedTrainIndex = trainIndex;

			const train = this._rideTrains[trainIndex];
			this._trainVehicles = train.getVehicles();

			this.window.setVehicleList(this._trainVehicles);
			this.window.vehicleList.set(0);
			this.selectVehicle(0);
		}
		else
		{
			error("This ride has no trains.", "selectTrain");
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
		log(`(selector) Selected vehicle at index ${vehicleIndex}`);
		if (this._trainVehicles && this._trainVehicles.length > 0)
		{
			this._selectedVehicleIndex = vehicleIndex;

			const vehicle = this._trainVehicles[vehicleIndex];
			if (this.onSelect)
			{
				this.onSelect(vehicle);
			}
		}
		else
		{
			error("This train has no vehicles.", "selectVehicle");
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
			log(`(selector) Reselection failed; no ride selected.`);
			return;
		}

		log(`(selector) Reselect current ride '${ride.name}'.`);

		const trainIndex = this._selectedTrainIndex;
		const vehicleIndex = this._selectedVehicleIndex;

		this._rideTrains = ride.getTrains();

		// Check if this train still exists.
		if (!isValidIndex(this._rideTrains, trainIndex))
		{
			log(`(selector) Reselection failed; selected train is gone.`);
			this.deselect();
			return;
		}

		this.window.setTrainList(this._rideTrains);
		this.window.trainList.set(trainIndex);

		const train = this._rideTrains[trainIndex];
		this._trainVehicles = train.getVehicles();

		// Check if this vehicle still exists.
		if (!isValidIndex(this._trainVehicles, vehicleIndex))
		{
			log(`(selector) Reselection failed; selected vehicle is gone.`);
			this.deselect();
			return;
		}

		this.window.setVehicleList(this._trainVehicles);
		this.window.vehicleList.set(vehicleIndex);

		this.selectVehicle(vehicleIndex);
	}
}
