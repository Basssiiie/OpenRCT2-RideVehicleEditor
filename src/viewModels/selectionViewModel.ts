import Log from "../helpers/logger";
import { getRidesInPark, ParkRide, RideTrain, RideVehicle } from "../helpers/ridesInPark";
import Array from "../helpers/array";
import Observable from "../ui/framework/observable";


/**
 * Viewmodel that keeps track of the currently selected vehicle.
 */
export default class SelectionViewModel
{
	readonly rideList = new Observable<string[]>();
	readonly selectedRide = new Observable<number | null>(null);

	readonly trainList = new Observable<string[]>();
	readonly selectedTrain = new Observable<number | null>(null);

	readonly vehicleList = new Observable<string[]>();
	readonly selectedVehicle = new Observable<number | null>(null);


	private _ridesInPark: ParkRide[] | null = null;
	private _rideTrains: RideTrain[] | null = null;
	private _trainVehicles: RideVehicle[] | null = null;


	/**
	 * Viewmodel that keeps track of the currently selected vehicle.
	 */
	constructor()
	{
		this.selectedRide.subscribe(v => 
		{
			if (this._ridesInPark && v !== null)
			{
				Log.debug(`(selection) Selected ride ${v}`);
				this._rideTrains = this._ridesInPark[v].getTrains();
				this.trainList.set(this._rideTrains.map((_, i) => `Train ${i + 1}`));
				this.selectedTrain.set(0);
			}
		});
		this.selectedTrain.subscribe(v => 
		{
			if (this._rideTrains && v !== null)
			{
				Log.debug(`(selection) Selected train ${v}`);
				this._trainVehicles = this._rideTrains[v].getVehicles();
				this.vehicleList.set(this._trainVehicles.map((_, i) => `Vehicle ${i + 1}`));
				this.selectedVehicle.set(0);
			}
		});

		this.reloadRideList();
	}


	/**
	 * Reloads the list with rides in the park.
	 */
	reloadRideList()
	{
		Log.debug("(selection) Reload the list of rides in the park.");

		const currentlySelectedRide = Array.getAtIndex(this._ridesInPark, this.selectedRide.get());
		Log.debug(`(selection) Currently selected: ${currentlySelectedRide}`)

		this._ridesInPark = getRidesInPark();
		this.rideList.set(this._ridesInPark.map(r => r.name));

		if (currentlySelectedRide === null)
		{
			this.selectedRide.set(0);
			return;
		}

		const currentlySelectedRideId = currentlySelectedRide.rideId;
		const newSelectionIndex = Array.findIndex(this._ridesInPark, i => i.rideId === currentlySelectedRideId);
		
		this.selectedRide.set(newSelectionIndex);
	}


	/**
	 * Gets the currently selected vehicle in the game.
	 * 
	 * @returns An instance of Car.
	 */
	getCar(): Car
	{
		const currentlySelectedVehicle = Array.getAtIndex(this._trainVehicles, this.selectedVehicle.get());

		if (currentlySelectedVehicle === null)
		{
			throw "No ride selected!";
		}

		return currentlySelectedVehicle.getCar();
	}
}