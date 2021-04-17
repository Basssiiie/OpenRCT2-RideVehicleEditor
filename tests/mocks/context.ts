import mock_Object, { RCTObject } from "./object";
import mock from "./_mock";


/**
 * Mock that adds additional configurations to the game map.
 */
interface ContextMock extends Context
{
	objects?: RCTObject[]
}


/**
 * A mock of a game map.
 */
export default function mock_Context(template?: Partial<ContextMock>): ContextMock
{
	return mock<ContextMock>({
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		getObject(type: ObjectType, index: number): any
		{
			const result = this.objects?.find(o => o.index === index && o.type === type);
			if (!result)
				return mock_Object(<RCTObject>{ name: "not-found" });

			return result;
		},
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		getAllObjects(type: ObjectType): any[]
		{
			return this.objects?.filter(o => o.type === type) ?? [];
		},

		...template,
	});
}