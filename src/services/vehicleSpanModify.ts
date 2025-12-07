import { CopyFilter } from "./vehicleCopier";
import { VehicleSpan } from "./vehicleSpan";

export type ModifyVehicleSpan = <T>(action: (vehicles: VehicleSpan[], value: T) => void, value: T, filter: CopyFilter) => void
