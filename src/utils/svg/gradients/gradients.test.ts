import { calculateCenters, removeInvalidCenters } from "./gradients";
import { expect, describe, it } from "vitest";

describe("gradient center calculation", () => {
	it("should calculate centers for a simple gradient string", () => {
		expect(calculateCenters(["#000", "#fff"], 100, 5)).toEqual([
			{ color: "#000", center: 0 },
			{ color: "#fff", center: 100 },
		]);
	});

	it("should calculate centers for a gradient string with percentages", () => {
		expect(calculateCenters(["#000 50%", "#fff"], 100, 5)).toEqual([
			{ color: "#000", center: 50 },
			{ color: "#fff", center: 100 },
		]);
	});

	it("should calculate centers for a gradient string with 3 steps", () => {
		expect(calculateCenters(["#000 50%", "#aaa", "#fff"], 100, 5)).toEqual([
			{ color: "#000", center: 50 },
			{ color: "#aaa", center: 75 },
			{ color: "#fff", center: 100 },
		]);
	});

	it("should calculate centers for a gradient string with many steps", () => {
		expect(
			calculateCenters(
				[
					"#000 10%",
					"#111",
					"#222 30%",
					"#333",
					"#444",
					"#555",
					"#666 70%",
					"#777",
					"#888",
					"#999",
				],
				100,
				5
			)
		).toEqual([
			{ color: "#000", center: 10 },
			{ color: "#111", center: 20 },
			{ color: "#222", center: 30 },
			{ color: "#333", center: 40 },
			{ color: "#444", center: 50 },
			{ color: "#555", center: 60 },
			{ color: "#666", center: 70 },
			{ color: "#777", center: 80 },
			{ color: "#888", center: 90 },
			{ color: "#999", center: 100 },
		]);
	});

	it("should round centers to the block size", () => {
		expect(
			calculateCenters(["#000 48%", "#aaa 62%", "#fff"], 100, 5)
		).toEqual([
			{ color: "#000", center: 50 },
			{ color: "#aaa", center: 60 },
			{ color: "#fff", center: 100 },
		]);
	});

	it("should calculate centers for a simple gradient string", () => {
		expect(
			calculateCenters(["red", "green 50%", "blue 75%"], 100, 5)
		).toEqual([
			{ color: "red", center: 0 },
			{ color: "green", center: 50 },
			{ color: "blue", center: 75 },
		]);
	});
});

describe("gradient center filtering", () => {
	it("should move centers with improperly sorted values", () => {
		expect(
			removeInvalidCenters(
				[
					{ color: "#000", center: 50 },
					{ color: "#111", center: 20 },
					{ color: "#222", center: 20 },
					{ color: "#fff", center: 100 },
				],
				5
			)
		).toEqual([
			{ color: "#000", center: 50 },
			{ color: "#111", center: 55 },
			{ color: "#222", center: 60 },
			{ color: "#fff", center: 100 },
		]);
	});

	it("should filter out centers with improperly sorted values", () => {
		expect(
			removeInvalidCenters(
				[
					{ color: "#000", center: 95 },
					{ color: "#111", center: 20 },
					{ color: "#fff", center: 100 },
				],
				5
			)
		).toEqual([
			{ color: "#000", center: 95 },
			{ color: "#fff", center: 100 },
		]);
	});
});
