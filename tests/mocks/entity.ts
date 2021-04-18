import mock from "./core/mock";


let entityId = 0;


/**
 * A mock of an entity.
 */
export default function mock_Entity(template?: Partial<Entity>): Entity
{
	return mock({
		id: (++entityId),

		...template,
	});
}