import DropdownControl, { DropdownParams } from "./dropdown";
import SpinnerControl, { SpinnerParams } from "./spinner";


/**
 * The parameters for configuring the spinner.
 */
export type DropdownSpinnerParams = DropdownParams & Partial<SpinnerParams>;


/**
 * A dropdown with a spinner control on the side.
 */
export default class DropdownSpinnerControl extends DropdownControl
{
	/** @inheritdoc */
	override get params(): Required<DropdownSpinnerParams>
	{
		return this._params as Required<DropdownSpinnerParams>;
	}


	// The attached spinner control.
	private _spinner: SpinnerControl;


	/**
	 * The parameters for configuring the dropdown spinner.
	 */
	constructor(params: DropdownSpinnerParams)
	{
		super({
			...params,
			width: (params.width - 24)
		});
		this._spinner = new SpinnerControl({
			...params,
			name: (params.name + "-spinner"),
			disabledMessage: "",
			minimum: 0,
			maximum: params.items?.length ?? 1,
			onChange: (i): void => this.onSpinnerChange(i)
		});
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
	override bind(window: Window): void
	{
		this._spinner.bind(window);
		super.bind(window);
	}


	/**
	 * Triggered when the spinner selects a new item in the dropdown.
	 * @param index The number the spinner was set to.
	 */
	private onSpinnerChange(index: number): void
	{
		this.set(index);
		super.onWidgetChange(index);

		const dropdown = this.getWidget<DropdownWidget>();
		super.refreshWidget(dropdown); // only refresh of dropdown is necessary.
	}


	/** @inheritdoc */
	protected override onWidgetChange(index: number): void
	{
		this._spinner.set(index);
		super.onWidgetChange(index);
	}


	/** @inheritdoc */
	protected override refreshWidget(widget: DropdownWidget): void
	{
		this._spinner.params.maximum = this._params.items.length;
		this._spinner.refresh();

		super.refreshWidget(widget);
	}
}
