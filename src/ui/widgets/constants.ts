import { Colour } from "openrct2-flexui";

export const buttonSize = 24;

export const int16max = 32_767;
export const int16min = -32_768;


// todo: move?
let waterObject: LoadedObject | undefined;

export function getWindowColours(tabs = false): [Colour, Colour]
{
	const colours = getColours();
	return tabs ? colours : [Colour.MossGreen, colours[1]];
}

function getColours(): [Colour, Colour]
{
	return [Colour.GrassGreenDark, Colour.OliveGreen];


	waterObject ||= objectManager.getAllObjects("water")[0];
	switch (waterObject.identifier)
	{
		case "rct2.water.wtrgreen": return [Colour.SaturatedGreen, Colour.BrightGreen];
		case "rct2.water.wtrorng": return [Colour.DarkOrange, Colour.LightOrange];
		case "rct2.water.wtrpink": return [Colour.DarkPink, Colour.BrightPink];
		default: return [Colour.AquaDark, Colour.Teal];
	}
}
