import { FlexibleLayoutContainer, tab, TabCreator, TabParams } from "openrct2-flexui";

export interface TabViewModel
{
	_open?(): void;
	_updateVehicle?(car: Car, index: number, full?: boolean): void;
	_updateRide?(ride: Ride, full?: boolean): void;
	_close?(): void;
}

export function createTab(image: ImageAnimation, model: TabViewModel, content: FlexibleLayoutContainer): TabCreator
{
	const params: TabParams = {
		image,
		content
	};

	// eslint-disable-next-line @typescript-eslint/unbound-method
	const open = model._open;
	// eslint-disable-next-line @typescript-eslint/unbound-method
	const close = model._close;

	if (open)
	{
		params.onOpen = open.bind(model);
	}
	if (close)
	{
		params.onClose = close.bind(model);
	}

	return tab(params);
}
