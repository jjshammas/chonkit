import { ChonkitProvider } from "@/core/ChonkitProvider/ChonkitProvider";
import { render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AnimatedBox } from "./AnimatedBox";
import { animationManager } from "./createAnimationManager";

describe("AnimatedBox", () => {
	afterEach(() => {
		animationManager.clear();
		vi.restoreAllMocks();
	});

	// Not sure if we want this. If you change the entry animation, do you expect it to replay or just snap to the new values?
	it.skip("does not replay enter animation when animation config changes while visible", () => {
		const cacheSpy = vi.spyOn(animationManager, "cacheKeyframes");

		const { rerender } = render(
			<ChonkitProvider blockSize={8}>
				<AnimatedBox
					animation={{
						enter: {
							from: { opacity: 0 },
							to: { opacity: 1 },
							duration: 200,
						},
					}}
				>
					Animated
				</AnimatedBox>
			</ChonkitProvider>
		);

		expect(cacheSpy).toHaveBeenCalledTimes(1);

		rerender(
			<ChonkitProvider blockSize={8}>
				<AnimatedBox
					animation={{
						enter: {
							from: { opacity: 0 },
							to: { opacity: 1 },
							duration: 350,
						},
					}}
				>
					Animated
				</AnimatedBox>
			</ChonkitProvider>
		);

		expect(cacheSpy).toHaveBeenCalledTimes(1);
	});

	it("applies enter end styles when skipping the enter animation", async () => {
		const { container } = render(
			<ChonkitProvider blockSize={8}>
				<AnimatedBox
					skipEnterAnimation
					animation={{
						enter: {
							from: { opacity: 0 },
							to: { opacity: 1 },
						},
					}}
				>
					Animated
				</AnimatedBox>
			</ChonkitProvider>
		);

		const root = container.querySelector(".chonkit-root");
		const box = root?.firstElementChild as HTMLElement | null;

		await waitFor(() => {
			expect(box?.style.opacity).toBe("1");
		});
	});

	it("starts the loop animation after enter completes", async () => {
		const { container } = render(
			<ChonkitProvider blockSize={8}>
				<AnimatedBox
					animation={{
						enter: {
							from: { opacity: 0 },
							to: { opacity: 1 },
							duration: 100,
						},
						loop: {
							from: { opacity: 1 },
							to: { opacity: 0.5 },
							duration: 200,
						},
					}}
				>
					Animated
				</AnimatedBox>
			</ChonkitProvider>
		);

		const root = container.querySelector(".chonkit-root");
		const box = root?.firstElementChild as HTMLElement | null;

		expect(box?.style.animation).not.toContain("infinite");

		box?.dispatchEvent(new Event("animationend"));

		await waitFor(() => {
			expect(box?.style.animation).toContain("infinite");
		});
	});

	it("stops the loop animation when an exit animation starts", async () => {
		const { container, rerender } = render(
			<ChonkitProvider blockSize={8}>
				<AnimatedBox
					isVisible
					animation={{
						enter: {
							from: { opacity: 0 },
							to: { opacity: 1 },
							duration: 100,
						},
						exit: {
							from: { opacity: 1 },
							to: { opacity: 0 },
							duration: 200,
						},
						loop: {
							from: { opacity: 1 },
							to: { opacity: 0.6 },
							duration: 300,
						},
					}}
				>
					Animated
				</AnimatedBox>
			</ChonkitProvider>
		);

		const root = container.querySelector(".chonkit-root");
		const box = root?.firstElementChild as HTMLElement | null;

		box?.dispatchEvent(new Event("animationend"));

		await waitFor(() => {
			expect(box?.style.animation).toContain("infinite");
		});

		rerender(
			<ChonkitProvider blockSize={8}>
				<AnimatedBox
					isVisible={false}
					animation={{
						enter: {
							from: { opacity: 0 },
							to: { opacity: 1 },
							duration: 100,
						},
						exit: {
							from: { opacity: 1 },
							to: { opacity: 0 },
							duration: 200,
						},
						loop: {
							from: { opacity: 1 },
							to: { opacity: 0.6 },
							duration: 300,
						},
					}}
				>
					Animated
				</AnimatedBox>
			</ChonkitProvider>
		);

		await waitFor(() => {
			expect(box?.style.animation).not.toContain("infinite");
		});
	});
});
