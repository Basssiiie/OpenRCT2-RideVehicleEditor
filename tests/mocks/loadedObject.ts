import mock from "./core/mock";


let objectIndex = 0;


/**
 * A mock of an OpenRCT2 object.
 */
export default function mock_LoadedObject(template?: Partial<LoadedObject>): LoadedObject
{
	return mock({
		index: (++objectIndex),

		...template,
	});
}