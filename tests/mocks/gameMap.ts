import mock_Entity from "./entity";
import mock_Ride from "./ride";
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
				return mock_Ride(<Ride>{ name: "not-found" });

			return result;
		},
		getEntity(id: number): Entity
		{
			const result = this.entities?.find(r => r.id === id);
			if (!result)
				return mock_Entity(<Entity>(<unknown>{ name: "not-found" }));

			return result;
		},

		...template,
	});
}