/// <reference path="../../lib/openrct2.d.ts" />

import test from "ava";
import Mock, { TrackPieceMock } from "openrct2-mocks";
import { getDistanceFromProgress } from "../../src/services/spacingEditor";

class TrackPiece
{
	constructor(
		public position: CoordsXYZ,
		public type: number,
		public subpositions: CoordsXYZ[])
	{}
}

const flatTrackPiece = new TrackPiece({ x: 0, y: 0, z: 0 }, 1,
[
	{ x: 31, y: 16, z: 0 }, { x: 30, y: 16, z: 0 }, { x: 29, y: 16, z: 0 }, { x: 28, y: 16, z: 0 }, { x: 27, y: 16, z: 0 },
	{ x: 26, y: 16, z: 0 }, { x: 25, y: 16, z: 0 }, { x: 24, y: 16, z: 0 }, { x: 23, y: 16, z: 0 }, { x: 22, y: 16, z: 0 },
	{ x: 21, y: 16, z: 0 }, { x: 20, y: 16, z: 0 }, { x: 19, y: 16, z: 0 }, { x: 18, y: 16, z: 0 }, { x: 17, y: 16, z: 0 },
	{ x: 16, y: 16, z: 0 }, { x: 15, y: 16, z: 0 }, { x: 14, y: 16, z: 0 }, { x: 13, y: 16, z: 0 }, { x: 12, y: 16, z: 0 },
	{ x: 11, y: 16, z: 0 }, { x: 10, y: 16, z: 0 }, { x: 9, y: 16, z: 0 }, { x: 8, y: 16, z: 0 }, { x: 7, y: 16, z: 0 },
	{ x: 6, y: 16, z: 0 }, { x: 5, y: 16, z: 0 }, { x: 4, y: 16, z: 0 }, { x: 3, y: 16, z: 0 }, { x: 2, y: 16, z: 0 },
	{ x: 1, y: 16, z: 0 }, { x: 0, y: 16, z: 0 }
]);


function setupTrackIterator(trackPieces: TrackPiece[], trackStartIndex?: number): void
{
	global.map = Mock.map({
		tiles: trackPieces.map(p => Mock.tile({
			x: Math.trunc(p.position.x / 32),
			y: Math.trunc(p.position.y / 32),
			elements: [
				Mock.trackElement({ type: "track", baseZ: p.position.z })
			]
		})),
		getTrackIterator()
		{
			return Mock.trackIterator({
				segments: trackPieces.map(piece => Mock.trackSegment({
					subpositions: <TrackSubposition[]>piece.subpositions,
					type: piece.type
				})),
				trackPieces: trackPieces.map(piece => <TrackPieceMock>({ trackType: piece.type, location: piece.position })),
				trackPieceIndex: trackStartIndex || 0
			});
		},
	});
}


test("Flat track: move forward by 1", t =>
{
	setupTrackIterator([ flatTrackPiece ]);
	const car = Mock.car({ trackProgress: 5 });

	const distance = getDistanceFromProgress(car, 1);

	t.is(distance, 8716);
});


test("Flat track: move forward by 10", t =>
{
	setupTrackIterator([ flatTrackPiece ]);
	const car = Mock.car({ trackProgress: 5 });

	const distance = getDistanceFromProgress(car, 10);

	t.is(distance, 8716 * 10);
});


test("Flat track: move forward by 31", t =>
{
	setupTrackIterator([ flatTrackPiece ]);
	const car = Mock.car({ trackProgress: 0 });

	const distance = getDistanceFromProgress(car, 31);

	t.is(distance, 8716 * 31);
});


test("Flat track: move forward by 10 until end of track", t =>
{
	setupTrackIterator([ flatTrackPiece ]);
	const car = Mock.car({ trackProgress: 25 });

	const distance = getDistanceFromProgress(car, 10);

	t.is(distance, 8716 * 6);
});


test("Flat track: jump forward by 50 until end of track", t =>
{
	setupTrackIterator([ flatTrackPiece ]);
	const car = Mock.car({ trackProgress: 0 });

	const distance = getDistanceFromProgress(car, 50);

	t.is(distance, 8716 * 31);
});


test("Flat track: move backwards by 1", t =>
{
	setupTrackIterator([ flatTrackPiece ]);
	const car = Mock.car({ trackProgress: 21 });

	const distance = getDistanceFromProgress(car, -1);

	t.is(distance, -8716);
});


