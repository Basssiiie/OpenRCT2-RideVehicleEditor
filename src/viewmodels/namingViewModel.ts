import { Colour, compute } from "openrct2-flexui";
import * as Log from "../utilities/logger";
import { TabViewModel } from "./tabViewModel";
import { SelectionViewModel } from "./selectionViewModel";
import { getColorIcon } from "../services/imageRepository";


let colourSets: string[] | undefined;
let fontSets: string[] | undefined;
let iconSets: [number, string, number?][] | undefined;


function getNamedIcon(name: IconName): number
{
	return context.getIcon(name);
}


export function sprite(id: number, colour?: Colour): string
{
	if (colour)
	{
		id |= (colour << 19) | (1 << 29);
	}

	return "{INLINE_SPRITE}{" + (id & 0xFF) + "}{" + ((id >> 8) & 0xFF) + "}{" + ((id >> 16) & 0xFF) + "}{" + ((id >> 24) & 0xFF) + "}";
}

const colours = <const>[
	["Default", "{WINDOW_COLOUR_3}"], // might be this one!
	["Black", "{BLACK}", Colour.Black],
	["Grey", "{GREY}", Colour.Grey],
	["White", "{WHITE}", Colour.White],
	["Red", "{RED}", Colour.BrightRed],
	["Orange", "{TOPAZ}", Colour.OrangeLight],
	["Yellow", "{YELLOW}", Colour.BrightYellow],
	["Green", "{GREEN}", Colour.SaturatedGreenLight],
	["Celadon", "{CELADON}", Colour.DullGreenLight],
	["Cyan", "{PEARLAQUA}", Colour.Aquamarine],
	["Blue", "{BABYBLUE}", Colour.IcyBlue],
	["Purple", "{PALELAVENDER}", Colour.SaturatedPurpleLight],
	["Pink", "{LIGHTPINK}", Colour.LightPink],
	["Brown", "{PALESILVER}", Colour.DullBrownLight],
	["Beige", "{PALEGOLD}", Colour.SaturatedBrownLight]
];

function createColourSets(): string[]
{
	return colours
		.map((element, idx) => (idx
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			? element[1] + sprite(getColorIcon(element[2]!))
			: sprite(getNamedIcon("palette_invisible_pressed")))
		+ "  {OUTLINE}" + element[0]);
}

const fonts = <const>[
	["Normal font", "{MEDIUMFONT}"],
	["Small font", "{SMALLFONT}"],
	["Tiny font", "{TINYFONT}"]
];

function createFontSets(): string[]
{
	return fonts.map(element => element[1] + element[0]);
}

