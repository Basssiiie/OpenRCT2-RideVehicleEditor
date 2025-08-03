import { compute, store } from "openrct2-flexui";
import { ParkRide } from "../objects/parkRide";
import { RideLifeCycleFlags } from "../objects/rideLifeCycleFlags";
import { refreshRide } from "../services/events";
import * as Log from "../utilities/logger";


export class RideViewModel
{
	readonly _ride = store<ParkRide | null>(null);
	readonly _title = store<string>("");

	readonly _excitement = store<number>(0);
	readonly _intensity = store<number>(0);
	readonly _nausea = store<number>(0);
	readonly _multiplierIndex = store<number>(0);
	readonly _multiplier = compute(this._multiplierIndex, idx => (10 ** idx));
	readonly _freezeStats = store<boolean>(false);

	readonly _buildMonth = store<number>(0);
	readonly _currentMonth = store<number>(0);
	readonly _customDesign = store<boolean>(false);
	readonly _indestructable = store<boolean>(false);

	private _isOpen?: boolean;
	private _rideSubscription?: () => void;
	private _ratingCalculationHook?: IDisposable;
	private _dayIntervalHook?: IDisposable;

	constructor()
	{
		refreshRide.push(id =>
		{
			if (!this._isOpen)
			{
				Log.debug("[RideViewModel] Refresh ignored, window not open.");
				return;
			}
			Log.debug("[RideViewModel] Refresh ride!");
			const ride = this._ride.get();
			if (ride && ride._id === id)
			{
				this._updateRideInfo(ride);
			}
		});
	}

	_open(): void
	{
		Log.debug("[RideViewModel] Window opened!");
		this._isOpen = true;
		this._currentMonth.set(date.monthsElapsed);

		this._rideSubscription = this._ride.subscribe(r =>
		{
			if (r)
			{
				this._updateRideInfo(r);
			}
		});
		this._ratingCalculationHook = context.subscribe("ride.ratings.calculate", args =>
		{
			const ride = this._ride.get();
			if (ride && args.rideId === ride._id)
			{
				Log.debug("Update ratings for selected ride", args.rideId);
				this._excitement.set(args.excitement);
				this._intensity.set(args.intensity);
				this._nausea.set(args.nausea);
			}
		});
		this._dayIntervalHook = context.subscribe("interval.day", () =>
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
		Log.debug("[RideViewModel] Window closed!");
		this._isOpen = false;
		if (this._rideSubscription)
		{
			this._rideSubscription();
		}
		if (this._ratingCalculationHook)
		{
			this._ratingCalculationHook.dispose();
		}
		if (this._dayIntervalHook)
		{
			this._dayIntervalHook.dispose();
		}
		this._rideSubscription = undefined;
		this._ratingCalculationHook = undefined;
		this._dayIntervalHook = undefined;

		// Reset values
		this._multiplierIndex.set(0);
	}

	private _updateRideInfo(parkRide: ParkRide): void
	{
		Log.debug("[RideViewModel] Update ride info to", parkRide._ride().name);
		const ride = parkRide._ride();
		this._title.set(ride.name);

		this._excitement.set(ride.excitement);
		this._intensity.set(ride.intensity);
		this._nausea.set(ride.nausea);
		this._freezeStats.set(hasLifeCycleFlag(ride, RideLifeCycleFlags.FixedRatings));

		this._buildMonth.set(ride.buildDate);
		this._customDesign.set(!hasLifeCycleFlag(ride, RideLifeCycleFlags.NotCustomDesign));
		this._indestructable.set(hasLifeCycleFlag(ride, RideLifeCycleFlags.Indestructable));
	}
}


function hasLifeCycleFlag(ride: Ride, flag: RideLifeCycleFlags): boolean
{
	return !!(ride.lifecycleFlags & flag);
}
