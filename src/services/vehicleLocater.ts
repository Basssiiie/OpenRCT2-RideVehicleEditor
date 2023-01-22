import { RideVehicle } from "../objects/rideVehicle";


/**
 * Scroll the main viewport to the currently selected vehicle.
 */
export function locate(vehicle: RideVehicle): void
{
	const car = vehicle._car();
	ui.mainViewport.scrollTo({ x: car.x, y: car.y, z: car.z });
}