test("Flat track: move backwards by 10", t =>
{
	setupTrackIterator([ flatTrackPiece ]);
	const car = Mock.car({ trackProgress: 21 });

	const distance = getDistanceFromProgress(car, -10);

	t.is(distance, -8716 * 10);
});


test("Flat track: move backwards by 31", t =>
{
	setupTrackIterator([ flatTrackPiece ]);
	const car = Mock.car({ trackProgress: 31 });

	const distance = getDistanceFromProgress(car, -31);

	t.is(distance, -8716 * 31);
});


test("Flat track: move backwards by 10 until end of track", t =>
{
	setupTrackIterator([ flatTrackPiece ]);
	const car = Mock.car({ trackProgress: 5 });

	const distance = getDistanceFromProgress(car, -10);

	t.is(distance, -8716 * 5);
});


test("Flat track: jump backwards by 50 until end of track", t =>
{
	setupTrackIterator([ flatTrackPiece ]);
	const car = Mock.car({ trackProgress: 31 });

	const distance = getDistanceFromProgress(car, -50);

	t.is(distance, -8716 * 31);
});


test("Two flat tracks: move to next by 1", t =>
{
	setupTrackIterator([ flatTrackPiece, flatTrackPiece ]);
	const car = Mock.car({ trackProgress: 31 });

	const distance = getDistanceFromProgress(car, 1);

	t.is(distance, 8716);
});


test("Two flat tracks: move to next by 10", t =>
{
	setupTrackIterator([ flatTrackPiece, flatTrackPiece ]);
	const car = Mock.car({ trackProgress: 28 });

	const distance = getDistanceFromProgress(car, 10);

	t.is(distance, 8716 * 10);
});


test("Two flat tracks: move to previous by 1", t =>
{
	setupTrackIterator([ flatTrackPiece, flatTrackPiece ], 1);
	const car = Mock.car({ trackProgress: 0 });

	const distance = getDistanceFromProgress(car, -1);

	t.is(distance, -8716);
});


test("Two flat tracks: move to previous by 10", t =>
{
	setupTrackIterator([ flatTrackPiece, flatTrackPiece ], 1);
	const car = Mock.car({ trackProgress: 4 });

	const distance = getDistanceFromProgress(car, -10);

	t.is(distance, -8716 * 10);
});


test("Three flat tracks: jump piece with move to next by 50", t =>
{
	setupTrackIterator([ flatTrackPiece, flatTrackPiece, flatTrackPiece ]);
	const car = Mock.car({ trackProgress: 27 });

	const distance = getDistanceFromProgress(car, 50);

	t.is(distance, 8716 * 50);
});


test("Three flat tracks: jump piece with move to previous by 50", t =>
{
	setupTrackIterator([ flatTrackPiece, flatTrackPiece, flatTrackPiece ], 2);
	const car = Mock.car({ trackProgress: 3 });

	const distance = getDistanceFromProgress(car, -50);

	t.is(distance, -8716 * 50);
});


const curvyTrackPiece = new TrackPiece({ x: 0, y: 0, z: 0 }, 2,
[
	{ x: 31, y: 16, z: 0 },    // 0
	{ x: 26, y: 16, z: 0 },    // 1: X
	{ x: 11, y: 16, z: 6 },    // 2: XZ
	{ x: -6, y: 12, z: 24 },   // 3: XYZ
	{ x: -14, y: -11, z: 48 }, // 4: XYZ
	{ x: -14, y: -27, z: 60 }, // 5: YZ
	{ x: -14, y: -30, z: 60 }, // 6: Y
	{ x: -17, y: -32, z: 60 }, // 7: XY
	{ x: -17, y: -32, z: 64 }  // 8: Z
]);

const curvyTest = test.macro({
	title(_: string | undefined, start: number, progress: number): string
	{
		const direction = (progress >= 0) ? "forwards" : "backwards";
		return `Curvy track: move ${direction} by ${progress} from subposition ${start}`;
	},
	exec(t, start: number, progress: number, expectedResult: number): void
	{
		setupTrackIterator([ curvyTrackPiece ]);
		const car = Mock.car({ trackProgress: start });

		const distance = getDistanceFromProgress(car, progress);

		t.is(distance, expectedResult);
	}
});

