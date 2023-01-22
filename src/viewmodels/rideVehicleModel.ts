import { store } from "openrct2-flexui";
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
	readonly _multiplier = store<number>(1);
	readonly _freezeStats = store<boolean>(false);

	readonly _buildMonth = store<number>(0);
	readonly _customDesign = store<boolean>(false);
	readonly _indestructable = store<boolean>(false);

	private _rideSubscription?: () => void;
	private _ratingCalculationHook?: IDisposable;

	constructor()
	{
		refreshRide.push(id =>
		{
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
		this._rideSubscription = this._ride.subscribe(r =>
		{
			if (r)
			{
				this._updateRideInfo(r);
			}
		});
		this._ratingCalculationHook = context.subscribe("ride.ratings.calculate", args =>
		{
			Log.debug("Update ratings for ride", args.rideId);
			const ride = this._ride.get();
			if (ride && args.rideId === ride._id)
			{
				this._excitement.set(args.excitement);
				this._intensity.set(args.intensity);
				this._nausea.set(args.nausea);
			}
		});
	}

	_close(): void
	{
		const unsubscribe = this._rideSubscription;
		const hook = this._ratingCalculationHook;
		if (unsubscribe)
		{
			unsubscribe();
		}
		if (hook)
		{
			hook.dispose();
		}
	}

	private _updateRideInfo(parkRide: ParkRide): void
	{
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