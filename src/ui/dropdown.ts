import { log } from "../helpers/utilityHelpers";
import { Component } from "./component";


/**
 * A controller class for a dropdown widget.
 */
export class Dropdown extends Component
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


	/**
	 * Sets the dropdown to the specified index.
	 * @param index The index of the item to select.
	 */
	set(index: number)
	{
		const widget = this.getWidget<DropdownWidget>();
		if (widget.isDisabled)
		{
			log(`Dropdown is disabled, index '${index}' was not set.`);
			return;
		}

		if (widget.selectedIndex == index)
		{
			log(`Dropdown is already set to index '${index}'.`);
			return;
		}

		widget.selectedIndex = index;
	}



	/**
	 * Triggered when a new item is selected in the the dropdown.
	 * @param index The number the spinner was set to.
	 */
	protected onChange(index: number)
	{
		const widget = this.getWidget<DropdownWidget>();
		if (widget.isDisabled || !this.onSelect)
			return;

		this.onSelect(index);
	}


	/**
	 * Creates a new dropdown widget for a window.
	 */
	createWidget(): DropdownWidget
	{
		return {
			...this._description,
			type: "dropdown",
			items: this.items,
			selectedIndex: 0,
			onChange: i => this.onChange(i)
		};
	}


	/** @inheritdoc */
	protected refreshWidget(widget: DropdownWidget)
	{
		if (this.items && this.items.length > 0)
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
