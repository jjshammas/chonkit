import { describe, it, expect } from "vitest";
import { normalizeVisualValue } from "./createVisualStyle";

describe("normalizeVisualValue", () => {
	it("should convert numeric values to calc with --ck-block-size", () => {
		const result = normalizeVisualValue(16, "padding");
		expect(result).toBe("calc(16 * var(--ck-block-size))");
	});

	it("should wrap positive pixel values in round()", () => {
		const result = normalizeVisualValue("16px", "margin");
		expect(result).toBe("round(16px, var(--ck-block-size))");
	});

	it("should wrap negative pixel values in round() correctly", () => {
		const result = normalizeVisualValue("-3px", "top");
		expect(result).toBe("round(-3px, var(--ck-block-size))");
	});

	it("should handle decimal pixel values", () => {
		const result = normalizeVisualValue("16.5px", "width");
		expect(result).toBe("round(16.5px, var(--ck-block-size))");
	});

	it("should handle negative decimal pixel values", () => {
		const result = normalizeVisualValue("-16.5px", "left");
		expect(result).toBe("round(-16.5px, var(--ck-block-size))");
	});

	it("should handle multiple pixel values in a string", () => {
		const result = normalizeVisualValue("10px 20px 30px 40px", "padding");
		expect(result).toBe(
			"round(10px, var(--ck-block-size)) round(20px, var(--ck-block-size)) round(30px, var(--ck-block-size)) round(40px, var(--ck-block-size))"
		);
	});

	it("should handle mixed positive and negative pixel values", () => {
		const result = normalizeVisualValue("10px -5px 20px", "margin");
		expect(result).toBe(
			"round(10px, var(--ck-block-size)) round(-5px, var(--ck-block-size)) round(20px, var(--ck-block-size))"
		);
	});

	it("should handle array of values", () => {
		const result = normalizeVisualValue([16, "8px"], "padding");
		expect(result).toBe(
			"calc(16 * var(--ck-block-size)) round(8px, var(--ck-block-size))"
		);
	});

	it("should not normalize exempt keys like flex", () => {
		const result = normalizeVisualValue(1, "flex");
		expect(result).toBe("1");
	});

	it("should not normalize flexGrow", () => {
		const result = normalizeVisualValue(2, "flexGrow");
		expect(result).toBe("2");
	});

	it("should not normalize opacity", () => {
		const result = normalizeVisualValue(0.5, "opacity");
		expect(result).toBe("0.5");
	});

	it("should not normalize zIndex", () => {
		const result = normalizeVisualValue(100, "zIndex");
		expect(result).toBe("100");
	});

	it("should pass through non-pixel string values", () => {
		const result = normalizeVisualValue("100%", "width");
		expect(result).toBe("100%");
	});

	it("should pass through color values", () => {
		const result = normalizeVisualValue("red", "color");
		expect(result).toBe("red");
	});

	it("should handle calc expressions without px", () => {
		const result = normalizeVisualValue("calc(100% - 20rem)", "width");
		expect(result).toBe("calc(100% - 20rem)");
	});
});
