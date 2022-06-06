import { button, checkbox, compute, dropdown, groupbox, label, window } from "openrct2-flexui";
import { CopyFilter } from "../services/vehicleCopier";
import { ApplyViewModel } from "../viewmodels/applyViewModel";


export const model = new ApplyViewModel();


export const applyWindow = window({
	title: "Apply to other vehicles",
	position: "center",
	width: 200,
	height: 226,
	colours: [ 12, 12 ],
	onClose: () =>
	{
		model.source = null;
	},
	content: [
		label({
			text: "Apply to:",
			tooltip: "Apply the selected vehicle settings to a specific set of other vehicles on this ride.",
			height: 11
		}),
		dropdown({
			items: model.options,
			tooltip: "Apply the selected vehicle settings to a specific set of other vehicles on this ride.",
			padding: [0, 1],
			onChange: idx => model.target.set(idx)
		}),
		groupbox({
			text: "Only",
			tooltip: "Select which of these settings should be applied.",
			padding: { top: 8 },
			gap: [14, 10, 10, 10],
			content: [
				checkbox({
					text: "Type & variant",
					tooltip: "Copy the selected ride type and variant to other vehicles.",
					isChecked: compute(model.filters, f => !!(f & CopyFilter.TypeAndVariant)),
					onChange: c => model.setFilter(CopyFilter.TypeAndVariant, c)
				}),
				checkbox({
					text: "Seats",
					tooltip: "Copy the selected seat count to other vehicles.",
					isChecked: compute(model.filters, f => !!(f & CopyFilter.Seats)),
					onChange: c => model.setFilter(CopyFilter.Seats, c)
				}),
				checkbox({
					text: "Mass",
					tooltip: "Copy the selected mass (weight) to other vehicles.",
					isChecked: compute(model.filters, f => !!(f & CopyFilter.Mass)),
					onChange: c => model.setFilter(CopyFilter.Mass, c)
				}),
				checkbox({
					text: "Acceleration",
					tooltip: "Copy the selected powered acceleration to other vehicles.",
					isChecked: compute(model.filters, f => !!(f & CopyFilter.PoweredAcceleration)),
					onChange: c => model.setFilter(CopyFilter.PoweredAcceleration, c)
				}),
				checkbox({
					text: "Max. speed",
					tooltip: "Copy the selected maximum powered speed to other vehicles.",
					isChecked: compute(model.filters, f => !!(f & CopyFilter.PoweredMaxSpeed)),
					onChange: c => model.setFilter(CopyFilter.PoweredMaxSpeed, c)
				}),
				checkbox({
					text: "Colours",
					tooltip: "Copy the selected vehicle colours to other vehicles.",
					isChecked: compute(model.filters, f => !!(f & CopyFilter.Colours)),
					onChange: c => model.setFilter(CopyFilter.Colours, c)
				}),
			]
		}),
		button({
			text: "Apply settings",
			tooltip: "This copies the selected settings to the set of vehicles of your choice.",
			height: 28,
			onClick: () => model.applyToTarget()
		})
	]
});
