/// <reference path="../../lib/openrct2.d.ts" />

import test from "ava";
import Mock from "openrct2-mocks";
import { RideTrain } from "../../src/objects/rideTrain";


test("Ride train gets created from single car id", t =>
{
	global.map = Mock.map({ entities: [
		Mock.car({ id: 78 })
	]});

	const rideTrain = new RideTrain(78);

	t.is(rideTrain.carId, 78);
	t.is(rideTrain.vehicles().length, 1);
	t.is(rideTrain.vehicles()[0].id, 78);
});


test("Ride train gets created from multiple car ids", t =>
{
	global.map = Mock.map({ entities: [
		Mock.car({ id: 12 }),
		Mock.car({ id: 15, nextCarOnTrain: 66 }),
		Mock.car({ id: 7, nextCarOnTrain: 12 }),
		Mock.car({ id: 66, nextCarOnTrain: 7 }),
	]});

	const rideTrain = new RideTrain(15);

	t.is(rideTrain.carId, 15);
	t.is(rideTrain.vehicles().length, 4);
	t.is(rideTrain.vehicles()[0].id, 15);
	t.is(rideTrain.vehicles()[1].id, 66);
	t.is(rideTrain.vehicles()[2].id, 7);
	t.is(rideTrain.vehicles()[3].id, 12);
});


const invalidId = 0xFFFF;

test("Ride train with invalid head car id fails", t =>
{
	const rideTrain = new RideTrain(invalidId);

	t.is(rideTrain.carId, invalidId);

	const result = rideTrain.refresh();
	t.false(result);
});


test("Ride train with invalid car id in train ends train", t =>
{
	global.map = Mock.map({ entities: [
		Mock.car({ id: 6, nextCarOnTrain: invalidId }),
	]});

	const rideTrain = new RideTrain(6);

	t.is(rideTrain.carId, 6);
	t.is(rideTrain.vehicles().length, 1);
	t.is(rideTrain.vehicles()[0].id, 6);
});


const atIndexTest = test.macro({
	title(_, index: number)
	{
		return `Ride train get vehicle at index ${index}`;
	},
	exec(t, index: number, expectedId: number)
	{
		global.map = Mock.map({ entities: [
			Mock.car({ id: 5, nextCarOnTrain: 7 }),
			Mock.car({ id: 6 }),
			Mock.car({ id: 8, nextCarOnTrain: 5 }),
			Mock.car({ id: 7, nextCarOnTrain: 6 }),
		]});

		const rideTrain = new RideTrain(8);

		t.is(rideTrain.at(index).id, expectedId);
	}
});

test(atIndexTest, 0, 8);
test(atIndexTest, 1, 5);
test(atIndexTest, 2, 7);
test(atIndexTest, 3, 6);