import { button, groupbox, label, tab, textbox, twoway } from "openrct2-flexui";
import { RideViewModel } from "../../viewmodels/rideViewModel";
import { buttonSize } from "../widgets/constants";
import { credits } from "../widgets/credits";
import { createAnimatedIcon } from "./icons";

export function createNamingTab(model: RideViewModel)
{
	return tab({
		image: createAnimatedIcon(5277, 7, 4),
		content: [
			groupbox({
				text: "Ride name",
				tooltip: "Edit the name of the ride",
				content: [
					textbox({
						text: twoway(model._title)
					}),
					label({
						text: model._title
					}),
					button({
						text: "Rename ride",
						height: buttonSize,
						onClick: () =>
						{
							ui.showTextInput({
								title: "Ride/attraction name",
								initialValue: model._title.get(),
								description: "Enter new name for this ride/attraction:",
								callback: input =>
								{
									const ride = model._ride.get();
									if (ride)
									{
										context.executeAction("ridesetname", {ride: ride._id, name: input});
									}
								}
							});
						}
					})
				]
			}),
			credits()
		]
	});
}
