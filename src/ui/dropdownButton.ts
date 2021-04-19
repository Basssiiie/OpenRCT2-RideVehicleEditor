import DropdownControl, { DropdownParams } from "./dropdown";


/**
 * A single selectable option in the dropdown button.
 */
export interface DropdownButtonAction
{
	text: string,
	onClick: () => void
}


/**
 * The parameters for configuring the dropdown button.
 */
export interface DropdownButtonParams extends DropdownParams
{
	/**
	 * All the available buttons in this dropdown button.
	 */
	buttons: DropdownButtonAction[];
}


/**
 * A dropdown with a button on the side.
 */
export default class DropdownButtonComponent extends DropdownControl
{
	// The currently selected index into the button list.
	private _selectedIndex: number = 0;


	/**
	 * Create a dropdown button control with the specified parameters.
	 * @param params The parameters for the control.
	 */
	constructor(params: DropdownButtonParams)
	{
		super(params);
		params.items = params.buttons.map(b => b.text);
	}


	/**
	 * Creates both the dropdown and button widgets for a window.
	 */
	createWidgets(): Widget[]
	{
		const params = this._params as DropdownButtonParams;
		const dropdown = super.createWidget();
		dropdown.items = params.buttons?.map((b): string => b.text);

		return [
			dropdown,
			{
				...params,
				type: "button",
				name: (params.name + "-button"),
				x: (params.x + 1),
				y: (params.y + 1),
				width: (params.width - 13),
				height: (params.height - 2),
				onClick: (): void => this.onButtonClick(),
			}
		];
	}


	/**
	 * Triggered when the current button is pressed.
	 * @param index The number the spinner was set to.
	 */
	private onButtonClick(): void
	{
		const params = this._params as DropdownButtonParams;
		params.buttons[this._selectedIndex]?.onClick();
	}


	/** @inheritdoc */
	protected onWidgetChange(index: number): void
	{
		super.onWidgetChange(index);
		this._selectedIndex = index;
		this.refreshButton();
	}


	/** @inheritdoc */
	protected refreshWidget(widget: DropdownWidget): void
	{
		super.refreshWidget(widget);
		this.refreshButton();
	}


	/**
	 * Refreshes just the state of the button, not the dropdown.
	 */
	private refreshButton(): void
	{
		const dropdown = this.getWidget<DropdownWidget>();
		const button = this._window?.findWidget<ButtonWidget>(this._params.name + "-button");
		if (button)
		{
			button.isDisabled = dropdown.isDisabled;

			const params = this._params as DropdownButtonParams;
			button.text = params.buttons[this._selectedIndex].text;
		}
	}
}
