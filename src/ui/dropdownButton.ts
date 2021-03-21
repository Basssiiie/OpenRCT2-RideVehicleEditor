import Component from "./component";
import WidgetDesc from "./widgetDesc";


type DropdownButtonAction = 
{ 
	text: string, 
	onClick: () => void 
}


/**
 * A dropdown with a button on the side.
 */
class DropdownButtonComponent extends Component
{
	/**
	 * All the available buttons in this dropdown button.
	 */
	buttons: DropdownButtonAction[] = [];


	/**
	 * The currently selected index into the button list.
	 */
	selectedIndex: number = 0;


	constructor(description: WidgetDesc)
	{
		super({
			...description,
		});
	}


	/**
	 * Creates both the dropdown and button widgets for a window.
	 */
	createWidgets(): Widget[]
	{
		return [
			{
				...this.description,
				type: "dropdown",
				name: (this.description.name + "-dropdown"),
				items: this.buttons.map(b => b.text),
				onChange: v => this.onDropdownChange(v),
			},
			{
				...this.description,
				type: "button",
				x: (this.description.x + 1),
				y: (this.description.y + 1),
				width: (this.description.width - 13),
				height: (this.description.height - 2),
				onClick: () => this.onButtonClick(),
			}
		];
	}


	/**
	 * Triggered when the current button is pressed.
	 * @param index The number the spinner was set to.
	 */
	private onButtonClick()
	{
		this.buttons[this.selectedIndex]?.onClick();
	}


	/**
	 * Triggered when a new button is selected from the dropdown.
	 * @param index The index of the selected button.
	 */
	private onDropdownChange(index: number)
	{
		this.selectedIndex = index;
		this.refresh();
	}


	/** @inheritdoc */
	protected refreshWidget(widget: ButtonWidget): void
	{
		widget.text = this.buttons[this.selectedIndex].text;
	}
}

export default DropdownButtonComponent;
