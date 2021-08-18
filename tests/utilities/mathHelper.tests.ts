import test from "ava";
import * as MathHelper from "../../src/utilities/mathHelper";


test("clamp(): only max", t =>
{
	t.is(MathHelper.clamp(-3, 0, 5), 0);
	t.is(MathHelper.clamp(-1, 0, 5), 0);
	t.is(MathHelper.clamp(0, 0, 5), 0);
	t.is(MathHelper.clamp(1, 0, 5), 1);
	t.is(MathHelper.clamp(3, 0, 5), 3);
	t.is(MathHelper.clamp(4, 0, 5), 4);
	t.is(MathHelper.clamp(5, 0, 5), 4);
	t.is(MathHelper.clamp(6, 0, 5), 4);
});


test("clamp(): max & min", t =>
{
	t.is(MathHelper.clamp(7, 10, 15), 10);
	t.is(MathHelper.clamp(9, 10, 15), 10);
	t.is(MathHelper.clamp(10, 10, 15), 10);
	t.is(MathHelper.clamp(11, 10, 15), 11);
	t.is(MathHelper.clamp(13, 10, 15), 13);
	t.is(MathHelper.clamp(14, 10, 15), 14);
	t.is(MathHelper.clamp(15, 10, 15), 14);
	t.is(MathHelper.clamp(16, 10, 15), 14);
});


test("wrap(): only max", t =>
{
	t.is(MathHelper.wrap(-3, 0, 5), 4);
	t.is(MathHelper.wrap(-1, 0, 5), 4);
	t.is(MathHelper.wrap(0, 0, 5), 0);
	t.is(MathHelper.wrap(1, 0, 5), 1);
	t.is(MathHelper.wrap(3, 0, 5), 3);
	t.is(MathHelper.wrap(4, 0, 5), 4);
	t.is(MathHelper.wrap(5, 0, 5), 0);
	t.is(MathHelper.wrap(6, 0, 5), 0);
});


test("wrap(): max & min", t =>
{
	t.is(MathHelper.wrap(7, 10, 15), 14);
	t.is(MathHelper.wrap(9, 10, 15), 14);
	t.is(MathHelper.wrap(10, 10, 15), 10);
	t.is(MathHelper.wrap(11, 10, 15), 11);
	t.is(MathHelper.wrap(13, 10, 15), 13);
	t.is(MathHelper.wrap(14, 10, 15), 14);
	t.is(MathHelper.wrap(15, 10, 15), 10);
	t.is(MathHelper.wrap(16, 10, 15), 10);
});