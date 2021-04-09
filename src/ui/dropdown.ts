import * as Log from "../utilities/logger";
import Control, { ControlParams } from "./control";


/**
 * The parameters for configuring the dropdown.
 */
export interface DropdownParams extends ControlParams
{
	/**
	 * Sets the items that will show up in the dropdown menu.
	 * @default []
	 */
	items?: string[];


	/**
	 * Sets the message that will show when the dropdown is not available.
	 * @default "Not available"
	 */
	disabledMessage?: string;


	/**
	 * Automatically disables the dropdown if it has a single item.
	 * @default true
	 */
	disableSingleItem?: boolean;


	/**
	 * Triggers when the selected dropdown item changes.
	 */
	onSelect?: (index: number) => void;
}


/**
 * A controller class for a dropdown widget.
 */
export default class DropdownControl extends Control<DropdownParams>
{
	// Silence events only when updating dropdown.
	private _silenceEvent: boolean = false;


	/**
	 * Create a dropdown control with the specified parameters.
	 * @param params The parameters for the control.
	 */
	constructor(params: DropdownParams)
	{
		super(params);
		params.items ??= [];
		params.disabledMessage ??= "Not available";
		params.disableSingleItem ??= true;
	}


	/**
	 * Sets the dropdown to the specified index.
	 * @param index The index of the item to select.
	 */
	set(index: number): void
	{
		if (!this._isActive)
		{
			Log.debug(`(${this.params.name}) Dropdown is inactive, selected index ${index} was not applied.`);
			return;
		}

		const widget = this.getWidget<DropdownWidget>();
		Log.debug(`(${this.params.name}) Dropdown selected index changed to ${index}.`);

		this._silenceEvent = true;
		widget.selectedIndex = index;
		this._silenceEvent = false;
	}


	/**
	 * Creates a new dropdown widget for a window.
	 */
	createWidget(): DropdownWidget
	{
		return {
			...this.params,
			type: "dropdown",
			selectedIndex: 0,
			onChange: (i): void => this.onWidgetChange(i)
		};
	}


	/**
	 * Triggered when a new item is selected in the dropdown.
	 * @param index The number the spinner was set to.
	 */
	protected onWidgetChange(index: number): void
	{
		if (this._silenceEvent)
			return;

		const widget = this.getWidget<DropdownWidget>();
		if (widget.isDisabled)
		{
			Log.debug(`(${this.params.name}) Widget is disabled, no change event triggered.`);
			return;
		}

		if (this.params.onSelect)
			this.params.onSelect(index);
	}


	/** @inheritdoc */
	protected refreshWidget(widget: DropdownWidget): void
	{
		const items = this.params.items;
		if (this._isActive && items && items.length > 0)
		{
			widget.items = items;
			widget.isDisabled = (this._params.disableSingleItem && items.length == 1);
		}
		else
		{
			widget.items = [ this._params.disabledMessage ];
			widget.isDisabled = true;
		}
	}
}
