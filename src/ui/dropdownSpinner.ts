import { Dropdown } from "./dropdown";
import { Spinner } from "./spinner";
import { WidgetDesc } from "./widgetDesc";


/**
 * A dropdown with a spinner component on the side.
 */
export class DropdownSpinner extends Dropdown
{
    // The attached spinner component.
    private _spinner: Spinner;


    constructor(description: WidgetDesc)
    {
        super({
            ...description,
            width: (description.width - 24)
        });
        this._spinner = new Spinner({
            ...description,
            name: (description.name + "-spinner"),
        });
        this._spinner.disabledMessage = "";
        this._spinner.onChange = (i => this.set(i));
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
    bind(window: Window)
    {
        this._spinner.bind(window);
        super.bind(window);
    }


    /** @inheritdoc */
    protected onChange(index: number)
    {
        this._spinner.set(index);
        super.onChange(this._spinner.value);
	}


    /** @inheritdoc */
    protected refreshWidget(widget: DropdownWidget): void
    {
        this._spinner.maximum = this.items.length;
        this._spinner.refresh();

        super.refreshWidget(widget);
    }
}
