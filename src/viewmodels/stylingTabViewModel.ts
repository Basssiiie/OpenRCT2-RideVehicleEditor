import { Colour, compute, store } from "openrct2-flexui";
import { getAllRideTypes, RideType } from "../objects/rideType";
import { SelectionViewModel } from "./selectionViewModel";

export class StylingTabViewModel
{
	readonly _rideTypes = store<RideType[]>([]);

	readonly _type = store<[RideType, number] | null>(null);
	readonly _variants = compute(this._type, t => (t ? t[0]._variants() : []));
	readonly _variant = store<number>(0);
	readonly _isReversed = store<boolean>(false);

	readonly _primaryColour = store<Colour>(0);
	readonly _secondaryColour = store<Colour>(0);
	readonly _tertiaryColour = store<Colour>(0);

	readonly _spinFrames;
	readonly _isUnpowered;

	private readonly _selection: SelectionViewModel;

	constructor(selection: SelectionViewModel)
	{
		this._selection = selection;

		const selectedVehicle = selection._vehicle;
		this._spinFrames = compute(selectedVehicle, this._type, this._variant, v => (v ? v[0]._getSpinFrames() : 0));
		this._isUnpowered = compute(selectedVehicle, this._type, this._variant, v => !v || !v[0]._isPowered());

		this._rideTypes.set(getAllRideTypes());
	}
}
