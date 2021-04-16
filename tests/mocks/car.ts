import mock_Entity from "./entity";
import mock from "./_mock";


/**
 * A mock of a car entity.
 */
export default function mock_Car(template?: Partial<Car>): Car
{
	return mock<Car>({
		type: "car",

		...(mock_Entity(template) as Partial<Entity>),
	});
}