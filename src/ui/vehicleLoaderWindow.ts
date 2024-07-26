/// <reference path="../../lib/openrct2.d.ts" />
import { window, button, listview, horizontal, compute, twoway } from "openrct2-flexui";
import { VehicleLoaderModel } from "../viewmodels/vehicleLoaderModel";
import { loadVehicle } from "../services/vehicleLoader";

const NewFileDesc = {
    title: "New file",
    description: "Enter a name for the new file:",
    callback: (value: string): void =>
    {
        model._createSave(value);
        saveVehiclesWindow.close();
    }
};

const RenameDesc = {
    title: "Rename",
    description: "Enter a new name for the file:",
    callback: (value: string): void =>
    {
        model._renameSelected(value);
    }
};

export const model = new VehicleLoaderModel();

export const saveVehiclesWindow = window({
	title: "Save Vehicles",
	position: "center",
	width: { value: 233, min: 185, max: 250 },
	height: 252,
	colours: [ 24, 24 ],
	onOpen: () => model._open(),
	onClose: () => model._close(),
	content: [
        listview({
            canSelect: true,
			items: compute(model._saves, saves => saves.map(s => s[0])),
			onHighlight: (item: number, column: number) => console.log(`Highlighted item ${item} in column ${column} in listview`),
			onClick: (item: number, column: number) =>
            {
                console.log(`Clicked item ${item} in column ${column} in listview`);
                model._select(item);
            },
		}),
        horizontal([
            button({
                text: "New file",
                height: 14,
                onClick: () =>
                {
                    console.log("save new file");
                    ui.showTextInput(NewFileDesc);
                }
            }),
            button({
                text: "Rename",
                height: 14,
                onClick: () =>
                {
                    console.log("save rename");
                    ui.showTextInput(RenameDesc);
                }
            }),
            button({
                text: "Delete",
                height: 14,
                onClick: () =>
                {
                    console.log("save delete");
                    model._deleteSelected();
                }
            }),
        ]),
    ]
});

export const loadVehiclesWindow = window({
	title: "Load Vehicles",
	position: "center",
	width: { value: 233, min: 185, max: 250 },
	height: 252,
	colours: [ 24, 24 ],
	onOpen: () => model._open(),
	onClose: () => model._close(),
	content: [
        listview({
            canSelect: true,
			items: compute(model._saves, saves => saves.map(s => s[0])),
            selectedCell: twoway(compute(model._selectedSave, selected =>
            {
                selected && console.log("wtf", selected[1]);
                return selected ? {row: selected[1], column: 0} : null;
            })),
			onHighlight: (item: number, column: number) => console.log(`Highlighted item ${item} in column ${column} in listview`),
			onClick: item =>
            {
                const selected = model._selectedSave.get();
                if (selected === undefined || selected[1] !== item) {
                    model._select(item);
                    return;
                }

                console.log("loading", selected[0]);
                loadVehicle(model._rideVehicles.get(), selected[0]);
                loadVehiclesWindow.close();
            },
		}),
        horizontal([
            button({
                text: "Rename",
                height: 14,
                onClick: () =>
                {
                    console.log("load rename");
                    ui.showTextInput(RenameDesc);
                }
            }),
            button({
                text: "Delete",
                height: 14,
                onClick: () =>
                {
                    console.log("load delete");
                    model._deleteSelected();
                }
            }),
        ]),
    ]
});
