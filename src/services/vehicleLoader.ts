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
    forEachVehicle(args.targets, (car) => {
        // forEachVehicle callback i resets every train. need a global one here
        args.settings[c] && applyVehicleLoadSettings(car, args.settings[c]);
        c++;
    });
}

function applyVehicleLoadSettings(car: Car, settings: VehicleLoadSettings): void
{
    car.travelBy(getDistanceFromProgress(car, -car.trackProgress));
    console.log("WTF 1");
    car.trackLocation = settings.trackLocation;
    console.log("WTF 2");
    car.rideObject = settings.rideObject;
    console.log("WTF 3");
    car.vehicleObject = settings.vehicleObject;
    console.log("WTF 4");
    car.spriteType = settings.spriteType;
    console.log("WTF 5");
    car.numSeats = settings.numSeats;
    console.log("WTF 6");
    car.currentStation = settings.currentStation;
    console.log("WTF 7");
    car.mass = settings.mass;
    console.log("WTF 8");
    car.acceleration = settings.acceleration;
    console.log("WTF 9");
    car.velocity = settings.velocity;
    console.log("WTF 10");
    car.bankRotation = settings.bankRotation;
    console.log("WTF 11");
    car.isReversed = settings.isReversed;
    console.log("WTF 12");
    car.colours = settings.colours;
    console.log("WTF 13");
    car.poweredAcceleration = settings.poweredAcceleration;
    console.log("WTF 14");
    car.poweredMaxSpeed = settings.poweredMaxSpeed;
    console.log("WTF 15");
    car.status = settings.status;
    console.log("WTF 16");
    car.travelBy(getDistanceFromProgress(car, settings.trackProgress));
}
