import mock_Entity from "./entity";
import mock_Ride from "./ride";
import mock from "./_mock";


/**
 * Mock that adds additional configurations to the game map.
 */
type GameMapMock = GameMap & {
	entities?: Entity[]
};


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
				return mock_Entity(<Entity>{ name: "not-found" });

			return result;
		},

		...template,
	});
}