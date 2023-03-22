import { checkbox, compute, dropdown, DropdownParams, FlexiblePosition, groupbox, label, LabelParams, WidgetCreator, window } from "openrct2-flexui";
import { ParkRide } from "../objects/parkRide";
import { setBuildMonth, setBuildYear, setCustomDesign, setExcitementRating, setFrozenRatings, setIndestructable, setIntensityRating, setNauseaRating } from "../services/rideEditor";
import { formatRelativeDate, getDateMonth, getDateYear, monthNames } from "../utilities/date";
import * as Log from "../utilities/logger";
import { RideViewModel } from "../viewmodels/rideVehicleModel";
import { labelled, labelledSpinner, LabelledSpinnerParams, multiplier } from "./utilityControls";


const int16max = 32_767, int16min = -32_768;
const controlsLabelWidth = 85;


/**
 * The viewmodel that interacts with the ride window.
 */
export const model = new RideViewModel();


/**
 * Window to edit properties of the currently selected ride.
 */
export const rideWindow = window({
	title: model._title,
	position: "center",
	width: 233, minWidth: 185, maxWidth: 250,
	height: 252,
	colours: [ 24, 24 ],
	onOpen: () => model._open(),
	onClose: () => model._close(),
	content: [
		groupbox({
			text: "Ratings",
			tooltip: "Edit the ratings of the ride",
			padding: { top: 4 },
			content: [
				labelSpinner({
					_label: { text: "Excitement:" },
					tooltip: "Happy guests make for a happy life.",
					value: model._excitement,
					step: model._multiplier,
					minimum: int16min,
					maximum: int16max,
					format: formatRating,
					onChange: value => modifyRide(setExcitementRating, value)
				}),
				labelSpinner({
					_label: { text: "Intensity:" },
					tooltip: "Guests will prefer rides that match their intensity preference.",
					value: model._intensity,
					step: model._multiplier,
					minimum: int16min,
					maximum: int16max,
					format: formatRating,
					onChange: value => modifyRide(setIntensityRating, value)
				}),
				labelSpinner({
					_label: { text: "Nausea:" },
					tooltip: "The higher the value, the more yellow your paths will be.",
					value: model._nausea,
					step: model._multiplier,
					minimum: int16min,
					maximum: int16max,
					format: formatRating,
					onChange: value => modifyRide(setNauseaRating, value)
				}),
				checkbox({
					text: "Freeze rating calculation",
					tooltip: "When ticked, the ratings will not be recalculated anymore. Your ride will always be awesome even if it sucks.",
					isChecked: model._freezeStats,
					onChange: v => modifyRide(setFrozenRatings, v)
				})
			]
		}),
		groupbox({
			text: "Construction",
			tooltip: "Edit properties related to the construction of the ride",
			padding: { top: 4 },
			content: [
				labelled<DropdownParams>({
					_control: dropdown,
					_label: { text: "Build month:", width: controlsLabelWidth },
					tooltip: "The month in which this ride was built. Somehow never in the winter months.",
					items: monthNames,
					selectedIndex: compute(model._buildMonth, month => getDateMonth(month)),
					onChange: value => modifyRide(setBuildMonth, value)
				}),
				labelSpinner({
					_label: { text: "Build year:" },
					tooltip: "The year in which this ride was built.",
					wrapMode: "clamp",
					value: compute(model._buildMonth, month => getDateYear(month)),
					step: model._multiplier,
					minimum: -268_435_456, // 32-bit min / 8 months + 1
					maximum: 268_435_455, // 32-bit max / 8 months
					onChange: value => modifyRide(setBuildYear, value)
				}),
				labelled<LabelParams>({
					_control: label,
					_label: { text: "Construction:", width: controlsLabelWidth },
					text: compute(model._buildMonth, model._currentMonth, (build, current) => formatRelativeDate(build - current)),
					tooltip: "The amount of time ago the ride was built, in months and years. Rides get older as well, just like you.",
				}),
				checkbox({
					text: "Custom design",
					tooltip: "Whether or not the ride is a custom design or a standard track design, which is used for the 'Best custom-designed rides' award.",
					isChecked: model._customDesign,
					onChange: value => modifyRide(setCustomDesign, value)
				}),
				checkbox({
					text: "Indestructable",
					tooltip: "Indestructable rides cannot be demolished, even if you ask them nicely.",
					isChecked: model._indestructable,
					onChange: value => modifyRide(setIndestructable, value)
				})
			]
		}),
		multiplier(model._multiplierIndex)
	]
});


function labelSpinner(params: LabelledSpinnerParams & FlexiblePosition): WidgetCreator<FlexiblePosition>
{
	params._label.width = controlsLabelWidth;
	return labelledSpinner(params);
}

function formatRating(value: number): string
{
	return (value / 100).toFixed(2);
}

function modifyRide<T>(action: (ride: ParkRide, value: T) => void, value: T): void
{
	const ride = model._ride.get();
	if (ride)
	{
		action(ride, value);
	}
	else
	{
		Log.debug("Failed to modify ride with", action, "to", value, "; none is selected.");
	}
}