/// <reference path="../../lib/openrct2.d.ts" />
import { window, listview, button, horizontal } from "openrct2-flexui";
import { VehicleViewModel } from "../viewmodels/vehicleViewModel";

export const model = new VehicleViewModel();

export const savePresetWindow = window({
	title: "Save Vehicle Values",
	position: "center",
	width: { value: 233, min: 185, max: 250 },
	height: 252,
	colours: [ 24, 24 ],
	onOpen: () => model._open(),
	onClose: () => model._close(),
	content: [
        listview({
			items: getPresets(),
			onHighlight: (item: number, column: number) => console.log(`Highlighted item ${item} in column ${column} in listview`),
			onClick: (item: number, column: number) => console.log(`Clicked item ${item} in column ${column} in listview`),
		}),
        horizontal([
            button({
                text: "New file",
                height: 14,
                onClick: () =>
                {
                    console.log("save new file");
                    // const vehicleValues = model._trains.get().map(t => t._vehicles().map(v => {
                    //     const car = v._car();
                    //     return {
                    //         // car.numSeats,
                    //     }
                    // }));
                }
            }),
            button({
                text: "Rename",
                height: 14,
                onClick: () =>
                {
                    console.log("save rename");
                }
            }),
            button({
                text: "Delete",
                height: 14,
                onClick: () =>
                {
                    console.log("save delete");
                }
            }),
        ]),
    ]
});

export const loadPresetWindow = window({
	title: "Load Vehicle Values",
	position: "center",
	width: { value: 233, min: 185, max: 250 },
	height: 252,
	colours: [ 24, 24 ],
	onOpen: () => model._open(),
	onClose: () => model._close(),
	content: [
        listview({
			items: getPresets(),
			onHighlight: (item: number, column: number) => console.log(`Highlighted item ${item} in column ${column} in listview`),
			onClick: (item: number, column: number) => console.log(`Clicked item ${item} in column ${column} in listview`),
		}),
        horizontal([
            button({
                text: "Rename",
                height: 14,
                onClick: () =>
                {
                    console.log("load rename");
                }
            }),
            button({
                text: "Delete",
                height: 14,
                onClick: () =>
                {
                    console.log("load delete");
                }
            }),
        ]),
    ]
});

function getPresets(): string[] {
    const storage = context.getParkStorage("OpenRCT2-RideVehicleEditor");
    const presets = storage.getAll("vehiclePresets");

    return Object.keys(presets).map(key => JSON.stringify(presets[key]));
}

