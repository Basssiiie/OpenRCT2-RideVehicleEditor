import { store } from "openrct2-flexui";
import { ParkRide } from "../objects/parkRide";
import { RideTrain } from "../objects/rideTrain";
import { RideVehicle } from "../objects/rideVehicle";
import { applyToTargets, CopyFilter } from "../services/vehicleCopier";


/**
 * Model for the window that allows applying vehicle settings to
 * other trains and vehicles on the ride.
 */
export class ApplyViewModel
{
	readonly options =
	[
		"All vehicles on this train",
		"Preceding vehicles on this train",
		"Following vehicles on this train",
		"All vehicles on all trains",
		"Preceding vehicles on all trains",
		"Following vehicles on all trains",
		"Same vehicle on all trains",
	];

	source: ApplySource | null = null;

	readonly target = store<number>(0);
	readonly filters = store<CopyFilter>(0);


	/**
	 * Toggle a filter on or off.
	 */
	setFilter(filter: CopyFilter, toggle: boolean): void
	{
		const enabledFilters = this.filters.get();

		this.filters.set((toggle)
			? (enabledFilters | filter)
			: (enabledFilters & ~filter)
		);
	}


	/**
	 * Applies the settings to the selected target option.
	 */
	applyToTarget(): void
	{
		const source = this.source;
		if (!source)
		{
			return;
		}

		// Format: [[ car id, amount of following cars ], ...]
		let targets: [number, number | null][];
		switch(this.target.get())
		{
			case 0: // "All vehicles on this train"
			{
				targets = [[ source.train[0].carId, null ]];
				break;
			}
			case 1: // "Preceding vehicles on this train"
			{
				targets = [[ source.train[0].carId, source.vehicle[1] ]];
				break;
			}
			case 2: // "Following vehicles on this train"
			{
				targets = [[ source.vehicle[0].id, null ]];
				break;
			}
			case 3: // "All vehicles on all trains"
			{
				targets = this.forAllTrains(source, t => [ t.carId, null ]);
				break;
			}
			case 4: // "Preceding vehicles on all trains"
			{
				const amountOfVehicles = (source.vehicle[1] + 1);
				targets = this.forAllTrains(source, t => [ t.carId, amountOfVehicles ]);
				break;
			}
			case 5: // "Following vehicles on all trains"
			{
				const index = source.vehicle[1];
				targets = this.forAllTrains(source, t => [ t.at(index).id, null ]);
				break;
			}
			case 6: // "Same vehicle on all trains"
			{
				const index = source.vehicle[1];
				targets = this.forAllTrains(source, t => [ t.at(index).id, 1 ]);
				break;
			}
			default: return;
		}

		const enabledFilters = (this.filters.get() || CopyFilter.All);
		applyToTargets(source.vehicle[0], enabledFilters, targets);
	}


	private forAllTrains(source: ApplySource, callback: (train: RideTrain) => [number, number | null]): [number, number | null][]
	{
		return source.ride[0].trains().map(callback);
	}
}


/**
 * The source vehicle to take the settings from.
 */
interface ApplySource
{
	ride: [ParkRide, number];
	train: [RideTrain, number];
	vehicle: [RideVehicle, number];
}