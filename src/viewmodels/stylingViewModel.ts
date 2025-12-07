import { Colour, compute, store } from "openrct2-flexui";
import { getAllRideTypes, gigaCableLiftHillType, gigaCableLiftHillTypeId, RideType } from "../objects/rideType";
import { TabViewModel } from "./tabViewModel";
import { CopyFilter } from "../services/vehicleCopier";
import { setPrimaryColour, setReversed, setRideType, setSecondaryColour, setTertiaryColour, setVariant } from "../services/vehicleEditor";
import { SynchronizationViewModel } from "./synchronizationViewModel";
import * as Log from "../utilities/logger";
import { RideVehicleVariant, VehicleVisibility } from "../objects/rideVehicleVariant";
import { findIndex, orderByNameThenByIdentifier } from "../utilities/array";
import { isNull } from "../utilities/type";


const colourFunctions = [
	setPrimaryColour,
	setSecondaryColour,
	setTertiaryColour
];

export const enum ColourPart
{
	Primary = 0,
	Secondary = 1,
	Tertiary = 2
}

export class StylingViewModel implements TabViewModel
{
	readonly _rideTypes = store<RideType[]>([]);
	readonly _rideTypeNames;

	readonly _type = store<[RideType, number] | null>(null);
	readonly _variants = compute(this._type, t => (t
		? t[0]._variants().map(formatVariant)
		: []));
	readonly _variant = store<number>(0);
	readonly _isReversed = store<boolean>(false);

	readonly _primaryColour = store<Colour>(0);
	readonly _secondaryColour = store<Colour>(0);
	readonly _tertiaryColour = store<Colour>(0);

	private readonly _synchronization: SynchronizationViewModel;

	constructor(synchronization: SynchronizationViewModel)
	{
		this._synchronization = synchronization;

		this._rideTypes.set(getAllRideTypes());
		this._rideTypeNames = compute(this._rideTypes, getUniqueRideTypeNames);
	}

	_updateVehicle(car: Car, _: number, full?: boolean): void
	{
		// Variant can change during gameplay, so keep it fresh.
		this._variant.set(car.vehicleObject);

		if (!full)
		{
			return;
		}

		const rideObjectId = car.rideObject;
		const colours = car.colours;
		let types = this._rideTypes.get();
		let typeIdx = findIndex(types, t => t._id === car.rideObject);
		let type: [RideType, number] | null;

		if (!isNull(typeIdx))
		{
			type = [types[typeIdx], typeIdx];
		}
		else if (rideObjectId === gigaCableLiftHillTypeId) // Special Giga Lifthill
		{
			Log.debug("Adding special Giga cable lift ride type");
			types = types
				.concat(gigaCableLiftHillType)
				.sort((l, r) => orderByNameThenByIdentifier(l._object(), r._object()));

			typeIdx = findIndex(types, t => t._id === gigaCableLiftHillTypeId);
			Log.assert(!isNull(typeIdx));

			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			type = [gigaCableLiftHillType, typeIdx!];
			this._rideTypes.set(types);
		}
		else
		{
			type = null;
		}

		this._type.set(type);
		this._isReversed.set(car.isReversed);
		this._primaryColour.set(colours.body);
		this._secondaryColour.set(colours.trim);
		this._tertiaryColour.set(colours.tertiary);
	}

	/**
	 * Updates the viewmodel with the new vehicle type.
	 */
	_setType(typeIdx: number): void
	{
		const type = this._rideTypes.get()[typeIdx];
		this._synchronization._modify(setRideType, type, CopyFilter.TypeAndVariant);
	}

	_setVariant(variant: number): void
	{
		this._synchronization._modify(setVariant, variant, CopyFilter.TypeAndVariant);
	}

	_setReversed(reversed: boolean): void
	{
		this._synchronization._modify(setReversed, reversed, CopyFilter.TypeAndVariant);
	}

	_setColour(part: number, colour: Colour): void
	{
		this._synchronization._modify(colourFunctions[part], colour, CopyFilter.TypeAndVariant);
	}

}

/**
 * Format function that labels variants invisible if they are.
 */
function formatVariant(variant: RideVehicleVariant, index: number): string
{
	const visibility = variant._visibility;
	if (visibility === VehicleVisibility.Visible)
	{
		return index.toString();
	}
	const visibilityLabel = (visibility) ? "invisible" : "green square";
	return (index + "  (" + visibilityLabel + ")");
}

/**
 * Hack: make ride type names unique so they don't get mixed up.
 */
function getUniqueRideTypeNames(rideTypes: RideType[]): string[]
{
	const length = rideTypes.length;
	const array = Array<string>(length);
	let streak: string | undefined;
	let last: string | undefined;
	let current: string | undefined;
	let idx = 0;

	for (; idx < length; idx++)
	{
		current = rideTypes[idx]._object().name;

		if (current === streak)
		{
			last += " "; // Add invisible space to add difference.
		}
		else
		{
			streak = last = current;
		}

		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		array[idx] = last!;
	}

	Log.debug("getUniqueRideTypeNames():", array);
	return array;
}
