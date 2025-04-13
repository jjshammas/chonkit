import { describe, it, expect } from "vitest";
import { parseCSSShadowString } from "./useShadow";

describe("parseCSSShadowString", () => {
	it("should parse an x,y,blur box-shadow string", () => {
		const input = "10px 20px 30px rgba(0, 0, 0, 0.5)";
		const result = parseCSSShadowString(input);
		expect(result).toEqual({
			offsetX: 10,
			offsetY: 20,
			blur: 30,
			color: "rgba(0, 0, 0, 0.5)",
		});
	});

	it("should parse a distance,blur box-shadow string", () => {
		const input = "10px 20px rgba(0, 0, 0, 0.5)";
		const result = parseCSSShadowString(input);
		expect(result).toEqual({
			distance: 10,
			blur: 20,
			color: "rgba(0, 0, 0, 0.5)",
		});
	});
});
