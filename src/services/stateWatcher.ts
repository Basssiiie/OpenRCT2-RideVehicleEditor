import Log from "../utilities/logger";
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
export default class StateWatcher implements IDisposable
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
		Log.debug("(watcher) Watcher initialized");
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
				const index = this.selector.rideIndex;
				if (index !== null)
				{
					const ride = this.selector.ride.get();
					const statusUpdate = (event.args as RideSetStatusArgs);

					if (ride !== null && ride.rideId === statusUpdate.ride)
					{
						Log.debug("(watcher) Ride status changed.");
						this.selector.selectRide(index);
					}
				}
				break;
		}

		Log.debug(`<${action}>\n\t- type: ${event.type}\n\t- args: ${JSON.stringify(event.args)}\n\t- result: ${JSON.stringify(event.result)}`)
	}


	/**
	 * Triggers every game tick. Does not trigger in pause mode.
	 */
	private onGameTickUpdate()
	{
		if (this._isDisposed)
			return;

		// Update the vehicle controls if things have changed.
		const vehicle = this.selector.vehicle.get();
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
			Log.debug(`(watcher) Detected viewport rotation change: ${this._recordedViewportRotation} -> ${currentRotation}`);

			this.window.viewport.refresh();
			this._recordedViewportRotation = currentRotation;
		}
	}
}
