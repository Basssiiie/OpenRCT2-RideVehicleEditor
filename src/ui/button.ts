import * as Log from "../utilities/logger";
import Control, { ControlParams } from "./control";


/**
 * Whether the button is a pressable button or a toggle button.
 */
export type ButtonMode = "press" | "toggle";


/**
 * Whether the toggle button is pressed down or pressed up.
 */
export type PressType = "down" | "up";


/**
 * The parameters for configuring the button.
 */
export interface ButtonParams extends ControlParams
{
	/**
	 * The id of a sprite to use as image.
	 * @default undefined
	 */
	image?: number;

	/**
	 * Whether the button starts off being pressed or not.
	 * @default false
	 */
	isPressed?: boolean;

	/**
	 * Whether the button is a pressable button or a toggle button.
	 * @default "press"
	 */
	mode?: ButtonMode;

	/**
	 * Triggers when the button is pressed.
	 */
	onClick?: (type: PressType) => void;
}


/**
 * A controller class for a button widget.
 */
export default class ButtonControl extends Control<ButtonParams>
{
	/**
	 * Create a button control with the specified parameters.
	 * @param params The parameters for the control.
	 */
	constructor(params: ButtonParams)
	{
		super(params);
		params.isPressed ??= false;
		params.mode ??= "press";
	}


	/**
	 * Presses the button.
	 */
	press(): void
	{
		if (!this._params.isActive)
		{
			Log.debug(`(${this._params.name}) Button is inactive, event was not triggered.`);
			return;
		}

		const widget = this.getWidget<ButtonWidget>();
		Log.debug(`(${this._params.name}) Button was pressed (mode: ${this._params.mode}).`);

		let pressType: PressType;
		if (this._params.mode === "toggle")
		{
			const wasPressed = widget.isPressed;
			widget.isPressed = !wasPressed;
			this.refreshWidget(widget);

			pressType = (wasPressed) ? "up" : "down";
		}
		else
		{
			pressType = "down";
		}

		this._params.onClick?.(pressType);
	}


	/**
	 * Sets the button pressed down or up.
	 * @param type Whether the button should be pressed down or up.
	 */
	set(type: PressType): void
	{
		const widget = this.getWidget<ButtonWidget>();
		widget.isPressed = (type === "down");
		this.refreshWidget(widget);
	}


	/**
	 * Creates a new dropdown widget for a window.
	 */
	createWidget(): ButtonWidget
	{
		return {
			...this._params,
			type: "button",
			isDisabled: !this._params.isActive,
			onClick: (): void => this.press()
		};
	}


	/** @inheritdoc */
	protected refreshWidget(widget: ButtonWidget): void
	{
		widget.isDisabled = !this._params.isActive;
	}
}
