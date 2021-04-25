import mock from "./core/mock";


/**
 * A mock of the ui viewport.
 */
export default function mock_Viewport(template?: Partial<Viewport>): Viewport
{
	return mock<Viewport>({
		bottom: 10,
		top: 20,
		left: 30,
		right: 40,
		zoom: 0,
		rotation: 0,
		visibilityFlags: 0,
		getCentrePosition()
		{
			const vw = this as Viewport;
			return {
				x: (vw.left + vw.right) / 2,
				y: (vw.top + vw.bottom) / 2
			};
		},
		moveTo(position: CoordsXY | CoordsXYZ): void
		{
			this.left = (position.x - 5);
			this.right = (position.x + 5);
			this.bottom = (position.y - 5);
			this.top = (position.y + 5);
		},
		scrollTo(position: CoordsXY | CoordsXYZ): void
		{
			this.moveTo?.(position);
		},

		...template,
	});
}