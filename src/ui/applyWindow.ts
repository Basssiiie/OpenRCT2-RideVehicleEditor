import { button, checkbox, dropdown, groupbox, label, window } from "openrct2-flexui";


export const applyWindow = window({
	title: "Apply to other vehicles",
	width: 200,
	height: 208,
	colours: [ 12, 12 ],
	content: [
		label({
			text: "Apply to:",
			tooltip: "Apply the selected vehicle settings to a specific set of other vehicles on this ride.",
			height: 11
		}),
		dropdown({
			items: [
				"All vehicles",
				"Preceding vehicles",
				"Following vehicles",
				"All vehicles on all trains",
				"Preceding vehicles on all trains",
				"Following vehicles on all trains",
				"Same vehicle on all trains",
			],
			tooltip: "Apply the selected vehicle settings to a specific set of other vehicles on this ride.",
			padding: [0, 1],
		}),
		groupbox({
			text: "Only",
			tooltip: "Select which of these settings should be applied.",
			padding: { top: 8 },
			gap: [14, 10, 10, 10],
			content: [
				checkbox({
					text: "Type & variant",
					tooltip: "Copy the selected ride type and variant to other vehicles."
				}),
				checkbox({
					text: "Seats",
					tooltip: "Copy the selected seat count to other vehicles."
				}),
				checkbox({
					text: "Mass",
					tooltip: "Copy the selected mass (weight) to other vehicles."
				}),
				checkbox({
					text: "Acceleration",
					tooltip: "Copy the selected powered acceleration to other vehicles."
				}),
				checkbox({
					text: "Max. speed",
					tooltip: "Copy the selected maximum powered speed to other vehicles."
				}),
			]
		}),
		button({
			text: "Apply settings",
			tooltip: "This copies the selected settings to the set of vehicles of your choice.",
			height: 28
		})
	]
});