// Forward by 1
test(curvyTest, 0, 1, 8716);
test(curvyTest, 1, 1, 10905);
test(curvyTest, 2, 1, 13961);
test(curvyTest, 3, 1, 13961);
test(curvyTest, 4, 1, 10905);
test(curvyTest, 5, 1, 8716);
test(curvyTest, 6, 1, 12327);
test(curvyTest, 7, 1, 6554);

// Backward by 1
test(curvyTest, 8, -1, -6554);
test(curvyTest, 7, -1, -12327);
test(curvyTest, 6, -1, -8716);
test(curvyTest, 5, -1, -10905);
test(curvyTest, 4, -1, -13961);
test(curvyTest, 3, -1, -13961);
test(curvyTest, 2, -1, -10905);
test(curvyTest, 1, -1, -8716);


// Map:
// . . . | . . .
// . . x | x . .
// . x . | . x .
//-------+-------
//       | . x .
//       | . . .
//       | . ^ .
//-------+-------
//       | . ^ .
//       | . . ^
//       | . . .
const rightTurn1TrackPiece = new TrackPiece({ x: 32, y: 32, z: 8 }, 10,
[
	{ x: 16, y: 0, z: 0 }, { x: 31, y: 16, z: 0 },
]);
const rightTurn2TrackPiece = new TrackPiece({ x: 64, y: 32, z: 8 }, 11,
[
	{ x: 0, y: 16, z: 0 }, { x: 16, y: 31, z: 0 },
]);
const steepUpTrackPiece = new TrackPiece({ x: 64, y: 64, z: 8 }, 12,
[
	{ x: 16, y: 0, z: 0 }, { x: 16, y: 31, z: 23 },
]);
const steepTurnTrackPiece = new TrackPiece({ x: 64, y: 96, z: 32 }, 13,
[
	{ x: 16, y: 0, z: 0 }, { x: 31, y: 16, z: 63 },
]);

const multiTurnTest = test.macro({
	title(_: string | undefined, startTrackPiece: number, startProgress: number, progress: number): string
	{
		const direction = (progress >= 0) ? "forwards" : "backwards";
		return `Multi turn track: move ${direction} by ${Math.abs(progress)} from track ${startTrackPiece}, subposition ${startProgress}`;
	},
	exec(t, startTrackPiece: number, startProgress: number, progress: number, expectedResult: number): void
	{
		const trackPieces = [ rightTurn1TrackPiece, rightTurn2TrackPiece, steepUpTrackPiece, steepTurnTrackPiece ];
		const trackLocation: CoordsXYZD = { ...trackPieces[startTrackPiece].position, direction: 0 };
		setupTrackIterator(trackPieces, startTrackPiece);
		const car = Mock.car({ trackProgress: startProgress, trackLocation });

		const distance = getDistanceFromProgress(car, progress);

		t.is(distance, expectedResult);
	}
});

test(multiTurnTest, 0, 0, 1, 12327);
test(multiTurnTest, 0, 0, 2, 12327 + 8716);
test(multiTurnTest, 0, 0, 3, 12327 + 8716 + 12327);
test(multiTurnTest, 0, 0, 4, 12327 + 8716 + 12327 + 8716);
test(multiTurnTest, 0, 0, 5, 12327 + 8716 + 12327 + 8716 + 10905);
test(multiTurnTest, 0, 0, 6, 12327 + 8716 + 12327 + 8716 + 10905 + 10905);
test(multiTurnTest, 0, 0, 7, 12327 + 8716 + 12327 + 8716 + 10905 + 10905 + 13961);
test(multiTurnTest, 0, 0, 8, 12327 + 8716 + 12327 + 8716 + 10905 + 10905 + 13961); // reached end

test(multiTurnTest, 3, 1, -1, -(13961));
test(multiTurnTest, 3, 1, -2, -(13961 + 10905));
test(multiTurnTest, 3, 1, -3, -(13961 + 10905 + 10905));
test(multiTurnTest, 3, 1, -4, -(13961 + 10905 + 10905 + 8716));
test(multiTurnTest, 3, 1, -5, -(13961 + 10905 + 10905 + 8716 + 12327));
test(multiTurnTest, 3, 1, -6, -(13961 + 10905 + 10905 + 8716 + 12327 + 8716));
test(multiTurnTest, 3, 1, -7, -(13961 + 10905 + 10905 + 8716 + 12327 + 8716 + 12327));
test(multiTurnTest, 3, 1, -8, -(13961 + 10905 + 10905 + 8716 + 12327 + 8716 + 12327)); // reached end
