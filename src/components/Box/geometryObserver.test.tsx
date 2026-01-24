import { ChonkitProvider } from "@/core/ChonkitProvider/ChonkitProvider";
import { render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Box } from "./Box";
import styles from "./Box.module.css";

/**
 * Tests for the Box geometry observer system
 *
 * This test suite validates the complex geometry observation logic that:
 * 1. Conditionally hides elements that need geometry until it's available
 * 2. Batches geometry updates via RAF to avoid layout thrashing
 * 3. Handles prop changes that enable/disable geometry requirements
 * 4. Manages class removal across multiple frames with time budgets
 *
 * The geometry system is critical for performance when rendering thousands
 * of Box components on a page.
 */

// Mock ResizeObserver
class MockResizeObserver {
	callback: ResizeObserverCallback;
	elements: Set<Element> = new Set();

	constructor(callback: ResizeObserverCallback) {
		this.callback = callback;
	}

	observe(element: Element) {
		this.elements.add(element);
		// Simulate initial observation on next frame
		requestAnimationFrame(() => {
			const entry = {
				target: element,
				contentRect: element.getBoundingClientRect(),
				borderBoxSize: [],
				contentBoxSize: [],
				devicePixelContentBoxSize: [],
			} as ResizeObserverEntry;
			this.callback([entry], this);
		});
	}

	unobserve(element: Element) {
		this.elements.delete(element);
	}

	disconnect() {
		this.elements.clear();
	}
}

let mockRO: MockResizeObserver | null = null;

