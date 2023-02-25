import { checkbox, CheckboxParams, compute, dropdown, FlexiblePosition, groupbox, horizontal, LabelParams, SpinnerParams, WidgetCreator, window } from "openrct2-flexui";
import { ParkRide } from "../objects/parkRide";
import { setBuildMonth, setCustomDesign, setExcitementRating, setFrozenRatings, setIndestructable, setIntensityRating, setNauseaRating } from "../services/rideEditor";
import { formatMonthAndYear, formatRelativeDate } from "../utilities/date";
import * as Log from "../utilities/logger";
import { RideViewModel } from "../viewmodels/rideVehicleModel";
import { combinedLabelCheckbox, combinedLabelSpinner } from "./utilityControls";


const int16max = 32_766, int16min = -32_768;


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
	width: 255, minWidth: 225, maxWidth: 275,
	height: 216,
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
					text: "Excitement",
					tooltip: "Happy guests make for a happy life.",
					value: model._excitement,
					step: model._multiplier,
					minimum: int16min,
					maximum: int16max,
					format: formatRating,
					onChange: v => modifyRide(setExcitementRating, v)
				}),
				labelSpinner({
					text: "Intensity",
					tooltip: "Guests will prefer rides that match their intensity preference.",
					value: model._intensity,
					step: model._multiplier,
					minimum: int16min,
					maximum: int16max,
					format: formatRating,
					onChange: v => modifyRide(setIntensityRating, v)
				}),
				labelSpinner({
					text: "Nausea",
					tooltip: "The higher the value, the more yellow your paths will be.",
					value: model._nausea,
					step: model._multiplier,
					minimum: int16min,
					maximum: int16max,
					format: formatRating,
					onChange: v => modifyRide(setNauseaRating, v)
				}),
				horizontal([
					checkbox({
						text: "Freeze rating calculation",
						tooltip: "When ticked, the ratings will not be recalculated anymore. Your ride will always be awesome even if it sucks.",
						isChecked: model._freezeStats,
						onChange: v => modifyRide(setFrozenRatings, v)
					}),
					dropdown({
						width: 45,
						padding: { left: "1w" },
						items: ["x1", "x10", "x100"],
						tooltip: "Multiplies all spinner controls by the specified amount",
						onChange: idx => model._multiplier.set(10 ** idx),
					})
				])
			]
		}),
		groupbox({
			text: "Construction",
			tooltip: "Edit properties related to the construction of the ride",
			padding: { top: 4 },
			content: [
				labelSpinner({
					text: "Build month",
					tooltip: "The month in which this ride was built. Somehow never in the winter months.",
					value: model._buildMonth,
					minimum: int16min,
					maximum: int16max,
					format: formatMonthAndYear,
					onChange: v => modifyRide(setBuildMonth, v)
				}),
				labelSpinner({
					text: "Construction",
					tooltip: "The amount of time ago the ride was built, in months and years. Rides get older as well, just like you.",
					value: compute(model._buildMonth, v => (v - date.monthsElapsed)),
					minimum: int16min,
					maximum: int16max,
					format: formatRelativeDate,
					onChange: v => modifyRide(setBuildMonth, v - date.monthsElapsed)
				}),
				labelCheckbox({
					text: "Custom design",
					tooltip: "Whether or not the ride is a custom design or a standard track design, which is used for the 'Best custom-designed rides' award.",
					isChecked: model._customDesign,
					onChange: v => modifyRide(setCustomDesign, v)
				}),
				labelCheckbox({
					text: "Indestructable",
					tooltip: "Indestructable rides cannot be demolished, even if you ask them nicely.",
					isChecked: model._indestructable,
					onChange: v => modifyRide(setIndestructable, v)
				}),
			]
		})
	]
});


function labelSpinner(params: LabelParams & SpinnerParams): WidgetCreator<FlexiblePosition>
{
	return combinedLabelSpinner(85, "1w", params);
}

function labelCheckbox(params: LabelParams & CheckboxParams): WidgetCreator<FlexiblePosition>
{
	return combinedLabelCheckbox(85, params);
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