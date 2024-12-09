import { isNull } from "./type";

export function equalCoordsXYZ(a: CoordsXYZ, b: CoordsXYZ | null): boolean
{
    if (isNull(b)) {
        return false;
    }

    return a.x === b.x
    && a.y === b.y
    && a.z === b.z;
}
