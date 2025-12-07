import { Colour } from "openrct2-flexui";
import * as Log from "../utilities/logger";


const colourPatches = <Record<Colour, number | undefined>>{};


export function getColorIcon(colour: Colour)
{
	const existing = colourPatches[colour];
	if (existing)
	{
		return existing;
	}

	return colourPatches[colour] = create({ width: 12, height: 12 }, ctx =>
	{
		ctx.colour = colour;
		ctx.image(5059, 0, 0);
	});
}


function create(size: ScreenSize, draw: (ctx: GraphicsContext) => void)
{
	const manager = ui.imageManager;
	const image = manager.allocate(1);

	Log.debug("Create image:", image);

	if (image)
	{
		const index = image.start;
		console.log("TESEESST", index);
		manager.draw(index, size, draw);
		return index;
	}

	return -1;
}
