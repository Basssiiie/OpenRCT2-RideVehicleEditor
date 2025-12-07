import { absolute, button, dropdown, groupbox, horizontal, label, textbox, twoway } from "openrct2-flexui";
import { credits } from "../widgets/credits";
import { createAnimatedIcon } from "./icons";
import { NamingViewModel, sprite } from "../../viewmodels/namingViewModel";
import { createTab } from "../../viewmodels/tabViewModel";

export function createNamingTab(naming: NamingViewModel)
{
	return createTab(
		createAnimatedIcon(5277, 7, 4),
		naming,
		[
			groupbox({
				text: "Ride name",
				tooltip: "Edit the name of the ride",
				content: [
					textbox({
						text: twoway(naming._name),
						maxLength: 999, // todo: check default limit in orct2 and update flexui
						onChange: naming._setRideName.bind(naming)
					}),
					label({
						text: naming._name
					}),
					horizontal([
						dropdown({
							items: naming._colours,
							tooltip: "Pick a colour to create, for example, a rainbow name!",
							onChange: naming._setColour.bind(naming)
						}),
						dropdown({
							items: naming._fonts,
							tooltip: "New in! A font for ants!",
							onChange: naming._setFont.bind(naming)
						})
					]),
					absolute({ // todo: could be some automated flow layout
						height: 150,
						content: naming._icons.map((img, index) =>
						{
							const x = index % 12;
							const y = Math.floor(index / 12);
							const offset = img[2];
							const text = (offset && offset < 0 ? `{MOVE_X}{${offset}}` : "") + sprite(img[0]);
							console.log("ICON", text, x, y);
							return button({
								x: x * 24,
								y: y * 17,
								width: 22,
								height: 15,
								border: false,
								text: text,
								tooltip: img[1],
								onClick: () => naming._addIcon(index)

							});
						})
					})
				]
			}),
			credits()
		]
	);
}
