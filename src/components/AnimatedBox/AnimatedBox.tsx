import React, { useEffect, useRef, useState } from "react";
import { Box, BoxProps } from "@/components/Box/Box";
import {
	DynamicKeyframe,
	createAnimationTranslationFrames,
	mergeAnimationFrames,
} from "./createAnimationFrames";
import { useChonkit } from "@/core/ChonkitProvider/ChonkitProvider";

// Helper to generate unique keyframe names
function generateUniqueKeyframeName(base: string) {
	return `${base}-${Math.random().toString(36).substr(2, 6)}`;
}

// Build keyframe string from array
function buildKeyframeString(frames: DynamicKeyframe[]) {
	return frames
		.map(({ percent, styles }) => `${percent}% { ${styles} }`)
		.join(" ");
}

// Inject keyframes into a stylesheet
function injectKeyframes(keyframeName: string, keyframeRules: string) {
	let styleSheet = document.styleSheets[0];
	if (!styleSheet) {
		const styleTag = document.createElement("style");
		document.head.appendChild(styleTag);
		styleSheet = styleTag.sheet as CSSStyleSheet;
	}

	const rule = `@keyframes ${keyframeName} { ${keyframeRules} }`;
	try {
		styleSheet.insertRule(rule, styleSheet.cssRules.length);
	} catch (err) {
		console.error("Failed to insert keyframe rule", err);
	}
}

type AnimationPhaseConfig = {
	frames?: DynamicKeyframe[];
	from?: {
		xBlocks?: number;
		yBlocks?: number;
		x?: number;
		y?: number;
		[style: string]: string | number | undefined;
	};
	to?: {
		xBlocks?: number;
		yBlocks?: number;
		x?: number;
		y?: number;
		[style: string]: string | number | undefined;
	};
	duration?: number;
	delay?: number;
	easing?: string;
	onBeforeStart?: () => void;
	onAfterEnd?: () => void;
};

type AnimatedBoxProps = {
	animation?: {
		enter?: AnimationPhaseConfig;
		exit?: AnimationPhaseConfig;
	};
	baseProps?: BoxProps;
	isVisible?: boolean;
	children?: React.ReactNode;
};

export const AnimatedBox: React.FC<AnimatedBoxProps> = ({
	animation,
	baseProps,
	isVisible = true,
	children,
}) => {
	const ref = useRef<HTMLDivElement>(null);
	const [shouldRender, setShouldRender] = useState(isVisible);
	const { blockSize } = useChonkit();

	const currentAnimationRef = useRef<"enter" | "exit" | null>(null);

	// Mount or unmount based on isVisible
	useEffect(() => {
		if (isVisible && !shouldRender) {
			setShouldRender(true);
		}
	}, [isVisible, shouldRender]);

	// Handle animations when shouldRender changes
	useEffect(() => {
		const el = ref.current;
		if (!el || !animation) return;

		const phase = isVisible ? animation.enter : animation.exit;
		if (!phase) return;

		const {
			frames: rawFrames,
			from,
			to,
			duration = 500,
			delay = 0,
			easing = "ease",
			onBeforeStart,
			onAfterEnd,
		} = phase;

		onBeforeStart?.();

		let frames: DynamicKeyframe[] = rawFrames || [];
		if (from && to) {
			const translationFrames = createAnimationTranslationFrames({
				from: {
					xBlocks: from.xBlocks || 0,
					yBlocks: from.yBlocks || 0,
				},
				to: {
					xBlocks: to.xBlocks || 0,
					yBlocks: to.yBlocks || 0,
				},
				blockSize,
			});
			const fromKeyframe: DynamicKeyframe = {
				percent: 0,
				styles: Object.entries(from)
					.filter(
						([key]) =>
							key !== "xBlocks" &&
							key !== "yBlocks" &&
							key !== "x" &&
							key !== "y"
					)
					.map(([key, value]) => `${key}: ${value};`)
					.join(" "),
			};
			const toKeyframe: DynamicKeyframe = {
				percent: 100,
				styles: Object.entries(to)
					.filter(
						([key]) =>
							key !== "xBlocks" &&
							key !== "yBlocks" &&
							key !== "x" &&
							key !== "y"
					)
					.map(([key, value]) => `${key}: ${value};`)
					.join(" "),
			};
			frames = mergeAnimationFrames([
				...translationFrames,
				fromKeyframe,
				toKeyframe,
				...frames,
			]);
		}

		const keyframeName = generateUniqueKeyframeName("animatedBox");
		const keyframeString = buildKeyframeString(frames);
		injectKeyframes(keyframeName, keyframeString);

		// Track the current animation phase
		currentAnimationRef.current = isVisible ? "enter" : "exit";

		// Reset animation state before applying new one
		el.style.animation = "none";
		void el.offsetHeight; // Force reflow

		el.style.animation = `${keyframeName} ${duration}ms ${easing} ${delay}ms forwards`;

		const handleEnd = () => {
			// Ensure this is still the correct animation phase
			if (
				currentAnimationRef.current === (isVisible ? "enter" : "exit")
			) {
				onAfterEnd?.();
				if (!isVisible) {
					setShouldRender(false); // Unmount after exit completes
				}
			}
			el.removeEventListener("animationend", handleEnd);
		};

		el.addEventListener("animationend", handleEnd);

		// Cleanup
		return () => {
			el.style.animation = "";
			currentAnimationRef.current = null;
			el.removeEventListener("animationend", handleEnd);
		};
	}, [animation, isVisible, shouldRender, blockSize]);

	if (!shouldRender) return null;

	return (
		<Box ref={ref} {...baseProps}>
			{children}
		</Box>
	);
};
