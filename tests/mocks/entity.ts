import mock from "./_mock";


let entityId = 0;


/**
 * A mock of a ride.
 */
export default function mock_Entity(template?: Partial<Entity>): Entity
{
	return mock<Entity>({
		id: (++entityId),

		...template,
	});
}