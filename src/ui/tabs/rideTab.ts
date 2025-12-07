import { checkbox, compute, dropdown, DropdownParams, groupbox, label, LabelParams, Store } from "openrct2-flexui";
import { formatRelativeDate, getDateMonth, getDateYear, monthNames } from "../../utilities/date";
import { Rating, RideFlag, RideViewModel } from "../../viewmodels/rideViewModel";
import { labelled } from "../utilityControls";
import { int16max, int16min } from "../widgets/constants";
import { credits } from "../widgets/credits";
import { labelSpinner } from "../widgets/labelSpinner";
import { createAnimatedIcon } from "./icons";
import { createTab } from "../../viewmodels/tabViewModel";

const controlsLabelWidth = 85;


export function createRideTab(ride: RideViewModel, multiplier: Store<number>)
{
	return createTab(
		createAnimatedIcon(5442, 17, 4),
		ride,
		[
			groupbox({
				text: "Ratings",
				tooltip: "Edit the ratings of the ride",
				content: [
					labelSpinner({
						_label: { text: "Excitement:" },
						tooltip: "Happy guests make for a happy life.",
						value: ride._excitement,
						step: multiplier,
						minimum: int16min,
						maximum: int16max,
						format: formatRating,
						onChange: value => ride._setRating(Rating.Excitement, value)
					}),
					labelSpinner({
						_label: { text: "Intensity:" },
						tooltip: "Guests will prefer rides that match their intensity preference.",
						value: ride._intensity,
						step: multiplier,
						minimum: int16min,
						maximum: int16max,
						format: formatRating,
						onChange: value => ride._setRating(Rating.Intensity, value)
					}),
					labelSpinner({
						_label: { text: "Nausea:" },
						tooltip: "The higher the value, the more yellow your paths will be.",
						value: ride._nausea,
						step: multiplier,
						minimum: int16min,
						maximum: int16max,
						format: formatRating,
						onChange: value => ride._setRating(Rating.Nauseas, value)
					}),
					checkbox({
						text: "Freeze rating calculation",
						tooltip: "When ticked, the ratings will not be recalculated anymore. Your ride will always be awesome even if it sucks.",
						isChecked: ride._freezeStats,
						onChange: value => ride._setRideFlag(RideFlag.FrozenRatings, value)
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
						selectedIndex: compute(ride._buildMonth, month => getDateMonth(month)),
						onChange: ride._setBuildMonth.bind(ride)
					}),
					labelSpinner({
						_label: { text: "Build year:" },
						tooltip: "The year in which this ride was built.",
						wrapMode: "clamp",
						value: compute(ride._buildMonth, month => getDateYear(month)),
						step: multiplier,
						minimum: -268_435_456, // 32-bit min / 8 months + 1
						maximum: 268_435_455, // 32-bit max / 8 months
						onChange: ride._setBuildYear.bind(ride)
					}),
					labelled<LabelParams>({
						_control: label,
						_label: { text: "Construction:", width: controlsLabelWidth },
						text: compute(ride._buildMonth, ride._currentMonth, (build, current) => formatRelativeDate(build - current)),
						tooltip: "The amount of time ago the ride was built, in months and years. Rides get older as well, just like you."
					}),
					checkbox({
						text: "Custom design",
						tooltip: "Whether or not the ride is a custom design or a standard track design, which is used for the 'Best custom-designed rides' award.",
						isChecked: ride._customDesign,
						onChange: value => ride._setRideFlag(RideFlag.CustomDesign, value)
					}),
					checkbox({
						text: "Indestructable",
						tooltip: "Indestructable rides cannot be demolished, even if you ask them nicely.",
						isChecked: ride._indestructable,
						onChange: value => ride._setRideFlag(RideFlag.Indestructable, value)
					})
				]
			}),
			credits()
		]
	);
}


function formatRating(value: number): string
{
	return (value / 100).toFixed(2);
}
