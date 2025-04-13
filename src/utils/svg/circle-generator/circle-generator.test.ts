import { test, assert, expect } from "vitest";
import {
	generatePixelCornerArc,
	generateRoundedCornerPoints,
	flipPointsAboutHorizontalAxis,
} from "./circle-generator";

test("can flip points horizontally", () => {
	const flippedPoints = flipPointsAboutHorizontalAxis(
		[
			[0, 0],
			[1, 0],
			[0, 1],
		],
		50
	);
	const expectedFlippedPoints = [
		[50, 0],
		[49, 0],
		[50, 1],
	];

	expect(flippedPoints).toStrictEqual(expectedFlippedPoints);
});
