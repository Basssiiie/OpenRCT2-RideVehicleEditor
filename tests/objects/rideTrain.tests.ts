/// <reference path="../../lib/openrct2.d.ts" />

import test from "ava";
import Mock from "openrct2-mocks";
import { createTrainFromAnyCar, RideTrain } from "../../src/objects/rideTrain";


test("Ride train gets created from single car id", t =>
{
	globalThis.map = Mock.map({ entities: [
		Mock.car({ id: 78 })
	]});

	const rideTrain = new RideTrain(78);

	t.is(rideTrain._carId, 78);
	t.is(rideTrain._vehicles().length, 1);
	t.is(rideTrain._vehicles()[0]._id, 78);
});


test("Ride train gets created from multiple car ids", t =>
{
	globalThis.map = Mock.map({ entities: [
		Mock.car({ id: 12 }),
		Mock.car({ id: 15, nextCarOnTrain: 66 }),
		Mock.car({ id: 7, nextCarOnTrain: 12 }),
		Mock.car({ id: 66, nextCarOnTrain: 7 }),
	]});

	const rideTrain = new RideTrain(15);

	t.is(rideTrain._carId, 15);
	t.is(rideTrain._vehicles().length, 4);
	t.is(rideTrain._vehicles()[0]._id, 15);
	t.is(rideTrain._vehicles()[1]._id, 66);
	t.is(rideTrain._vehicles()[2]._id, 7);
	t.is(rideTrain._vehicles()[3]._id, 12);
});


const invalidId = 0xFFFF;

test("Ride train with invalid head car id fails", t =>
{
	const rideTrain = new RideTrain(invalidId);

	t.is(rideTrain._carId, invalidId);

	const result = rideTrain._refresh();
	t.false(result);
});


test("Ride train with invalid car id in train ends train", t =>
{
	globalThis.map = Mock.map({ entities: [
		Mock.car({ id: 6, nextCarOnTrain: invalidId }),
	]});

	const rideTrain = new RideTrain(6);

	t.is(rideTrain._carId, 6);
	t.is(rideTrain._vehicles().length, 1);
	t.is(rideTrain._vehicles()[0]._id, 6);
});


const atIndexTest = test.macro({
	title(_, index: number)
	{
		return `Ride train get vehicle at index ${index}`;
	},
	exec(t, index: number, expectedId: number)
	{
		globalThis.map = Mock.map({ entities: [
			Mock.car({ id: 5, nextCarOnTrain: 7 }),
			Mock.car({ id: 6 }),
			Mock.car({ id: 8, nextCarOnTrain: 5 }),
			Mock.car({ id: 7, nextCarOnTrain: 6 }),
		]});

		const rideTrain = new RideTrain(8);

		t.is(rideTrain._at(index)._id, expectedId);
	}
});

test(atIndexTest, 0, 8);
test(atIndexTest, 1, 5);
test(atIndexTest, 2, 7);
test(atIndexTest, 3, 6);


const fromyAnyCarTest = test.macro({
	title(_, id: number)
	{
		return `Ride train create from any car, id ${id}`;
	},
	exec(t, id: number, expectedIndex: number)
	{
		globalThis.map = Mock.map({ entities: [
			// 8 -> 5 -> 7 -> 6
			Mock.car({ id: 5, nextCarOnTrain: 7, previousCarOnRide: 8 }),
			Mock.car({ id: 6, previousCarOnRide: 7 }),
			Mock.car({ id: 8, nextCarOnTrain: 5, previousCarOnRide: 6 }),
			Mock.car({ id: 7, nextCarOnTrain: 6, previousCarOnRide: 5 }),
		]});

		const car = map.getEntity(id);
		const [rideTrain, carIdx] = createTrainFromAnyCar(<Car>car);

		t.is(rideTrain._carId, 8);
		t.is(rideTrain._vehicles().length, 4);
		t.is(rideTrain._vehicles()[0]._id, 8);
		t.is(rideTrain._vehicles()[1]._id, 5);
		t.is(rideTrain._vehicles()[2]._id, 7);
		t.is(rideTrain._vehicles()[3]._id, 6);
		t.is(carIdx, expectedIndex);
	}
});

test(fromyAnyCarTest, 5, 1);
test(fromyAnyCarTest, 6, 3);
test(fromyAnyCarTest, 7, 2);
test(fromyAnyCarTest, 8, 0);