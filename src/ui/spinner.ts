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
	 * The minimum possible value that the spinner can reach. (Inclusive)
	 */
	minimum: number = 0;


	/**
	 * The maximum possible value that the spinner can reach. (Exclusive)
	 */
	maximum: number = 0;


	/**
	 * The amount to increment or decrement per interaction.
	 */
	increment = 1;


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
		if (this.minimum >= this.maximum)
		{
			log(`(${this._name}) Minimum is equal to or larger than maximum, value ${value} was not applied.`);
			return;
		}

		this._isActive = true;
		this.value = this.performWrapMode(value);

		log(`(${this._name}) Set to ${this.value}. (max: ${this.maximum}, mode: ${this.wrapMode})`);

		this.refreshWidget(widget);
	}


	/**
	 * Wrap or clamp based on the setting in this spinner.
	 */
	private performWrapMode(value: number): number
	{
		switch (this.wrapMode)
		{
			case "wrap":
				if (value < this.minimum)
					value = (this.maximum - 1);
				else if (value >= this.maximum)
					value = this.minimum;
				break;

			case "clamp":
				if (value < this.minimum)
					value = this.minimum;
				else if (value >= this.maximum)
					value = (this.maximum - 1);
				break;
		}

		return value;
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
			onIncrement: () => this.onWidgetChange(this.value + this.increment),
			onDecrement: () => this.onWidgetChange(this.value - this.increment)
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

		if (this.onChange)
			this.onChange(this.value);
	}


	/** @inheritdoc */
	protected refreshWidget(widget: SpinnerWidget)
	{
		if (this._isActive && this.minimum < this.maximum)
		{
			widget.text = this.value.toString();
			widget.isDisabled = (this.minimum >= (this.maximum - 1));
		}
		else
		{
			widget.text = this.disabledMessage;
			widget.isDisabled = true;
		}
	}
}

export default Spinner;
