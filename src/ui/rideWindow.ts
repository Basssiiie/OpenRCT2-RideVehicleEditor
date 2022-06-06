import { checkbox, CheckboxParams, dropdown, FlexiblePosition, groupbox, horizontal, LabelParams, SpinnerParams, WidgetCreator, window } from "openrct2-flexui";
import { ParkRide } from "../objects/parkRide";
import { setBuildMonth, setCustomDesign, setExcitementRating, setFrozenRatings, setIndestructable, setIntensityRating, setNauseaRating } from "../services/rideEditor";
import * as Log from "../utilities/logger";
import { RideViewModel } from "../viewmodels/rideVehicleModel";
import { combinedLabelCheckbox, combinedLabelSpinner } from "./utilityControls";


const months = [ "Mar.", "Apr.", "May", "Jun.", "Jul.", "Aug.", "Sep.", "Oct." ];


export const model = new RideViewModel();


export const rideWindow = window({
	title: model.title,
	position: "center",
	width: 220,
	height: 195,
	colours: [ 24, 24 ],
	content: [
		groupbox({
			text: "Ratings",
			tooltip: "Edit the ratings of the ride",
			padding: { top: 4 },
			gap: [12, 8, 8, 8],
			content: [
				labelSpinner({
					text: "Excitement",
					tooltip: "Happy guests make for a happy life.",
					value: model.excitement,
					step: model.multiplier,
					maximum: 800,
					format: formatRating,
					onChange: v => modifyRide(setExcitementRating, v)
				}),
				labelSpinner({
					text: "Intensity",
					tooltip: "Guests will prefer rides that match their intensity preference.",
					value: model.intensity,
					step: model.multiplier,
					maximum: 800,
					format: formatRating,
					onChange: v => modifyRide(setIntensityRating, v)
				}),
				labelSpinner({
					text: "Nausea",
					tooltip: "The higher the value, the more yellow your paths will be.",
					value: model.nausea,
					step: model.multiplier,
					maximum: 800,
					format: formatRating,
					onChange: v => modifyRide(setNauseaRating, v)
				}),
				horizontal([
					checkbox({
						text: "Freeze rating calculation",
						tooltip: "When ticked, the ratings will not be recalculated anymore. Your ride will always be awesome even if it sucks.",
						isChecked: model.freezeStats,
						onChange: v => modifyRide(setFrozenRatings, v)
					}),
					dropdown({
						width: 45,
						padding: { left: "1w" },
						items: ["x1", "x10", "x100"],
						tooltip: "Multiplies all spinner controls by the specified amount",
						onChange: idx => model.multiplier.set(10 ** idx),
					})
				])
			]
		}),
		groupbox({
			text: "Construction",
			tooltip: "Edit properties related to the construction of the ride",
			padding: { top: 4 },
			gap: [12, 8, 8, 8],
			content: [
				labelSpinner({
					text: "Build month",
					tooltip: "The month in which this ride was built.",
					value: model.buildMonth,
					minimum: -32_768,
					maximum: 32_767,
					format: formatBuildMonth,
					onChange: v => modifyRide(setBuildMonth, v)
				}),
				labelCheckbox({
					text: "Custom design",
					tooltip: "Whether or not the ride is a custom design or a standard track design, which is used for the 'Best custom-designed rides' award.",
					isChecked: model.customDesign,
					onChange: v => modifyRide(setCustomDesign, v)
				}),
				labelCheckbox({
					text: "Indestructable",
					tooltip: "Indestructable rides cannot be demolished.",
					isChecked: model.indestructable,
					onChange: v => modifyRide(setIndestructable, v)
				}),
			]
		})
	]
});


function labelSpinner(params: LabelParams & SpinnerParams): WidgetCreator<FlexiblePosition>
{
	return combinedLabelSpinner("45%", "55%", params);
}

function labelCheckbox(params: LabelParams & CheckboxParams): WidgetCreator<FlexiblePosition>
{
	return combinedLabelCheckbox("45%", params);
}

function formatRating(value: number): string
{
	return (value / 100).toFixed(2);
}


function formatBuildMonth(value: number): string
{
	const amountOfMonths = months.length;
	const month = (((value % amountOfMonths) + amountOfMonths) % amountOfMonths);
	const year = Math.floor(value / amountOfMonths);

	return `${months[month]}, Year ${year}`;
}


function modifyRide<T>(action: (ride: ParkRide, value: T) => void, value: T): void
{
	const ride = model.ride.get();
	if (ride)
	{
		action(ride, value);
	}
	else
	{
		Log.debug(`Failed to modify ride with '${action}' to '${value}'; none is selected.`);
	}
}