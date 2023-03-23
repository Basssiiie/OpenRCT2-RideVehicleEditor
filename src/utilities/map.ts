import { floor } from "./math";


const UnitsPerTile = 32;


/**
 * Get a tile from non-tile coordinates (like entity coordinates).
 */
export function getTileByCoords(x: number, y: number): Tile
{
	return map.getTile(floor(x / UnitsPerTile), floor(y / UnitsPerTile));
}

/**
 * Gets a tile element on the map at the specified position and index.
 */
export function getTileElement<T extends TileElement = TileElement>(x: number, y: number, elementIdx: number): T
{
	const tile = getTileByCoords(x, y);
	return tile.getElement<T>(elementIdx);
}