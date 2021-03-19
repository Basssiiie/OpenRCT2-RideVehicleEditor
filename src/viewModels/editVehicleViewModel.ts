import Array from "../helpers/array";
import Log from "../helpers/logger";
import { getAvailableRideTypes, RideType } from "../helpers/rideTypes";
import Observable from "../ui/framework/observable";
import SelectionViewModel from "./selectionViewModel";


// The distance of a single step for moving the vehicle.
const moveDistanceStep = 9_000;


/**
 * Viewmodel that allows modifications to the current vehicle.
 */
export default class EditVehicleViewModel
{
	readonly position = new Observable<CoordsXYZ>();
	readonly rideTypeList = new Observable<string[]>();
	readonly rideType = new Observable<number>();

	readonly variant = new Observable<number>();
	readonly trackProgress = new Observable<number>();
	readonly seatCount = new Observable<number>();
	readonly mass = new Observable<number>();
	readonly poweredAcceleration = new Observable<number>();
	readonly poweredMaxSpeed = new Observable<number>();

	readonly multiplier = new Observable<number>();


	//private readonly _selection: SelectionViewModel;
	private _rideTypes: RideType[] | null = null;


	constructor(selection: SelectionViewModel)
	{
		//this._selection = selection;

		this.rideType.subscribe(v => 
		{
			if (this._rideTypes)
			{
				selection.getCar().rideObject = this._rideTypes[v].rideIndex;
				this.variant.set(0);
			}
		});
		this.variant.subscribe(v => 
		{
			const car = selection.getCar();
			car.vehicleObject = v;
			this.setPropertiesToDefaultOfType(car, v);
		});
		this.trackProgress.subscribe(v => 
		{
			const car = selection.getCar();
			car.travelBy((v - this.trackProgress.get()) * moveDistanceStep);
			this.position.set({ x: car.x, y: car.y, z: car.z });
		});
		
		this.seatCount.subscribe(v => selection.getCar().numSeats = v);
		this.mass.subscribe(v => selection.getCar().mass = v);
		this.poweredAcceleration.subscribe(v => selection.getCar().poweredAcceleration = v);
		this.poweredMaxSpeed.subscribe(v => selection.getCar().poweredMaxSpeed = v);

		selection.selectedVehicle.subscribe(_ => 
		{
			Log.debug(`(edit) Update editor with new vehicle...`)
			const car = selection.getCar();
			this.variant.set(car.vehicleObject);
			this.trackProgress.set(car.trackProgress);
			this.seatCount.set(car.numSeats);
			this.mass.set(car.mass);
			this.poweredAcceleration.set(car.poweredAcceleration);
			this.poweredMaxSpeed.set(car.poweredMaxSpeed);
		});

		this.reloadRideTypes();
	}


	/**
	 * Reload the list of ride types.
	 */
	reloadRideTypes()
	{
		Log.debug("(edit) Reload the list of rides types available.");

		this._rideTypes = getAvailableRideTypes();
		this.rideTypeList.set(this._rideTypes.map(r => r.name));
	}


	/**
	 * Sets the properties of the specified car to the default properties of the
	 * specified ride type.
	 * 
	 * @param rideType The ride type.
	 * @param variant The vehicle variant to take the properties from.
	 */
	private setPropertiesToDefaultOfType(car: Car, variant: number)
	{
		Log.debug("(edit) All car properties have been reset to the default value.");
 
		const rideType = Array.getAtIndex(this._rideTypes, this.rideType.get());
		if (rideType === null)
		{
			throw `Invalid ride type index: ${this.rideType.get()}`
		}

		// Set all properties according to definition.
		const rideObject = rideType.getDefinition();
		const vehicleType = rideObject.vehicles[variant];
 
		this.seatCount.set(vehicleType.numSeats);
		this.poweredAcceleration.set(vehicleType.poweredAcceleration);
		this.poweredMaxSpeed.set(vehicleType.poweredMaxSpeed);
 
		// Recalculate mass with peeps.
		let newTotalMass = vehicleType.carMass;
		for (let i = 0; i < car.peeps.length; i++)
		{
			const peepId = car.peeps[i];
			if (peepId != null)
			{
				const peep = map.getEntity(peepId) as Guest;
				if (peep)
				{
					newTotalMass += peep.mass;
				}
			}
		}
		this.mass.set(newTotalMass);
	}
}