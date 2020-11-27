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
	 * The maximum possible value that the spinner can reach. (Inclusive)
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
	 * Gets the selected value in the spinner.
	 */
	get value()
	{
		return this._value;
	}
	private _value: number = 0;


	/**
	 * Sets the spinner to the specified value.
	 * @param value The number to set the spinner to.
	 */
	set(value: number)
	{
		if (value == this._value)
		{
			log(`Spinner is already set to value '${value}'.`);
			return;
		}

		const widget = this.getWidget<SpinnerWidget>();
		if (widget.isDisabled || this.maximum <= 0)
		{
			log(`Spinner is disabled, value '${value}' was not applied.`);
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

		this._value = value;
		log(`Set spinner to ${value}.`);

		if (this.onChange)
			this.onChange(value);

		this.refreshWidget(widget);
	}


	/**
	 * Increments the value in the spinner.
	 */
	increment()
	{
		this.set(this._value + 1);
	}


	/**
	 * Decrements the value in the spinner.
	 */
	decrement()
	{
		this.set(this._value - 1);
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
			onIncrement: () => this.increment(),
			onDecrement: () => this.decrement()
		};
	}


	/** @inheritdoc */
	protected refreshWidget(widget: SpinnerWidget)
	{
		if (widget.isDisabled || this.maximum <= 0)
		{
			widget.text = this.disabledMessage;
		}
		else
		{
			widget.text = this._value.toString();
		}
	}
}

export default Spinner;