function createIcons(): [number, string, number?][]
{
	return [
		[5492, "Very happy guest"],
		[5491, "Happy guest"],
		[5490, "Pleased guest"],
		[5489, "Neutral guest"],
		[5493, "Tired guest"],
		[5494, "Very tired guest"],
		[5495, "Sick guest"],
		[5496, "Nauseous guest"],
		[5497, "Very nauseous guest"],
		[5488, "Unhappy guest"],
		[5487, "Angry guest"],
		[5486, "Very angry guest"],
		[5498, "Enraged guest"],

		[23198, "Thumbs up", -3], // todo: check
		[23197, "Thumbs down", -5],
		[5166, "Audio focus"],

		[5118, "Panda"],
		[5119, "Tiger"],
		[5120, "Elephant"],
		[5121, "Roman soldier"],
		[5122, "Gorilla"],
		[5123, "Snowman"],
		[5124, "Knight"],
		[5125, "Astronaut"],
		[5126, "Bandit"],
		[5127, "Sheriff"],
		[5128, "Pirate"],

		[5111, "Broom"],
		[5112, "Watering can"],
		[5113, "Trash can"],
		[5114, "Lawn mower"],
		[5115, "Clipboard"],
		[5116, "Wrench"],
		[5117, "Footsteps"],
		[5129, "Information"],
		[5130, "Arrow up"],
		[5131, "Arrow down"],
		[23189, "Arrow left"],

		[5061, "Balloon", 1],
		[5065, "Umbrella", 1],
		[5079, "Hat", 1],
		[5081, "T-shirt", 1],
		[5096, "Sunglasses"],
		[5062, "Stuffed animal"],
		[5075, "Voucher"],
		[5067, "Burger box"],
		[5085, "Chicken box"],
		[5109, "Roasted sausage"],
		[5068, "Chips"],
		[5074, "Pizza slice"],
		[5104, "Sandwich"],
		[5077, "Hot dog"],
		[5078, "Tentacle"],
		[5076, "Popcorn box"],
		[5097, "Bowl of beef noodles"],
		[5098, "Bowl of fried rice noodles"],
		[5099, "Bowl of wonton soup"],
		[5100, "Bowl of meatball soup"],
		[5105, "Cookie"],
		[5082, "Donut"],
		[5092, "Pretzel"],
		[5095, "Funnel cake"],
		[5080, "Toffee apple"],
		[5070, "Cotton candy"],
		[5069, "Ice cream"],
		[5066, "Drink can"],
		[5086, "Lemonade bottle"],
		[5101, "Juice box"],
		[5102, "Soybean milk"],
		[5103, "Sujeonggwa box"],
		[5083, "Cup of coffee"],
		[5093, "Cup of hot chocolate"],
		[5094, "Cup of iced tea"],
		[5073, "Empty box"],
		[5087, "Empty box"],
		[5072, "Rubbish"],
		[5106, "Empty bowl"],
		[5110, "Empty bowl"],
		[5071, "Empty can"],
		[5088, "Empty bottle"],
		[5108, "Empty juice box"],
		[5107, "Empty drink box"],
		[5084, "Empty cup"],
		[5063, "Park map"],
		[5064, "Ride photo"], // todo: figure out ride type for tooltips
		[5089, "Ride photo 2"],
		[5090, "Ride photo 3"],
		[5091, "Ride photo 4"],

		[getNamedIcon("rct1_open_on"), "Ride open"],
		[getNamedIcon("rct1_test_on"), "Ride testing"],
		[getNamedIcon("rct1_close_on"), "Ride closed"],
		[getNamedIcon("rct1_simulate_on"), "Ride simulated"],
		[getNamedIcon("rct1_open_off"), "Ride not open"],
		[getNamedIcon("rct1_test_off"), "Ride not testing"],
		[getNamedIcon("rct1_close_off"), "Ride not closed"],
		[getNamedIcon("rct1_simulate_off"), "Ride not simulated"],

		[getNamedIcon("game_speed_indicator"), "Game speed indicator"],
		[getNamedIcon("game_speed_indicator_double"), "Fast forward indicator"],
		[getNamedIcon("link_chain"), "Link chain", -4],
		[getNamedIcon("server_password"), "Lock"],
		[getNamedIcon("hide_partial"), "Partially visible", -8],
		[getNamedIcon("hide_full"), "Fully invisible", -8],
		[getNamedIcon("palette_invisible"), "Invisible colour"],
		[getNamedIcon("palette_invisible_pressed"), "Invisible colour"]
	];
}


export class NamingViewModel implements TabViewModel
{
	readonly _colours = colourSets ||= createColourSets();
	readonly _fonts = fontSets ||= createFontSets();
	readonly _icons = iconSets ||= createIcons();

	readonly _name;
	readonly _ride;

	constructor(selection: SelectionViewModel)
	{
		this._name = compute(selection._ride, ride => (ride ? ride[0]._ride().name : "<unknown ride>"));
		this._name.subscribe(v => Log.debug("Update name store to: ", v));
		this._ride = selection._ride;
	}

	_updateRide(ride: Ride): void
	{
		this._name.set(ride.name);
	}

	_setRideName(name: string): void
	{
		const ride = this._ride.get();
		Log.debug("[Naming tab] TEST", ride);
		if (ride)
		{
			Log.debug("[Naming tab] Set ride name to:", name);
			context.executeAction("ridesetname",
			{
				ride: ride[0]._id,
				name
			});
		}
	}

	_setColour(index: number): void
	{
		this._setLastToken(colours[index][1]);
	}

	_setFont(index: number): void
	{
		this._setLastToken(fonts[index][1]);
	}

	_addIcon(index: number): void
	{
		const store = this._name;
		const name = store.get();
		const image = this._icons[index];
		const token = sprite(image[0]);

		store.set(name + token);
	}

	private _setLastToken(token: string): void
	{
		const store = this._name;
		let name = store.get();
		const length = name.length;

		if (length > 1 && name[length - 1] === "}")
		{
			const token = name[length - 2];
			const opening = name.lastIndexOf("{");
			if (opening >= 0 && !(token >= "0" && token <= "9"))
			{
				name = name.substring(0, opening);
			}
		}

		store.set(name + token);
	}
}
