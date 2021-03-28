import Log from "../utilities/logger";
import Control, { ControlParams } from "./control";


const farAway: CoordsXY = { x: -9000, y: -9000 };


/**
 * A controller class for a viewport widget.
 */
export default class ViewportControl extends Control<ControlParams>
{
	private _entityId: number = -1;
	private _updater: (IDisposable | null) = null;


	/**
	 * Sets the viewport to go to a specific position.
	 * @param position The world position to go to.
	 */
	goTo(position: CoordsXY | CoordsXYZ)
	{
		Log.debug(`(${this.params.name}) Jump to position ${position}.`);
		this._isActive = true;
		this._entityId = -1;

		const widget = this.getWidget<ViewportWidget>();
		widget.viewport?.moveTo(position)

		this.refreshWidget(widget);
	}


	/**
	 * Sets the viewport to follow the specified entity.
	 * @param entityId The id of the entity to follow.
	 */
	follow(entityId: number)
	{
		Log.debug(`(${this.params.name}) Start following entity ${entityId}.`);

		this._isActive = true;
		this._entityId = entityId;
		this.refresh();
	}


	/**
	 * Stops the viewport where it is now, if it was following an entity.
	 */
	stop()
	{
		this._entityId = -1;
		this.active(false);
	}


	/**
	 * Creates a new viewport widget for a window.
	 */
	createWidget(): ViewportWidget
	{
		return {
			...this.params,
			type: "viewport",
			viewport: <Viewport>{
				left: farAway.x,
				top: farAway.y,
			}
		};
	}


	/** @inheritdoc */
	protected refreshWidget(widget: ViewportWidget)
	{
		if (this._isActive && this._entityId != -1)
		{
			if (!this._updater)
			{
				this._updater = context.subscribe("interval.tick", () => this.update());
			}
			this.update();
		}
		else if (this._updater) 
		{
			Log.debug(`(${this.params.name}) Updating has stopped.`);
			this._updater.dispose();
			this._updater = null;

			widget.viewport?.moveTo(farAway)
		}
	}


	/**
	 * Update function that will run every tick if this viewport is following an entity.
	 */
	private update()
	{
		if (this._entityId == -1)
		{
			this.stop();
			Log.error(`(${this.params.name}) Viewport tick update called while there is no entity to follow.`);
			return;
		}

		const entity = map.getEntity(this._entityId);
		if (entity)
		{
			const widget = this.getWidget<ViewportWidget>();
			widget.viewport?.moveTo({ x: entity.x, y: entity.y, z: entity.z });
		}
	}
}
