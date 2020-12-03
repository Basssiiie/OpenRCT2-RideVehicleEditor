import { getRidesInPark, ParkRide, RideTrain, RideVehicle } from "../helpers/ridesInPark";
import { error, log, wrap } from "../helpers/utilityHelpers";
import VehicleEditorWindow from "../ui/editorWindow";


/**
 * Service that allows to select a single vehicle in the park.
 */
export default class VehicleSelector
{
	/**
	 * Returns the currently selected vehicle, if any was selected.
	 */
	get selectedVehicle(): (RideVehicle | null)
	{
		return this._selectedVehicle;
	}
	private _selectedVehicle: (RideVehicle | null) = null;


	/**
	 * Triggers when a new vehicle is selected.
	 */
	onSelect?: (vehicle: RideVehicle | null) => void;


	private _parkRides: ParkRide[];
	private _rideTrains!: RideTrain[];
	private _trainVehicles!: RideVehicle[];


	/**
	 * Create a new selector service that updates the specified window.
	 * 
	 * @param window A vehicle editor window that should be updated according
	 * to the items that are selected.
	 */
	constructor(readonly window: VehicleEditorWindow)
	{
		this._parkRides = getRidesInPark();
		window.setRideList(this._parkRides);

		this.selectRide(0);

		window.ridesInParkList.onSelect = (i => this.selectRide(i));
		window.trainList.onSelect = (i => this.selectTrain(i));
		window.vehicleList.onSelect = (i => this.selectVehicle(i));
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
			this.window.setTrainList(null);
			this.window.setVehicleList(null);
			this.setSelectionToNull();
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
			trainIndex = wrap(trainIndex, this._rideTrains.length);

			const train = this._rideTrains[trainIndex];
			this._trainVehicles = train.getVehicles();

			this.window.setVehicleList(this._trainVehicles);
			this.window.vehicleList.set(0);
			this.selectVehicle(0);
		}
		else
		{
			error("This ride has no trains.", "selectTrain");
			this.window.setVehicleList(null);
			this.setSelectionToNull();
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
			vehicleIndex = wrap(vehicleIndex, this._trainVehicles.length);

			const vehicle = this._trainVehicles[vehicleIndex];
			this._selectedVehicle = vehicle;

			if (this.onSelect)
			{
				this.onSelect(vehicle);
			}

		}
		else
		{
			error("This train has no vehicles.", "selectVehicle");
			this.setSelectionToNull();
		}
	}


	/**
	 * Disables the editor controls and sets the selected vehicle to null.
	 */
	private setSelectionToNull()
	{
		this._selectedVehicle = null;
		this.window.disableEditorControls();

		if (this.onSelect)
		{
			this.onSelect(null);
		}
	}
}
