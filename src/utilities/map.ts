import { floor } from "./math";

const UnitsPerTile = 32;

/**
 * Converts a entity coordinate unit to a tile coordinate unit.
 */
export function toTileUnit(coordinate: number): number
{
	return floor(coordinate / UnitsPerTile);
}

/**
 * Align the coordinate with the edge of a map tile.
 */
export function alignWithMap(coordinate: number): number
{
	return toTileUnit(coordinate) * UnitsPerTile;
}

/**
 * Get a tile from non-tile coordinates (like entity coordinates).
 */
export function getTileByCoords(x: number, y: number): Tile
{
	return map.getTile(toTileUnit(x), toTileUnit(y));
}

/**
 * Gets a tile element on the map at the specified position and index.
 */
export function getTileElement(x: number, y: number, elementIdx: number): TileElement
{
	const tile = getTileByCoords(x, y);
	return tile.getElement(elementIdx);
}

/**
 * Finds the index of a matching track element on the specified tile.
 * If available, the track piece type can be specified to narrow down the search.
 */
export function getIndexForTrackElementAt(coords: CoordsXYZD, trackType: number | null = null): number | null
{
	const tile = getTileByCoords(coords.x, coords.y);
	const allElements = tile.elements, len = allElements.length;

	for (let i = 0; i < len; i++)
	{
		const element = tile.elements[i];
		if (element.type === "track"
			&& (trackType === null || element.trackType === trackType)
			&& element.baseZ === coords.z
			&& element.direction === coords.direction)
		{
			return i;
		}
	}
	return null;
}
