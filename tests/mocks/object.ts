import mock from "./_mock";


let objectIndex = 0;


/**
 * Defines an object for the OpenRCT2 API.
 */
export type RCTObject = globalThis.Object;


/**
 * A mock of an OpenRCT2 object.
 */
export default function mock_Object(template?: Partial<RCTObject>): RCTObject
{
	return mock({
		index: (++objectIndex),

		...template,
	});
}