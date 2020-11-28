import { log } from "../helpers/utilityHelpers";
import Component from "./component";

/**
 * Determines whether the spinner value wraps around or clamps to its boundaries.
 */
type WrapMode = "wrap" | "clamp";


/**
 * A controller class for a spinner widget.
 */
class Spinner extends Component
{
	/**
	 * Sets whether the spinner value wraps around or clamps to its boundaries.
	 */
	wrapMode: WrapMode = "wrap";


	/**
	 * The maximum possible value that the spinner can reach. (Exclusive)
	 */
	maximum: number = 0;


	/**
	 * Sets the message that will show when the spinner is not available.
	 */
	disabledMessage: string = "Not available";


	/**
	 * Triggers when the spinner value changes.
	 */
	onChange?: (index: number) => void;


	/**
	 * Gets or sets the selected value in the spinner.
	 */
	value: number = 0;


	/**
	 * Sets the spinner to the specified value.
	 * @param value The number to set the spinner to.
	 */
	set(value: number)
	{
		const widget = this.getWidget<SpinnerWidget>();
		if (this.maximum <= 0)
		{
			log(`(${this._name}) Maximum is zero or negative, value ${value} was not applied.`);
			return;
		}

		switch (this.wrapMode)
		{
			case "wrap":
				value = (value < 0) ? (this.maximum - 1) : (value % this.maximum);
				break;

			case "clamp":
				if (value < 0)
					value = 0;
				else if (value >= this.maximum)
					value = (this.maximum - 1);
				break;
		}

		this.value = value;
		log(`(${this._name}) Set to ${value}. (max: ${this.maximum}, mode: ${this.wrapMode})`);

		if (this.onChange)
			this.onChange(value);

		this.refreshWidget(widget);
	}


	/**
	 * Creates a new spinner widget for a window.
	 */
	createWidget(): SpinnerWidget
	{
		return {
			...this._description,
			type: "spinner",
			text: "",
			onIncrement: () => this.onWidgetChange(this.value + 1),
			onDecrement: () => this.onWidgetChange(this.value - 1)
		};
	}


	/**
	 * Triggered when a new item is selected in the the dropdown.
	 * @param index The number the spinner was set to.
	 */
	private onWidgetChange(index: number)
	{
		const widget = this.getWidget<SpinnerWidget>();
		if (widget.isDisabled || !this.onChange)
		{
			log(`(${this._name}) Widget is disabled, no change event triggered.`);
			return;
		}
		log(`--->(${this._name}) Try updating ${this.value} -> ${index}.`);
		this.set(index);
	}


	/** @inheritdoc */
	protected refreshWidget(widget: SpinnerWidget)
	{
		if (this.maximum <= 0)
		{
			widget.text = this.disabledMessage;
			widget.isDisabled = true;
		}
		else
		{
			widget.text = this.value.toString();
			widget.isDisabled = (this.maximum <= 1);
		}
	}
}

export default Spinner;
