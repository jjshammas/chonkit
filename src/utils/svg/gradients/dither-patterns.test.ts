import { describe, expect, it } from "vitest";
import { generateDitherPattern } from "./dither-patterns";

describe("Bayer Matrix dithering", () => {
	it("should generate a dither pattern for a given size", () => {
		const pattern = generateDitherPattern(4, 4, 128);
		expect(pattern).toBeDefined();
		expect(pattern.length).toBe(4);
		expect(pattern[0].length).toBeGreaterThan(0);
		// Pattern should contain 0 and 1 numbers
		pattern.forEach((row) => {
			row.forEach((val) => {
				expect([0, 1]).toContain(val);
			});
		});
	});

	it("should generate different patterns for different intensities", () => {
		const darkPattern = generateDitherPattern(4, 4, 64);
		const lightPattern = generateDitherPattern(4, 4, 192);

		// Light pattern should have more 1s (second color)
		const lightOnes = lightPattern
			.flat()
			.reduce((sum, val) => sum + val, 0);
		const darkOnes = darkPattern.flat().reduce((sum, val) => sum + val, 0);
		expect(lightOnes).toBeGreaterThan(darkOnes);
	});

	it("should tile pattern to fill requested dimensions", () => {
		const pattern = generateDitherPattern(8, 8, 128);
		expect(pattern.length).toBe(8);
		pattern.forEach((row) => {
			expect(row.length).toBeGreaterThanOrEqual(8);
		});
	});

	it("should generate valid patterns for small dimensions", () => {
		const smallPattern = generateDitherPattern(2, 2, 128);
		expect(smallPattern.length).toBe(2);
		smallPattern.forEach((row) => {
			expect(row.length).toBeGreaterThanOrEqual(2);
		});
	});

	it("should handle edge case with intensity 0 (all first color)", () => {
		const pattern = generateDitherPattern(4, 4, 0);
		const pattern255 = generateDitherPattern(4, 4, 255);

		// At intensity 0, all should be 0 (first color)
		const hasOnes = pattern.flat().includes(1);
		// At intensity 255, all should be 1 (second color)
		const allOnes = pattern255.flat().every((val) => val === 1);

		expect(hasOnes).toBe(false);
		expect(allOnes).toBe(true);
	});
});
