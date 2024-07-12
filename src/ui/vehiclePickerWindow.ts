/// <reference path="../../lib/openrct2.d.ts" />
import { window, button, textbox, store, listview, horizontal, compute, twoway } from "openrct2-flexui";
import { VehiclePickerModel } from "../viewmodels/vehiclePickerModel";
import { loadVehicle } from "../services/vehicleLoader";

const newFileDialogInput = store<string>("");

const newFileDialog = window({
    title: "New file",
    position: "center",
    colours: [24, 24],
    width: 122,
    height: 62,
    content: [
        textbox({
            text: twoway(newFileDialogInput),
            maxLength: 22,
        }),
        button({
            text: "New file",
            height: 14,
            onClick: () => {
                model._createSave(newFileDialogInput.get());
                newFileDialog.close();
                saveVehiclesWindow.close();
            }
        }),
    ]
});

const renameDialogInput = store<string>("");

const renameDialog = window({
    title: "Rename",
    position: "center",
    colours: [24, 24],
    width: 122,
    height: 62,
    content: [
        textbox({
            text: twoway(renameDialogInput),
            maxLength: 22,
        }),
        button({
            text: "Rename",
            height: 14,
            onClick: () => {
                model._renameSelected(renameDialogInput.get());
                renameDialog.close();
            }
        }),
    ]
});

export const model = new VehiclePickerModel();

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
			onClick: (item: number, column: number) => {
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
                    newFileDialog.open();
                }
            }),
            button({
                text: "Rename",
                height: 14,
                onClick: () =>
                {
                    console.log("save rename");
                    renameDialog.open();
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
			onHighlight: (item: number, column: number) => console.log(`Highlighted item ${item} in column ${column} in listview`),
			onClick: item => {
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
                    renameDialog.open();
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
