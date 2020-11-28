import { getRidesInPark, ParkRide, RideTrain, RideVehicle } from "../helpers/ridesInPark";
import { error, log, wrap } from "../helpers/utilityHelpers";
import VehicleEditorWindow from "../ui/editorWindow";


/**
 * Service that allows to select a single vehicle in the park.
 */
export class VehicleSelector
{
	private _parkRides: ParkRide[];
	private _rideTrains!: RideTrain[];
	private _trainVehicles!: RideVehicle[];


	/**
	 * Gets the currently selected ride index.
	 */
	get rideIndex(): number
	{
		return this._selectedRideIndex;
	}
	private _selectedRideIndex: number = 0;


	/**
	 * Gets the currently selected train index.
	 */
	get trainIndex(): number
	{
		return this._selectedTrainIndex;
	}
	private _selectedTrainIndex: number = 0;


	/**
	 * Gets the currently selected vehicle index.
	 */
	get vehicleIndex(): number
	{
		return this._selectedVehicleIndex;
	}
	private _selectedVehicleIndex: number = 0;


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
	}


	/**
	 * Select a ride from the list in the park.
	 * 
	 * @param rideIndex The index into the ride list.
	 */
	selectRide(rideIndex: number)
	{
		this._selectedRideIndex = rideIndex;

		if (this._parkRides && this._parkRides.length > 0)
		{
			const parkRide = this._parkRides[rideIndex];
			log(`(selector) Selected ride ${parkRide.name} (index: ${rideIndex})`);

			this._rideTrains = parkRide.getTrains();

			this.window.setTrainList(this._rideTrains);
			this.window.trainList.set(0);
		}
		else
		{
			error("This park has no rides.", "selectRide");
			this.window.setTrainList(null);
			this.window.setVehicleList(null);
			this.window.setEditor(null);
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
			this._selectedTrainIndex = trainIndex;

			const train = this._rideTrains[trainIndex];
			this._trainVehicles = train.getVehicles();

			this.window.setVehicleList(this._trainVehicles);
			this.window.vehicleList.set(0);
		}
		else
		{
			this._selectedTrainIndex = 0;

			error("This ride has no trains.", "selectTrain");
			this.window.setVehicleList(null);
			this.window.setEditor(null);
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
			this._selectedVehicleIndex = vehicleIndex;

			const vehicle = this._trainVehicles[vehicleIndex];
			this.window.setEditor(vehicle);
		}
		else
		{
			this._selectedVehicleIndex = 0;

			error("This train has no vehicles.", "selectVehicle");
			this.window.setEditor(null);
		}
	}
}
