import Log from "../helpers/logger";
import Component from "./component";


/**
 * A controller class for a dropdown widget.
 */
class DropdownComponent extends Component
{
	/**
	 * Sets the items that will show up in the dropdown menu.
	 */
	items: string[] = [];


	/**
	 * Sets the message that will show when the dropdown is not available.
	 */
	disabledMessage: string = "Not available";


	/**
	 * Automatically disables the dropdown if it has a single item.
	 */
	disableSingleItem: boolean = true;


	/**
	 * Triggers when the spinner value changes.
	 */
	onSelect?: (index: number) => void;


	// Silence events only when updating dropdown.
	private _silenceEvent: boolean = false;


	/**
	 * Sets the dropdown to the specified index.
	 * @param index The index of the item to select.
	 */
	set(index: number)
	{
		const widget = this.getWidget<DropdownWidget>();
		Log.debug(`(${this._name}) Set to index ${index}.`);

		if (!this._isActive)
		{
			this._isActive = true;
			this.refreshWidget(widget);
		}

		this._silenceEvent = true;
		widget.selectedIndex = index;
		this._silenceEvent = false;
	}



	/**
	 * Triggered when a new item is selected in the dropdown.
	 * @param index The number the spinner was set to.
	 */
	protected onWidgetChange(index: number)
	{
		if (this._silenceEvent)
			return;

		const widget = this.getWidget<DropdownWidget>();
		if (widget.isDisabled)
		{
			Log.debug(`(${this._name}) Widget is disabled, no change event triggered.`);
			return;
		}
		Log.debug(`--->(${this._name}) Try updating ${widget.selectedIndex} -> ${index}.`);

		if (this.onSelect)
			this.onSelect(index);
	}


	/**
	 * Creates a new dropdown widget for a window.
	 */
	createWidget(): DropdownWidget
	{
		return {
			...this.description,
			type: "dropdown",
			items: this.items,
			selectedIndex: 0,
			onChange: i => this.onWidgetChange(i)
		};
	}


	/** @inheritdoc */
	protected refreshWidget(widget: DropdownWidget)
	{
		if (this._isActive && this.items && this.items.length > 0)
		{
			widget.items = this.items;
			widget.isDisabled = (this.disableSingleItem && this.items.length == 1);
		}
		else
		{
			widget.items = [this.disabledMessage];
			widget.isDisabled = true;
		}
	}
}

export default DropdownComponent;
