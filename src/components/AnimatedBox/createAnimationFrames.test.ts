import { describe, it, expect } from "vitest";

import {
	createAnimationTranslationFrames,
	createAnimatedProperties,
	toCSSTimingFunction,
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

	it("should skip stepped frames when block snapping is disabled", () => {
		const result = createAnimationTranslationFrames({
			from: { yBlocks: 0 },
			to: { yBlocks: 2 },
			blockSize: 10,
			startPercent: 0,
			endPercent: 100,
			disableAnimationBlockSnapping: true,
		});
		expect(result).toEqual([
			{ percent: 0, styles: "transform: translateY(0px);" },
			{ percent: 50, styles: "transform: translateY(10px);" },
			{ percent: 100, styles: "transform: translateY(20px);" },
		]);
	});
});

describe("createAnimatedProperties", () => {
	it("should not cap steps when stepRateHz is Infinity", () => {
		const result = createAnimatedProperties({
			from: { xBlocks: 0 },
			to: { xBlocks: 4 },
			blockSize: 10,
			durationMs: 1000,
			stepRateHz: Infinity,
			disableAnimationBlockSnapping: true,
		});
		expect(result).toHaveLength(5);
	});

	it("should cap steps when stepRateHz is finite", () => {
		const result = createAnimatedProperties({
			from: { xBlocks: 0 },
			to: { xBlocks: 4 },
			blockSize: 10,
			durationMs: 1000,
			stepRateHz: 2,
			disableAnimationBlockSnapping: true,
		});
		expect(result).toHaveLength(3);
	});
});

describe("toCSSTimingFunction", () => {
	it("should map custom keywords to cubic-bezier", () => {
		expect(toCSSTimingFunction("ease-out-cubic")).toBe(
			"cubic-bezier(0.215, 0.61, 0.355, 1)"
		);
	});

	it("should pass through valid CSS timing functions", () => {
		expect(toCSSTimingFunction("cubic-bezier(0, 0, 1, 1)")).toBe(
			"cubic-bezier(0, 0, 1, 1)"
		);
		expect(toCSSTimingFunction("steps(4, end)")).toBe("steps(4, end)");
	});

	it("should return unknown keywords unchanged", () => {
		expect(toCSSTimingFunction("ease-in-out")).toBe(
			"cubic-bezier(0.42, 0, 0.58, 1)"
		);
		expect(toCSSTimingFunction("custom-ease")).toBe("custom-ease");
	});
});
