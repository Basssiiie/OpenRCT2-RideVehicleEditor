import { register } from "./actions";
import { getDistanceFromProgress } from "./spacingEditor";
import { forEachVehicle, VehicleSpan } from "./vehicleSpan";

const execute = register<LoadVehicleArgs>("rve-load-car", loadVehicleSettings);

export interface VehicleLoadSettings
{
    trackLocation: CarTrackLocation;
    trackProgress: number;
    rideObject: number;
    vehicleObject: number;
    spriteType: number;
    numSeats: number;
    currentStation: number;
    mass: number;
    acceleration: number;
    velocity: number;
    bankRotation: number;
    isReversed: boolean;
    colours: VehicleColour;
    poweredAcceleration: number;
    poweredMaxSpeed: number;
    status: VehicleStatus;
}

interface LoadVehicleArgs
{
    targets: VehicleSpan[];
    settings: VehicleLoadSettings[];
}

export function loadVehicle(targets: VehicleSpan[], settings: VehicleLoadSettings[]): void
{
    execute({ targets, settings });
}

function loadVehicleSettings(args: LoadVehicleArgs): void
{
    let c = 0;
    forEachVehicle(args.targets, (car) =>
    {
        // forEachVehicle callback i resets every train. need a global one here
        args.settings[c] && applyVehicleLoadSettings(car, args.settings[c]);
        c++;
    });
}

function applyVehicleLoadSettings(car: Car, settings: VehicleLoadSettings): void
{
    const currentProgress = car.trackProgress;
    const targetProgress = settings.trackProgress;

    if (currentProgress > targetProgress)
    {
        car.travelBy(getDistanceFromProgress(car, targetProgress - currentProgress));
    }
    // oh gee what a mess
    car.trackLocation = settings.trackLocation;
    car.rideObject = settings.rideObject;
    car.vehicleObject = settings.vehicleObject;
    car.spriteType = settings.spriteType;
    car.numSeats = settings.numSeats;
    car.currentStation = settings.currentStation;
    car.mass = settings.mass;
    car.acceleration = settings.acceleration;
    car.velocity = settings.velocity;
    car.bankRotation = settings.bankRotation;
    car.isReversed = settings.isReversed;
    car.colours = settings.colours;
    car.poweredAcceleration = settings.poweredAcceleration;
    car.poweredMaxSpeed = settings.poweredMaxSpeed;
    car.status = settings.status;
    if (currentProgress < targetProgress)
    {
        car.travelBy(getDistanceFromProgress(car, targetProgress - currentProgress));
    }
}
