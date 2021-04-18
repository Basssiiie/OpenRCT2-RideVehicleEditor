import mock_Object, { RCTObject } from "./object";
import mock from "./core/mock";


/**
 * Mock that adds additional configurations to the game map.
 */
interface Subscription
{
	hook: string;
	callback: (e: unknown) => void;
	disposable: IDisposable;
	isDisposed: boolean;
}


/**
 * Mock that adds additional configurations to the game map.
 */
interface ContextMock extends Context
{
	objects?: RCTObject[];
	subscriptions?: Subscription[];
}


/**
 * A mock of a game map.
 */
export default function mock_Context(template?: Partial<ContextMock>): ContextMock
{
	return mock<ContextMock>({
		subscriptions: [],
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
		// eslint-disable-next-line @typescript-eslint/ban-types
		subscribe(hook: string, callback: Function): IDisposable
		{
			const subscription: Subscription =
			{
				hook: hook,
				callback: callback as (e: unknown) => void,
				isDisposed: false,
				disposable:
				{
					dispose(): void	{ subscription.isDisposed = true; }
				}
			};
			this.subscriptions?.push(subscription);
			return subscription.disposable;
		},

		...template,
	});
}