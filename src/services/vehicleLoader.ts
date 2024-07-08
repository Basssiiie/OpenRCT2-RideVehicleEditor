import { register } from "./actions";
import { forEachVehicle, VehicleSpan } from "./vehicleSpan";

const execute = register<LoadVehicleArgs>("rve-load-car", loadVehicleSettings);

export interface VehicleLoadSettings {
    trackLocation: CoordsXYZD;
	trackProgress: number;
    trackType: number;
    trackDirection: Direction;
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
    car.trackLocation = settings.trackLocation;
    car.trackType = settings.trackType;
    car.trackDirection = settings.trackDirection;
    car.travelBy(settings.trackProgress);
    console.log("CATCHME 01", settings);
}
