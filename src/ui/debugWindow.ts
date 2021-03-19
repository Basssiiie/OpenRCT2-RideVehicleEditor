import { log } from "../helpers/utility";


/**
 * Window for debugging various car and ride values.
 */
class DebugWindow
{
	static readonly identifier = "rve-debug-window";


	private _window: Window;


	constructor(private entityId: number)
	{
		this._window = ui.getWindow(DebugWindow.identifier);
		if (this._window)
		{
			this._window.close();
		}

		this._window = this.createWindow();
	}


	private createWindow()
	{
		return ui.openWindow({
			classification: DebugWindow.identifier,
			title: `debug info: entity ${this.entityId}`,
			width: 300,
			height: 500,
			minWidth: 300,
			minHeight: 300,
			maxWidth: 500,
			maxHeight: 1200,
			widgets: [
				<ListView>{
					name: "rve-debug-list",
					type: "listview",
					scrollbars: "both",
					columns: [
						<ListViewColumn>{
							header: "Property",
							width: 130
						},
						<ListViewColumn>{
							header: "Value(s)"				
						}
					],
					showColumnHeaders: true,
					isStriped: true,
					canSelect: true,
					x: 5,
					y: 20,
					width: 290,
					height: 575,
					onClick: (i, c) => log(`Clicked item ${i} in column ${c}`)
				}
			],
			onUpdate: () => this.updateInfo()
		});
	}


	private updateInfo()
	{
		const entity = map.getEntity(this.entityId);

		if (!entity)
		{
			this.set([["Entity does not exist anymore.", ""]]);
			return;
		}

		let data: ListViewItem[] = [
			["----Entity----", ""],
			["Id:", entity.id.toString()],
			["Type:", entity.type.toString()],
			["Position:", `${entity.x}, ${entity.y}, ${entity.z}`]
		];

		switch (entity.type)
		{
			case "car":
				const car = entity as Car;
				data = data.concat([
					["", ""],
					["----Car----", ""],
					["Ride id", car.ride.toString()],
					["Ride object id", car.rideObject.toString()],
					["Vehicle object id", car.vehicleObject.toString()],
					["Sprite type", car.spriteType.toString()],
					["Num. of seats", car.numSeats.toString()],
					["Next car on train", car.nextCarOnTrain?.toString() ?? "null"],
					["Next car on ride", car.nextCarOnRide.toString()],
					["Previous car on ride", car.previousCarOnRide.toString()],
					["Current station", car.currentStation.toString()],
					["", ""],
					["Mass:", car.mass.toString()],
					["Acceleration:", car.acceleration.toString()],
					["Banking rotation:", car.bankRotation.toString()],
					["Colours", `body: ${car.colours.body}, trim: ${car.colours.trim}, ternary: ${car.colours.ternary}`],
					["Powered acceleration:", car.poweredAcceleration.toString()],
					["Powered max. speed:", car.poweredMaxSpeed.toString()],
					["Status:", car.status.toString()],
					["Peeps:", car.peeps.map(p => (p == null) ? "null" : p.toString()).toString()],
					["", ""],
					// @ts-expect-error
					["Track location", `${car.trackLocation.x}, ${car.trackLocation.y}, ${car.trackLocation.z}, dir: ${car.trackLocation.direction}`],
					["Track progress", car.trackProgress.toString()],
					["Remaining distance", car.remainingDistance.toString()],
				]);


				const rideObject = context.getObject("ride", car.rideObject);
				const vehicleObject = rideObject.vehicles[car.vehicleObject];

				data = data.concat([
					["", ""],
					["----VehicleObject----", ""],
					["Rotation frame mask:", vehicleObject.rotationFrameMask.toString()],
					["Num. of vertical frames:", vehicleObject.numVerticalFrames.toString()],
					["Num. of horizontal frames:", vehicleObject.numHorizontalFrames.toString()],
					["Spacing:", vehicleObject.spacing.toString()],
					["Car mass:", vehicleObject.carMass.toString()],
					["Tab height:", vehicleObject.tabHeight.toString()],
					["Num. of seats:", vehicleObject.numSeats.toString()],
					["", ""],
					["Sprite flags:", vehicleObject.spriteFlags.toString()],
					["Sprite width:", vehicleObject.spriteWidth.toString()],
					["Sprite height:", vehicleObject.spriteHeightPositive.toString()],
					["Animation:", vehicleObject.animation.toString()],
					["Flags:", vehicleObject.flags.toString()],
					// Here are many image id properties not included.
					["", ""],
					["Num. of vehicle images:", vehicleObject.noVehicleImages.toString()],
					["Num. of seating rows:", vehicleObject.noSeatingRows.toString()],
					["Spinning inertia:", vehicleObject.spinningInertia.toString()],
					["Spinning friction:", vehicleObject.spinningFriction.toString()],
					["Friction sound id:", vehicleObject.frictionSoundId.toString()],
					["Logflume reverser vehicle:", vehicleObject.logFlumeReverserVehicleType.toString()],
					["Sound range:", vehicleObject.soundRange.toString()],
					["Double sound frequency:", vehicleObject.doubleSoundFrequency.toString()],
					["", ""],
					["Powered acceleration:", vehicleObject.poweredAcceleration.toString()],
					["Powered max speed:", vehicleObject.poweredMaxSpeed.toString()],
					["Car visual:", vehicleObject.carVisual.toString()],
					["Effect visual:", vehicleObject.effectVisual.toString()],
					["Draw order:", vehicleObject.drawOrder.toString()],
				]);

				data = data.concat([
					["", ""],
					["----RideObject----", ""],
					["Type:", rideObject.type.toString()],
					["Index:", rideObject.index.toString()],
					["Identifier:", rideObject.identifier.toString()],
					["Legacy id:", rideObject.legacyIdentifier.toString()],
					["Name:", rideObject.name.toString()],
					["", ""],
					["Capacity:", rideObject.capacity.toString()],
					["Flags:", rideObject.flags.toString()],
					["Ride type:", rideObject.rideType.map(r => (r == null) ? "null" : r.toString()).toString()],
					["", ""],
					["Min. cars in train:", rideObject.minCarsInTrain.toString()],
					["Max. cars in train:", rideObject.maxCarsInTrain.toString()],
					["Cars per flatride:", rideObject.carsPerFlatRide.toString()],
					["Seatless cars:", rideObject.zeroCars.toString()],
					["", ""],
					["Tab vehicle:", rideObject.tabVehicle.toString()],
					["Default vehicle:", rideObject.defaultVehicle.toString()],
					["Front vehicle:", rideObject.frontVehicle.toString()],
					["Second vehicle:", rideObject.secondVehicle.toString()],
					["Third vehicle:", rideObject.thirdVehicle.toString()],
					["Rear vehicle:", rideObject.rearVehicle.toString()],
					["", ""],
					["Excitement multiplier:", rideObject.excitementMultiplier.toString()],
					["Intensity multiplier:", rideObject.intensityMultiplier.toString()],
					["Nausea multiplier:", rideObject.nauseaMultiplier.toString()],
					["Max height:", rideObject.maxHeight.toString()],
					["Shop items:", `${rideObject.shopItem}, ${rideObject.shopItemSecondary}`],
				]);
		}

		this.set(data);
	}

	private set(items: ListViewItem[])
	{
		const list = this._window.findWidget<ListView>("rve-debug-list");
		list.width = (this._window.width - 10);
		list.height = (this._window.height - 25);
		list.items = items;
	}
}

export default DebugWindow;
