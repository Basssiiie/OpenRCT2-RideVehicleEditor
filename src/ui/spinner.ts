import * as Log from "../utilities/logger";
import * as MathHelper from "../utilities/mathHelper";
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
	get value(): number
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
	set(value: number): void
	{
		/*if (!this._params.isActive)
		{
			Log.debug(`(${this.params.name}) Spinner is inactive, value ${value} was not applied.`);
			return;
		}*/

		const min = this._params.minimum;
		const max = this._params.maximum;

		if (min >= max)
		{
			Log.debug(`(${this._params.name}) Minimum ${min} is equal to or larger than maximum ${max}, value ${value} was not applied.`);
			return;
		}

		switch (this._params.wrapMode)
		{
			default:
			{
				this._value = MathHelper.wrap(value, min, max);
				break;
			}
			case "clamp":
			{
				this._value = MathHelper.clamp(value, min, max);
				break;
			}
			case "clampThenWrap":
			{
				// Wrap if old value is at the limit, otherwise clamp.
				this._value = (value < min && this._value === min) || (value >= max && this._value === (max - 1))
					? MathHelper.wrap(value, min, max)
					: MathHelper.clamp(value, min, max);
				break;
			}
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
			...this._params,
			type: "spinner",
			text: "",
			onIncrement: (): void => this.onWidgetChange(this._value,  this._params.increment),
			onDecrement: (): void => this.onWidgetChange(this._value, -this._params.increment)
		};
	}


	/**
	 * Triggered when a value is selected in the spinner.
	 * @param value The number the spinner was set to.
	 */
	private onWidgetChange(value: number, adjustment: number): void
	{
		const widget = this.getWidget<SpinnerWidget>();
		if (widget.isDisabled)
		{
			Log.debug(`(${this._params.name}) Widget is disabled, no change event triggered.`);
			return;
		}
		value += adjustment;
		this.set(value);

		this._params.onChange?.(this._value, adjustment);
	}


	/** @inheritdoc */
	protected refreshWidget(widget: SpinnerWidget): void
	{
		if (this._params.isActive && this._params.minimum < this._params.maximum)
		{
			widget.text = (this._params.format)
				? this._params.format(this.value)
				: this._value.toString();

			widget.isDisabled = (this._params.minimum >= (this._params.maximum - 1));
		}
		else
		{
			widget.text = this._params.disabledMessage;
			widget.isDisabled = true;
		}
	}
}
