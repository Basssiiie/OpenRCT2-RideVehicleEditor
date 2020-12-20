import { log } from "../helpers/utilityHelpers";
import VehicleEditor from "./editor";
import VehicleSelector from "./selector";


/**
 * Watches the state of the game, and updates relevant services if necessary.
 */
class StateWatcher implements IDisposable
{
	private _onActionHook: IDisposable;
	private _onUpdateHook: IDisposable;


	constructor(
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


	private onActionExecuted(args: GameActionEventArgs)
	{
		const action = args.action as ActionType;
		switch (action)
		{
			case "ridecreate":
			case "ridedemolish":
				this.selector.reloadRideList();
				break;
		}
	}


	private onTickUpdate()
	{
		const vehicle = this.selector.selectedVehicle;
		if (vehicle)
		{
			const car = vehicle.getCar();
			if (!car)
			{
				this.selector.deselectVehicle();
			}
		}
	}
}

export default StateWatcher;
