import Log from "../utilities/logger";
import MathHelper from "../utilities/mathHelper";
import Control, { ControlParams } from "./control";

/**
 * Determines whether the spinner value wraps around or clamps to its boundaries.
 */
export type WrapMode = "wrap" | "clamp" | "clampThenWrap";


/**
 * The parameters for configuring the spinner.
 */
export interface SpinnerParams extends ControlParams
{
	/**
	 * The minimum possible value that the spinner can reach. (Inclusive)
	 */
	minimum: number;


	/**
	 * The maximum possible value that the spinner can reach. (Exclusive)
	 */
	maximum: number;


	/**
	 * The amount to increment or decrement per interaction.
	 * @default 1
	 */
	increment?: number;


	/**
	 * Sets whether the spinner value wraps around or clamps to its boundaries.
	 * @default "wrap"
	 */
	wrapMode?: WrapMode;


	/**
	 * Sets the message that will show when the spinner is not available.
	 * @default "Not available"
	 */
	disabledMessage?: string;


	/**
	 * Triggers when the spinner value changes. The adjustment specifies the change
	 * that has been applied to the value in the spinner.
	 */
	onChange?: (value: number, adjustment: number) => void;


	/**
	 * Allows for a custom formatted display every time the value gets refreshed.
	 */
	format?: (value: number) => string;
}


/**
 * A controller class for a spinner widget.
 */
export default class SpinnerControl extends Control<SpinnerParams>
{
	/**
	 * Gets the selected value in the spinner.
	 */
	get value()
	{
		return this._value;
	}
	private _value: number = 0;


	/**
	 * Create a spinner control with the specified parameters.
	 * @param params The parameters for the control.
	 */
	constructor(params: SpinnerParams)
	{
		super(params);
		params.increment ??= 1;
		params.wrapMode ??= "wrap";
		params.disabledMessage ??= "Not available";
	}


	/**
	 * Sets the spinner to the specified value.
	 * @param value The number to set the spinner to.
	 */
	set(value: number)
	{
		const min = this.params.minimum;
		const max = this.params.maximum;

		if (min >= max)
		{
			Log.debug(`(${this.params.name}) Minimum ${min} is equal to or larger than maximum ${max}, value ${value} was not applied.`);
			return;
		}

		this._isActive = true;
		switch (this.params.wrapMode)
		{
			default:
				this._value = MathHelper.wrap(value, min, max);

			case "clamp":
				this._value = MathHelper.clamp(value, min, max);

			case "clampThenWrap":
				// Wrap if old value is at the limit, otherwise clamp.
				this._value = (value < min && this._value === min) || (value >= max && this._value === (max - 1))
					? MathHelper.wrap(value, min, max)
					: MathHelper.clamp(value, min, max);
		}

		//Log.debug(`(${this.params.name}) Spinner value is changed to ${this._value}. (unwrapped: ${value}, range: ${min}<->${max})`);

		const widget = this.getWidget<SpinnerWidget>();
		this.refreshWidget(widget);
	}


	/**
	 * Creates a new spinner widget for a window.
	 */
	createWidget(): SpinnerWidget
	{
		return {
			...this.params,
			type: "spinner",
			text: "",
			onIncrement: () => this.onWidgetChange(this._value,  this.params.increment),
			onDecrement: () => this.onWidgetChange(this._value, -this.params.increment)
		};
	}


	/**
	 * Triggered when a value is selected in the spinner.
	 * @param value The number the spinner was set to.
	 */
	private onWidgetChange(value: number, adjustment: number)
	{
		const widget = this.getWidget<SpinnerWidget>();
		if (widget.isDisabled)
		{
			Log.debug(`(${this.params.name}) Widget is disabled, no change event triggered.`);
			return;
		}
		value += adjustment;
		this.set(value);

		if (this.params.onChange)
		{
			this.params.onChange(this._value, adjustment);
		}
	}


	/** @inheritdoc */
	protected refreshWidget(widget: SpinnerWidget)
	{
		if (this._isActive && this.params.minimum < this.params.maximum)
		{
			widget.text = (this.params.format)
				? this.params.format(this.value)
				: this._value.toString();

			widget.isDisabled = (this.params.minimum >= (this.params.maximum - 1));
		}
		else
		{
			widget.text = this.params.disabledMessage;
			widget.isDisabled = true;
		}
	}
}
