import { compute, store } from "openrct2-flexui";
import { setMass, setPoweredAcceleration, setSeatCount } from "../services/vehicleEditor";
import { CopyFilter } from "../services/vehicleCopier";
import { SynchronizationViewModel } from "./synchronizationViewModel";
import { SelectionViewModel } from "./selectionViewModel";
import { StylingViewModel } from "./stylingViewModel";
import { TabViewModel } from "./tabViewModel";


export class PropertiesViewModel implements TabViewModel
{
	readonly _seats = store<number>(0);
	readonly _mass = store<number>(0);
	readonly _poweredAcceleration = store<number>(0);
	readonly _poweredMaxSpeed = store<number>(0);

	readonly _isUnpowered;

	private readonly _synchronization: SynchronizationViewModel;

	constructor(selection: SelectionViewModel, synchronization: SynchronizationViewModel, styling: StylingViewModel)
	{
		this._synchronization = synchronization;

		this._isUnpowered = compute(selection._vehicle, styling._type, styling._variant, v => !v || !v[0]._isPowered());
	}

	_updateVehicle(car: Car, _: number, full?: boolean): void
	{
		this._mass.set(car.mass);

		if (full)
		{
			this._seats.set(car.numSeats);
			this._poweredAcceleration.set(car.poweredAcceleration);
			this._poweredMaxSpeed.set(car.poweredMaxSpeed);
		}
	}

	_setSeats(seats: number): void
	{
		this._synchronization._modify(setSeatCount, seats, CopyFilter.TypeAndVariant);
	}

	_setMass(mass: number): void
	{
		this._synchronization._modify(setMass, mass, CopyFilter.Mass);
	}

	_setPoweredAcceleration(acceleration: number): void
	{
		this._synchronization._modify(setPoweredAcceleration, acceleration, CopyFilter.PoweredAcceleration);
	}

	_setPoweredMaxSpeed(maxSpeed: number): void
	{
		this._synchronization._modify(setPoweredAcceleration, maxSpeed, CopyFilter.PoweredMaxSpeed);
	}
}
