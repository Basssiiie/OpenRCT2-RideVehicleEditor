import Log from "../helpers/logger";
import { clamp, wrap } from "../helpers/utilityHelpers";
import Component from "./component";

/**
 * Determines whether the spinner value wraps around or clamps to its boundaries.
 */
type WrapMode = "wrap" | "clamp" | "clampThenWrap";


/**
 * A controller class for a spinner widget.
 */
class SpinnerComponent extends Component
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
	 * The maximum possible value that the spinner can reach. (Inclusive)
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
	 * Triggers when the spinner value changes. The adjustment specifies the change
	 * that has been applied to the value in the spinner.
	 */
	onChange?: (value: number, adjustment: number) => void;


	/**
	 * Allows for a custom formatted display every time the value gets refreshed.
	 */
	format?: (value: number) => string;


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
	 * 
	 * @param value The number to set the spinner to.
	 */
	set(value: number)
	{
		const widget = this.getWidget<SpinnerWidget>();
		if (this.minimum >= this.maximum)
		{
			Log.debug(`(${this._name}) Minimum is equal to or larger than maximum, value ${value} was not applied.`);
			return;
		}

		this._isActive = true;
		this._value = this.performWrapMode(value);

		this.refreshWidget(widget);
	}


	/**
	 * Wrap or clamp based on the setting in this spinner.
	 */
	private performWrapMode(value: number): number
	{
		const min = this.minimum;
		const max = this.maximum;

		switch (this.wrapMode)
		{
			case "wrap":
				return wrap(value, min, max + 1);

			case "clamp":
				return clamp(value, min, max + 1);

			case "clampThenWrap":
				// Wrap if old value is at the limit, otherwise clamp.
				return (this._value === min || this._value === max)
					? wrap(value, min, max + 1)
					: clamp(value, min, max + 1);
				
		}
	}


	/**
	 * Creates a new spinner widget for a window.
	 */
	createWidget(): SpinnerWidget
	{
		return {
			...this.description,
			type: "spinner",
			text: "",
			onIncrement: () => this.onWidgetChange(this._value,  this.increment),
			onDecrement: () => this.onWidgetChange(this._value, -this.increment)
		};
	}


	/**
	 * Triggered when a value is selected in the spinner.
	 * 
	 * @param value The number the spinner was set to.
	 */
	private onWidgetChange(value: number, adjustment: number)
	{
		const widget = this.getWidget<SpinnerWidget>();
		if (widget.isDisabled)
		{
			Log.debug(`(${this._name}) Widget is disabled, no change event triggered.`);
			return;
		}
		value += adjustment;
		Log.debug(`--->(${this._name}) Try updating ${this._value} -> ${value}, adjustment: ${adjustment}.`);

		this.set(value);

		if (this.onChange)
			this.onChange(this._value, adjustment);
	}


	/** @inheritdoc */
	protected refreshWidget(widget: SpinnerWidget)
	{
		if (this._isActive && this.minimum < this.maximum)
		{
			widget.text = (this.format)
				? this.format(this.value)
				: this._value.toString();

			widget.isDisabled = (this.minimum >= (this.maximum - 1));
		}
		else
		{
			widget.text = this.disabledMessage;
			widget.isDisabled = true;
		}
	}
}

export default SpinnerComponent;
