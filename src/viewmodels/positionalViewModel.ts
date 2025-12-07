import { compute, store } from "openrct2-flexui";
import { getDistanceFromProgress, getSpacingToPrecedingVehicle } from "../services/spacingEditor";
import { CopyFilter } from "../services/vehicleCopier";
import { VehicleSpan } from "../services/vehicleSpan";
import { SelectionViewModel } from "./selectionViewModel";
import { changeSpacing, changeTrackProgress, setPositionX, setPositionY, setPositionZ, setSpin } from "../services/vehicleEditor";
import { SynchronizationViewModel } from "./synchronizationViewModel";
import { StylingViewModel } from "./stylingViewModel";
import { floor } from "../utilities/math";
import { TabViewModel } from "./tabViewModel";


const positionFunctions = [
	setPositionX,
	setPositionY,
	setPositionZ
];

export const enum Axis
{
	X = 0,
	Y = 1,
	Z = 2
}

export class PositionalViewModel implements TabViewModel
{
	readonly _trackProgress = store<number>(0);
	readonly _trackLocation = store<CarTrackLocation | null>(null);
	readonly _spacing = store<number | null>(0);
	readonly _x = store<number>(0);
	readonly _y = store<number>(0);
	readonly _z = store<number>(0);
	readonly _spin = store<number>(0);

	readonly _isMoving = store(false);
	readonly _isSpacingDisabled;
	readonly _isPositionDisabled;
	readonly _isSpinDisabled;
	readonly _spinFrames;

	private readonly _selection: SelectionViewModel;
	private readonly _synchronization: SynchronizationViewModel;

	constructor(selection: SelectionViewModel, synchronization: SynchronizationViewModel, styling: StylingViewModel)
	{
		this._selection = selection;
		this._synchronization = synchronization;

		this._spinFrames = compute(selection._vehicle, styling._type, styling._variant, v => (v ? v[0]._getSpinFrames() : 0));
		this._isSpinDisabled = compute(this._spinFrames, v => !v);
		this._isSpacingDisabled = compute(selection._isDisabled, selection._vehicle, (noEdit, vehicle) => (noEdit || !vehicle || vehicle[1] === 0));
		this._isPositionDisabled = compute(this._isMoving, selection._isDisabled, (m, e) => m || e);
	}

	_updateVehicle(car: Car, index: number): void
	{
		this._trackProgress.set(car.trackProgress);
		this._trackLocation.set(car.trackLocation);
		this._x.set(car.x);
		this._y.set(car.y);
		this._z.set(car.z);

		const train = this._selection._train.get();
		const frames = this._spinFrames.get();

		this._spin.set(floor((car.spin * frames) / 256));

		if (train)
		{
			const status = train[0]._at(0)._car().status;
			this._isMoving.set(isMoving(status));
			this._spacing.set(getSpacingToPrecedingVehicle(train[0], car, index));
		}
	}

	_setTrackProgress(increment: number): void
	{
		this._applyTrackProgressChange(changeTrackProgress, increment, CopyFilter.TrackProgress);
	}

	_setSpacing(increment: number): void
	{
		this._applyTrackProgressChange(changeSpacing, increment, CopyFilter.Spacing);
	}

	_setAxis(axis: Axis, increment: number): void
	{
		this._synchronization._modify(positionFunctions[axis], increment, CopyFilter.Position);
	}

	_setSpin(increment: number): void
	{
		const spin = floor((increment * 256) / this._spinFrames.get());
		this._synchronization._modify(setSpin, spin, CopyFilter.Spin);
	}

	_formatSpacing(): string
	{
		const spacing = this._spacing.get();
		return (spacing === null) ? "Too far away" : spacing.toString();
	}

	_formatPosition(pos: number): string
	{
		return this._selection._isDisabled.get() ? "Not available" : pos.toString();
	}

	/**
	 * Apply the same amount of track progress to all selected vehicles based on the currently selected car.
	 */
	private _applyTrackProgressChange(action: (vehicles: VehicleSpan[], value: number) => void, increment: number, filter: CopyFilter): void
	{
		const selectedVehicle = this._selection._vehicle.get();
		if (selectedVehicle)
		{
			const distance = getDistanceFromProgress(selectedVehicle[0]._car(), increment);
			this._synchronization._modify(action, distance, filter);
		}
	}
}

/**
 * If the vehicle is in a moving state, the xyz positions cannot be edited, because
 * the game will automatically discard all change attempts.
 */
function isMoving(status: VehicleStatus): boolean
{
	switch (status)
	{
		case "arriving":
		case "crashing":
		case "departing":
		case "moving_to_end_of_station":
		case "travelling_boat":
		case "travelling_cable_lift":
		case "travelling_dodgems":
		case "travelling":
			return true;
	}
	return false;
}
