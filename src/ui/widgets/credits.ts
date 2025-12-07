import { label } from "openrct2-flexui";
import { pluginVersion } from "../../environment";

export function credits(text?: string, tooltip?: string)
{
	return label({
		height: 11,
		padding: [-4, 16, 0, 16],
		text: text || `Ride vehicle editor v${pluginVersion}`,
		tooltip: tooltip || "When did you last check for updates? ;)",
		alignment: "centred",
		disabled: true
	});
}
