/* eslint-disable @typescript-eslint/no-extraneous-class */
import { compute, store } from "openrct2-flexui";
import { PositionalTabViewModel } from "./positionalTabViewModel";
import { SelectionViewModel } from "./selectionViewModel";
import { StylingTabViewModel } from "./stylingTabViewModel";


export class EditorViewModel
{
	readonly _title;

	readonly _styling;
	readonly _positional;
	//readonly _ride = new RideTabViewModel();

	readonly _isMoving;
	readonly _isPicking = store<boolean>(false);
	readonly _isDragging = store<boolean>(false);
	readonly _isEditDisabled;
	readonly _isSpinDisabled;
	readonly _isPositionDisabled;
	readonly _multiplierIndex;
	readonly _multiplier;
	readonly _formatPosition;


	private readonly _selection: SelectionViewModel;

	constructor(selection: SelectionViewModel)
	{
		const styling = new StylingTabViewModel(selection);
		const positional = new PositionalTabViewModel(selection);

		const isMoving = store(false);
		const isEditDisabled = compute(selection._vehicle, v => !v);
		const multiplierIndex = store<number>(0);

		this._selection = selection;
		this._styling = styling;
		this._positional = positional;

		this._title = compute(selection._ride, ride => (ride ? ride[0]._ride().name : "<unknown ride>"));
		this._isMoving = isMoving;
		this._isEditDisabled = isEditDisabled;
		this._isSpinDisabled = compute(styling._spinFrames, v => !v);
		this._isPositionDisabled = compute(isMoving, isEditDisabled, (m, e) => m || e);
		this._formatPosition = (pos: number): string => (isEditDisabled.get() ? "Not available" : pos.toString());

		this._multiplierIndex = multiplierIndex;
		this._multiplier = compute(multiplierIndex, idx => (10 ** idx));
	}
}
