import { store } from "openrct2-flexui";
import { ParkRide } from "../objects/parkRide";
import { RideLifeCycleFlags } from "../objects/rideLifeCycleFlags";
import * as Log from "../utilities/logger";
import { TabViewModel } from "./tabViewModel";
import { setBuildMonth, setBuildYear, setCustomDesign, setExcitementRating, setFrozenRatings, setIndestructable, setIntensityRating, setNauseaRating } from "../services/rideEditor";
import { SelectionViewModel } from "./selectionViewModel";
import { refreshRide, watch } from "../services/events";


const ratingFunctions = [
	setExcitementRating,
	setIntensityRating,
	setNauseaRating
];

const rideFlagFunctions = [
	setFrozenRatings,
	setCustomDesign,
	setIndestructable
];


export const enum Rating
{
	Excitement,
	Intensity,
	Nauseas
}

export const enum RideFlag
{
	FrozenRatings,
	CustomDesign,
	Indestructable
}

export class RideViewModel implements TabViewModel
{
	readonly _excitement = store<number>(0);
	readonly _intensity = store<number>(0);
	readonly _nausea = store<number>(0);
	readonly _freezeStats = store<boolean>(false);

	readonly _buildMonth = store<number>(0);
	readonly _currentMonth = store<number>(0);
	readonly _customDesign = store<boolean>(false);
	readonly _indestructable = store<boolean>(false);

	private _onRideSelect?: () => void;
	private _onRideUpdate?: () => void;
	private _onRatingCalculated?: IDisposable;
	private _onDayChange?: IDisposable;

	private readonly _ride;

	constructor(selection: SelectionViewModel)
	{
		this._ride = selection._ride;
	}

	_setRating(rating: Rating, value: number): void
	{
		this._modifyRide(ratingFunctions[rating], value);
	}

	_setRideFlag(flag: RideFlag, value: boolean): void
	{
		this._modifyRide(rideFlagFunctions[flag], value);
	}

	_setBuildMonth(month: number): void
	{
		this._modifyRide(setBuildMonth, month);
	}

	_setBuildYear(year: number): void
	{
		this._modifyRide(setBuildYear, year);
	}

	_open(): void
	{
		Log.debug("[RideViewModel] Tab opened!");
		this._currentMonth.set(date.monthsElapsed);

		this._onRideSelect = this._ride.subscribe(r =>
		{
			if (r)
			{
				this._updateRide(r[0]._ride());
			}
		});
		this._onRideUpdate = watch(refreshRide, (id: number) =>
		{
			Log.debug("[RideViewModel] Refresh ride!");
			const ride = this._ride.get();
			if (ride && ride[0]._id === id)
			{
				this._updateRide(ride[0]._ride());
			}
		});
		this._onRatingCalculated = context.subscribe("ride.ratings.calculate", args =>
		{
			const ride = this._ride.get();
			if (ride && args.rideId === ride[0]._id)
			{
				Log.debug("Update ratings for selected ride", args.rideId);
				this._updateRideRatings(ride[0]._ride());
			}
		});
		this._onDayChange = context.subscribe("interval.day", () =>
		{
			const ride = this._ride.get();
			if (ride)
			{
				this._currentMonth.set(date.monthsElapsed);
			}
		});
	}

	_close(): void
	{
		Log.debug("[RideViewModel] Tab closed!");
		if (this._onRideSelect)
		{
			this._onRideSelect();
		}
		if (this._onRideUpdate)
		{
			this._onRideUpdate();
		}
		if (this._onRatingCalculated)
		{
			this._onRatingCalculated.dispose();
		}
		if (this._onDayChange)
		{
			this._onDayChange.dispose();
		}
		this._onRideSelect = undefined;
		this._onRatingCalculated = undefined;
		this._onDayChange = undefined;
	}

	_updateRide(ride: Ride): void
	{
		this._updateRideRatings(ride);
		this._freezeStats.set(hasLifeCycleFlag(ride, RideLifeCycleFlags.FixedRatings));
		this._buildMonth.set(ride.buildDate);
		this._customDesign.set(!hasLifeCycleFlag(ride, RideLifeCycleFlags.NotCustomDesign));
		this._indestructable.set(hasLifeCycleFlag(ride, RideLifeCycleFlags.Indestructable));
	}

	private _updateRideRatings(ride: Ride): void
	{
		this._excitement.set(ride.excitement);
		this._intensity.set(ride.intensity);
		this._nausea.set(ride.nausea);
	}

	private _modifyRide<T>(action: (ride: ParkRide, value: T) => void, value: T): void
	{
		const ride = this._ride.get();
		if (ride)
		{
			action(ride[0], value);
		}
		else
		{
			Log.debug("Failed to modify ride with", action, "to", value, "; none is selected.");
		}
	}

}


function hasLifeCycleFlag(ride: Ride, flag: RideLifeCycleFlags): boolean
{
	return !!(ride.lifecycleFlags & flag);
}
