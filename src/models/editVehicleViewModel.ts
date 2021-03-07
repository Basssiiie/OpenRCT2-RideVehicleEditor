import Observable from "../ui/framework/observable";


/**
 * Viewmodel that allows modifications to the current vehicle.
 */
export default class EditVehicleViewModel
{
	readonly position = new Observable<CoordsXYZ>();
	readonly rideTypeList = new Observable<string[]>();
	readonly rideType = new Observable<number>();

	readonly variant = new Observable<number>();
	readonly trackProgress = new Observable<string[]>();
	readonly seatCount = new Observable<number>();
	readonly mass = new Observable<string[]>();
	readonly poweredAcceleration = new Observable<number>();
	readonly poweredMaxSpeed = new Observable<number>();
}