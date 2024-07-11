import { register } from "./actions";
import { getDistanceFromProgress } from "./spacingEditor";
import { forEachVehicle, VehicleSpan } from "./vehicleSpan";

const execute = register<LoadVehicleArgs>("rve-load-car", loadVehicleSettings);

export interface VehicleLoadSettings {
    x: number,
    y: number,
    z: number,
    trackLocation: CoordsXYZD;
	trackProgress: number;
	currentTrackProgress: number | null;
    trackType: number;
}

export interface LoadVehicleArgs
{
    targets:  VehicleSpan[];
    settings: VehicleLoadSettings;
}

export function loadVehicle(targets: VehicleSpan[], settings: VehicleLoadSettings): void
{
    execute({targets, settings});
}

function loadVehicleSettings(args: LoadVehicleArgs): void
{
    forEachVehicle(args.targets, car => applyVehicleLoadSettings(car, args.settings));
}

function applyVehicleLoadSettings(car: Car, settings: VehicleLoadSettings): void
{
    car.travelBy(getDistanceFromProgress(car, -settings.currentTrackProgress!));
    car.trackLocation = settings.trackLocation;
    car.trackType = settings.trackType;
    car.travelBy(getDistanceFromProgress(car, settings.trackProgress));
}