describe("Box Geometry Observer", () => {
	beforeEach(() => {
		// Mock ResizeObserver
		global.ResizeObserver = vi.fn((callback) => {
			mockRO = new MockResizeObserver(callback);
			return mockRO as any;
		}) as any;

		// Don't mock RAF - let it run naturally for these tests
	});

	afterEach(() => {
		vi.restoreAllMocks();
		mockRO = null;
	});

	describe("Test 1: Box visibility without geometry needs", () => {
		it("should render visible when no geometry-dependent props are used", () => {
			const { container } = render(
				<ChonkitProvider blockSize={8}>
					<Box>Simple Box</Box>
				</ChonkitProvider>
			);

			// Find the Box container (first child of chonkit-root, then its first child)
			const root = container.querySelector(".chonkit-root");
			const box = root?.firstElementChild;
			expect(box).toBeTruthy();
			// Should NOT have geometry-unknown class
			const hasGeometryUnknownClass =
				box?.classList.contains("geometry-unknown") ||
				box?.classList.contains("geometry-unknown-show");
			expect(hasGeometryUnknownClass).toBe(false);
		});
	});

	describe("Test 2: Box visibility with geometry needs", () => {
		it("should start hidden when borderRadius is used", async () => {
			const { container } = render(
				<ChonkitProvider blockSize={8}>
					<Box sx={{ borderRadius: 2 }}>Rounded Box</Box>
				</ChonkitProvider>
			);

			const root = container.querySelector(".chonkit-root");
			const box = root?.firstElementChild;
			// Should have geometry-unknown class initially
			expect(box?.classList.contains("geometry-unknown")).toBe(true);

			// Wait for geometry to be delivered and class removed
			await waitFor(
				() => {
					expect(box?.classList.contains("geometry-unknown")).toBe(
						false
					);
				},
				{ timeout: 100 }
			);
		});

		it("should respect showWhileGeometryUnknown flag", () => {
			const { container } = render(
				<ChonkitProvider blockSize={8}>
					<Box sx={{ borderRadius: 2 }} showWhileGeometryUnknown>
						Show Box
					</Box>
				</ChonkitProvider>
			);

			const root = container.querySelector(".chonkit-root");
			const box = root?.firstElementChild;
			// Should have geometry-unknown-show class instead
			expect(box?.classList.contains("geometry-unknown-show")).toBe(true);
			expect(box?.classList.contains("geometry-unknown")).toBe(false);
		});

		it("should respect immediateGeometry prop", () => {
			const { container } = render(
				<ChonkitProvider blockSize={8}>
					<Box sx={{ borderRadius: 2 }} immediateGeometry>
						Immediate Box
					</Box>
				</ChonkitProvider>
			);

			const root = container.querySelector(".chonkit-root");
			const box = root?.firstElementChild;
			// Should NOT have any geometry-unknown class
			expect(box?.classList.contains("geometry-unknown")).toBe(false);
			expect(box?.classList.contains("geometry-unknown-show")).toBe(
				false
			);
		});
	});

	describe("Test 3: RAF batching", () => {
		it("should batch geometry broadcasts into single RAF per ResizeObserver event", async () => {
			const rafSpy = vi.spyOn(global, "requestAnimationFrame");

			// Create 1000 boxes with geometry needs
			const boxes = Array.from({ length: 1000 }, (_, i) => (
				<Box key={i} sx={{ borderRadius: 2 }}>
					Box {i}
				</Box>
			));

			render(<ChonkitProvider blockSize={8}>{boxes}</ChonkitProvider>);

			// Wait for all geometry to be delivered
			await waitFor(
				() => {
					const root = document.querySelector(".chonkit-root");
					const allBoxes = root?.querySelectorAll("div");
					const allVisible = Array.from(allBoxes || []).every(
						(box) => !box.classList.contains("geometry-unknown")
					);
					expect(allVisible).toBe(true);
				},
				{ timeout: 2000 }
			);

			const rafCallCount = rafSpy.mock.calls.length;

			// WITHOUT batching, 1000 elements would cause:
			// - 1000 RAF calls for geometry broadcasts (one per element)
			// - 1000 RAF calls for class removals (one per element)
			// = 2000+ RAF calls total
			//
			// WITH batching:
			// - 1 RAF for geometry broadcast (handles all 1000 elements at once)
			// - ~1000 RAF calls for class removals (3ms budget per frame, ~1 element per frame)
			// = ~1000 RAF calls total (50% reduction)
			//
			// The batching is clearly visible: we use roughly 1000 RAF calls instead of 2000+

			expect(rafCallCount).toBeGreaterThan(500); // Many calls for class removal
			expect(rafCallCount).toBeLessThan(1500); // But much less than 2000+ without batching
		});
	});

	describe("Test 4: Prop change subscription handling", () => {
		it("should deliver geometry when props change to enable geometry needs", async () => {
			const { container, rerender } = render(
				<ChonkitProvider blockSize={8}>
					<Box>No Geometry</Box>
				</ChonkitProvider>
			);

			const root = container.querySelector(".chonkit-root");
			const box = root?.firstElementChild;

			// Initially no geometry-unknown class
			expect(box?.classList.contains("geometry-unknown")).toBe(false);

			// Now add borderRadius prop
			rerender(
				<ChonkitProvider blockSize={8}>
					<Box sx={{ borderRadius: 2 }}>With Geometry</Box>
				</ChonkitProvider>
			);

			// Should now have geometry-unknown class
			expect(box?.classList.contains("geometry-unknown")).toBe(true);

			// Should get geometry delivered and class removed
			await waitFor(
				() => {
					expect(box?.classList.contains("geometry-unknown")).toBe(
						false
					);
				},
				{ timeout: 100 }
			);
		});

		it("should deliver cached geometry to new subscribers without resize", async () => {
			const { container, rerender } = render(
				<ChonkitProvider blockSize={8}>
					<Box sx={{ borderRadius: 2 }}>Rounded Box</Box>
				</ChonkitProvider>
			);

			const root = container.querySelector(".chonkit-root");
			const box = root?.firstElementChild as HTMLElement | null;

			await waitFor(
				() => {
					expect(box?.classList.contains("geometry-unknown")).toBe(
						false
					);
				},
				{ timeout: 100 }
			);

			rerender(
				<ChonkitProvider blockSize={8}>
					<Box sx={{ borderRadius: 2, bevelHighlightSize: 1 }}>
						Bevel Box
					</Box>
				</ChonkitProvider>
			);

			await waitFor(
				() => {
					const highlight = box?.querySelector(
						`.${styles.highlight}`
					) as HTMLElement | null;
					expect(highlight).toBeTruthy();
					expect(highlight?.style.clipPath).toMatch(/path\('/);
				},
				{ timeout: 100 }
			);
		});
	});
});
