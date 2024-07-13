import { register } from "./actions";
import { getDistanceFromProgress } from "./spacingEditor";
import { forEachVehicle, VehicleSpan } from "./vehicleSpan";

const execute = register<LoadVehicleArgs>("rve-load-car", loadVehicleSettings);

export interface VehicleLoadSettings {
    trackLocation:        CarTrackLocation;
	trackProgress:        number;
}

interface LoadVehicleArgs
{
    targets:  VehicleSpan[];
    settings: VehicleLoadSettings[];
}

export function loadVehicle(targets: VehicleSpan[], settings: VehicleLoadSettings[]): void
{
    execute({targets, settings});
}

function loadVehicleSettings(args: LoadVehicleArgs): void
{
    forEachVehicle(args.targets, (car, i) => args.settings[i] && applyVehicleLoadSettings(car, args.settings[i]));
}

function applyVehicleLoadSettings(car: Car, settings: VehicleLoadSettings): void
{
    car.travelBy(getDistanceFromProgress(car, -car.trackProgress));
    car.trackLocation = settings.trackLocation;
    car.travelBy(getDistanceFromProgress(car, settings.trackProgress));
}
