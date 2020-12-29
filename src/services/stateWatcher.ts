import { log } from "../helpers/utilityHelpers";
import VehicleEditorWindow from "../ui/editorWindow";
import VehicleEditor from "./editor";
import VehicleSelector from "./selector";


/**
 * Returned arguments for the 'ridesetstatus' action.
 */
interface RideSetStatusArgs
{
	/**
	 * The id of the ride that was changed.
	 */
	ride: number;


	/**
	 * The new status for the ride. (0 = closed, 1 = open, 2 = test-mode)
	 */
	status: number;
}


/**
 * Watches the state of the game, and updates relevant services if necessary.
 */
class StateWatcher implements IDisposable
{
	private _onActionHook: IDisposable;
	private _onUpdateHook: IDisposable;


	constructor(
		readonly window: VehicleEditorWindow,
		readonly selector: VehicleSelector,
		readonly editor: VehicleEditor)
	{
		log("(state) Watcher initialized");
		this._onActionHook = context.subscribe("action.execute", e => this.onActionExecuted(e));
		this._onUpdateHook = context.subscribe("interval.tick", () => this.onTickUpdate());
	}


	dispose(): void
	{
		this._onActionHook.dispose();
		this._onUpdateHook.dispose();
	}


	private onActionExecuted(event: GameActionEventArgs)
	{
		const action = event.action as ActionType;
		switch (action)
		{
			case "ridecreate":
			case "ridedemolish":
				this.selector.reloadRideList();
				break;

			case "ridesetstatus": // close/reopen ride
				const ride = this.selector.selectedRide;
				const statusUpdate = event.args as RideSetStatusArgs;

				if (ride && ride.rideId === statusUpdate.ride)
				{
					log("(state) Ride status changed.");
					this.selector.refresh();
				}
				break;
		}

		log(`<${action}>\n\t- type: ${event.type}\n\t- args: ${JSON.stringify(event.args)}\n\t- result: ${JSON.stringify(event.result)}`)
	}


	private onTickUpdate()
	{
		const vehicle = this.selector.selectedVehicle;
		if (vehicle)
		{
			const car = vehicle.getCar();
			if (!car)
			{
				this.selector.deselect();
			}
			else
			{
				const progress = car.trackProgress;
				const progressSpinner = this.window.trackProgressSpinner;

				if (progress !== progressSpinner.value)
				{
					progressSpinner.set(progress);
				}

				const mass = car.mass;
				const massSpinner = this.window.massSpinner;

				if (mass !== massSpinner.value)
				{
					massSpinner.set(mass);
				}
			}
		}
	}
}

export default StateWatcher;
