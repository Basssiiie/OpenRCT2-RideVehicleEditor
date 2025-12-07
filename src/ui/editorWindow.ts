/* eslint-disable @stylistic/multiline-comment-style */
/* eslint-disable @stylistic/spaced-comment */
import { tabwindow } from "openrct2-flexui";
import { invoke, refreshRide } from "../services/events";
import { VehicleViewModel } from "../viewmodels/vehicleViewModel";
import { createNamingTab } from "./tabs/namingTab";
import { createPositionalTab } from "./tabs/positionalTab";
import { createPropertiesTab } from "./tabs/propertiesTab";
import { createRideTab } from "./tabs/rideTab";
import { createStylingTab } from "./tabs/stylingTab";
import { multiplier } from "./utilityControls";
import { getWindowColours } from "./widgets/constants";


export const editorWindow = tabwindow<VehicleViewModel>(model =>
({
	title: model._title,
	colours: getWindowColours(true),
	width: { value: 300, min: 250, max: 400 },
	height: "auto",
	onOpen: () =>
	{
		model._open();
		model._ride._open();

		const ride = model._selectedRide.get();
		if (ride)
		{
			invoke(refreshRide, ride[0]._id);
		}
	},
	onClose: () =>
	{
		model._close();
		model._ride._close();
	},
	static: [
		multiplier(model._multiplierIndex)
	],
	tabs: [
		createStylingTab(model),
		createPositionalTab(model),
		createPropertiesTab(model),
		createRideTab(model._ride),
		createNamingTab(model._ride)
	]
}));
