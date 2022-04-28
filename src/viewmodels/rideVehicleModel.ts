import { store } from "openrct2-flexui";
import { ParkRide } from "../objects/parkRide";
import { RideLifeCycleFlags } from "../objects/rideLifeCycleFlags";
import * as Log from "../utilities/logger";


export class RideViewModel
{
	readonly ride = store<ParkRide | null>(null);
	readonly title = store<string>("");

	readonly excitement = store<number>(0);
	readonly intensity = store<number>(0);
	readonly nausea = store<number>(0);
	readonly multiplier = store<number>(1);
	readonly freezeStats = store<boolean>(false);

	readonly buildMonth = store<number>(0);
	readonly customDesign = store<boolean>(false);
	readonly indestructable = store<boolean>(false);

	private _ratingCalculationHook?: IDisposable;

	constructor()
	{
		this.ride.subscribe(r =>
		{
			if (r)
			{
				const ride = r.ride();
				this.title.set(ride.name);

				this.excitement.set(ride.excitement);
				this.intensity.set(ride.intensity);
				this.nausea.set(ride.nausea);
				this.freezeStats.set(hasLifeCycleFlag(ride, RideLifeCycleFlags.FixedRatings));

				this.buildMonth.set(ride.buildDate);
				this.customDesign.set(!hasLifeCycleFlag(ride, RideLifeCycleFlags.NotCustomDesign));
				this.indestructable.set(hasLifeCycleFlag(ride, RideLifeCycleFlags.Indestructable));
			}
		});
	}

	open(): void
	{
		this._ratingCalculationHook = context.subscribe("ride.ratings.calculate", args =>
		{
			Log.debug(`Update ratings for ride ${args.rideId}`);
			const ride = this.ride.get();
			if (ride && args.rideId === ride.id)
			{
				this.excitement.set(args.excitement);
				this.intensity.set(args.intensity);
				this.nausea.set(args.nausea);
			}
		});
	}

	close(): void
	{
		const hook = this._ratingCalculationHook;
		if (hook)
		{
			hook.dispose();
		}
	}
}


function hasLifeCycleFlag(ride: Ride, flag: RideLifeCycleFlags): boolean
{
	return !!(ride.lifecycleFlags & flag);
}