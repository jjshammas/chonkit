import { describe, it, expect } from "vitest";

import {
	createAnimationTranslationFrames,
	mergeAnimationFrames,
	mergeKeyframeStyle,
	mergeTransformValues,
	insertSteppedAnimationFrames,
} from "./createAnimationFrames";

describe("mergeTransformValues", () => {
	it("should merge multiple transform values", () => {
		const transform1 = "translateX(10px) rotate(45deg)";
		const transform2 = "translateY(20px) scale(2)";
		const mergedTransform = mergeTransformValues(transform1, transform2);
		expect(mergedTransform).toBe(
			"translateX(10px) rotate(45deg) translateY(20px) scale(2)"
		);
	});

	it("should handle duplicate transform properties", () => {
		const transform1 = "translateX(10px) scale(2)";
		const transform2 = "translateX(20px)";
		const mergedTransform = mergeTransformValues(transform1, transform2);
		expect(mergedTransform).toBe("translateX(20px) scale(2)");
	});
});

describe("mergeKeyframeStyle", () => {
	it("should merge styles correctly", () => {
		const style1 = "opacity: 0;";
		const style2 = "transform: translateX(10px);";
		const style3 = "opacity: 1;";
		const mergedStyle = mergeKeyframeStyle(`${style1} ${style2} ${style3}`);
		expect(mergedStyle).toBe("opacity: 1; transform: translateX(10px);");
	});
});

describe("mergeAnimationFrames", () => {
	it("should merge frames with the same percent", () => {
		const frames = [
			{ percent: 0, styles: "opacity: 0;" },
			{ percent: 0, styles: "transform: translateX(10px);" },
			{ percent: 50, styles: "opacity: 1;" },
			{ percent: 100, styles: "opacity: 1;" },
		];
		const result = mergeAnimationFrames(frames);
		expect(result).toEqual([
			{ percent: 0, styles: "opacity: 0; transform: translateX(10px);" },
			{ percent: 50, styles: "opacity: 1;" },
			{ percent: 100, styles: "opacity: 1;" },
		]);
	});
});

describe("insertSteppedAnimationFrames", () => {
	it("should insert stepped frames correctly", () => {
		const frames = [
			{ percent: 0, styles: "opacity: 0;" },
			{ percent: 100, styles: "opacity: 1;" },
		];
		const result = insertSteppedAnimationFrames(frames);
		expect(result).toEqual([
			{ percent: 0, styles: "opacity: 0;" },
			{ percent: 99.99, styles: "opacity: 0;" },
			{ percent: 100, styles: "opacity: 1;" },
		]);
	});
});

describe("createAnimationTranslationFrames", () => {
	it("should create animation frames correctly", () => {
		const result = createAnimationTranslationFrames({
			from: { yBlocks: 0 },
			to: { yBlocks: 2 },
			blockSize: 10,
			startPercent: 0,
			endPercent: 100,
		});
		expect(result).toEqual([
			{ percent: 0, styles: "transform: translateY(0px);" },
			{ percent: 49.99, styles: "transform: translateY(0px);" },
			{ percent: 50, styles: "transform: translateY(10px);" },
			{ percent: 99.99, styles: "transform: translateY(10px);" },
			{ percent: 100, styles: "transform: translateY(20px);" },
		]);
	});

	it("should handle both x and y translations", () => {
		const result = createAnimationTranslationFrames({
			from: { yBlocks: 0, xBlocks: -1 },
			to: { yBlocks: 2, xBlocks: 0 },
			blockSize: 10,
			startPercent: 0,
			endPercent: 100,
		});
		expect(result).toEqual([
			{
				percent: 0,
				styles: "transform: translateX(-10px) translateY(0px);",
			},
			{
				percent: 49.99,
				styles: "transform: translateX(-10px) translateY(0px);",
			},
			{ percent: 50, styles: "transform: translateY(10px);" },
			{ percent: 99.99, styles: "transform: translateY(10px);" },
			{
				percent: 100,
				styles: "transform: translateX(0px) translateY(20px);",
			},
		]);
	});

	it("should return empty frames for zero blocks", () => {
		const result = createAnimationTranslationFrames({
			from: { yBlocks: 0, xBlocks: 0 },
			to: { yBlocks: 0, xBlocks: 0 },
			blockSize: 10,
			startPercent: 0,
			endPercent: 100,
		});
		expect(result).toEqual([]);
	});
});
