import Dropdown from "./dropdown";
import Spinner from "./spinner";
import WidgetDesc from "./widgetDesc";


/**
 * A dropdown with a spinner component on the side.
 */
class DropdownSpinner extends Dropdown
{
	// The attached spinner component.
	private _spinner: Spinner;


	constructor(description: WidgetDesc)
	{
		super({
			...description,
			width: (description.width - 24)
		});
		this._spinner = new Spinner({
			...description,
			name: (description.name + "-spinner"),
		});
		this._spinner.disabledMessage = "";
		this._spinner.onChange = (i => this.onSpinnerChange(i));
	}


	/**
	 * Creates both the dropdown and spinner widgets for a window.
	 */
	createWidgets(): Widget[]
	{
		return [
			this._spinner.createWidget(),
			super.createWidget()
		];
	}


	/** @inheritdoc */
	bind(window: Window)
	{
		this._spinner.bind(window);
		super.bind(window);
	}


	/**
	 * Triggered when the spinner selects a new item in the dropdown.
	 * @param index The number the spinner was set to.
	 */
	private onSpinnerChange(index: number)
	{
		this.set(index);
		super.onWidgetChange(index);

		const dropdown = this.getWidget<DropdownWidget>();
		super.refreshWidget(dropdown); // only refresh of dropdown is necessary.
	}


	/** @inheritdoc */
	protected onWidgetChange(index: number)
	{
		this._spinner.value = index;
		super.onWidgetChange(index);
	}


	/** @inheritdoc */
	protected refreshWidget(widget: DropdownWidget): void
	{
		this._spinner.maximum = this.items.length;
		this._spinner.refresh();

		super.refreshWidget(widget);
	}
}

export default DropdownSpinner;
