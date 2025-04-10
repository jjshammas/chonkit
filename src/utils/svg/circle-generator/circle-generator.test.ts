import { test, assert, expect } from "vitest";
import {
	generatePixelCornerArc,
	generateRoundedCornerPath,
	flipPointsAboutHorizontalAxis,
} from "./circle-generator";

test("generates a circle", () => {
	const grid = generatePixelCornerArc(5);
	console.log(grid.map((row) => row.join(" ")).join("\n"));

	console.log(generateRoundedCornerPath(3, 0, 0, 0));
});

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
