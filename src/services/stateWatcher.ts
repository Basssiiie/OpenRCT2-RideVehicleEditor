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

	private _recordedViewportRotation: number;
	private _isDisposed: boolean = false;


	constructor(
		readonly window: VehicleEditorWindow,
		readonly selector: VehicleSelector,
		readonly editor: VehicleEditor)
	{
		log("(state) Watcher initialized");
		this._recordedViewportRotation = ui.mainViewport.rotation;

		this._onActionHook = context.subscribe("action.execute", e => this.onActionExecuted(e));
		this._onUpdateHook = context.subscribe("interval.tick", () => this.onGameTickUpdate());
		window.onUpdate = () => this.onWindowUpdate();
	}


	dispose(): void
	{
		this._onActionHook.dispose();
		this._onUpdateHook.dispose();
		this._isDisposed = true;
	}


	/**
	 * Triggers for every executed player action.
	 * 
	 * @param event The arguments describing the executed action.
	 */
	private onActionExecuted(event: GameActionEventArgs)
	{
		if (this._isDisposed)
			return;

		const action = event.action as ActionType;
		switch (action)
		{
			case "ridecreate":
			case "ridedemolish":
			case "ridesetname":
				this.selector.reloadRideList();
				break;

			case "ridesetstatus": // close/reopen ride
				const ride = this.selector.selectedRide;
				const statusUpdate = (event.args as RideSetStatusArgs);

				if (ride && ride.rideId === statusUpdate.ride)
				{
					log("(state) Ride status changed.");
					this.selector.refresh();
				}
				break;
		}

		log(`<${action}>\n\t- type: ${event.type}\n\t- args: ${JSON.stringify(event.args)}\n\t- result: ${JSON.stringify(event.result)}`)
	}


	/**
	 * Triggers every game tick. Does not trigger in pause mode.
	 */
	private onGameTickUpdate()
	{
		if (this._isDisposed)
			return;

		// Update the vehicle controls if things have changed.
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
				const variant = car.vehicleObject;
				const variantSpinner = this.window.variantSpinner;

				if (variant !== variantSpinner.value)
				{
					variantSpinner.set(variant);
				}

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


	/**
	 * Triggers every tick the window UI is updated.
	 */
	private onWindowUpdate()
	{
		if (this._isDisposed)
			return;
		
		// Update the viewport if the current rotation has changed.
		const currentRotation = ui.mainViewport.rotation;

		if (currentRotation !== this._recordedViewportRotation)
		{
			log(`(state) Detected viewport rotation change: ${this._recordedViewportRotation} -> ${currentRotation}`);

			this.window.viewport.refresh();
			this._recordedViewportRotation = currentRotation;
		}
	}
}

export default StateWatcher;
