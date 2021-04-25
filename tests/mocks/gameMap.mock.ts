import mock from "./core/mock";


/**
 * Mock that adds additional configurations to the game map.
 */
export interface GameMapMock extends GameMap
{
	entities: Entity[];
	rides: Ride[];
}


/**
 * A mock of a game map.
 */
export default function mock_GameMap(template?: Partial<GameMapMock>): GameMapMock
{
	return mock<GameMapMock>({
		getRide(id: number): Ride
		{
			const result = this.rides?.find(r => r.id === id);
			if (!result)
				return <Ride><unknown>null;

			return result;
		},
		getEntity(id: number): Entity
		{
			const result = this.entities?.find(r => r.id === id);
			if (!result)
				return <Entity><unknown>null;

			return result;
		},

		...template,
	});
}