import Observable from "../ui/framework/observable";


/**
 * Viewmodel that keeps track of the currently selected vehicle.
 */
export default class SelectionViewModel
{
	readonly rideList = new Observable<string[]>();
	readonly selectedRide = new Observable<number>();

	readonly trainList = new Observable<string[]>();
	readonly selectedTrain = new Observable<number>();

	readonly vehicleList = new Observable<string[]>();
	readonly selectedVehicle = new Observable<number>();
}