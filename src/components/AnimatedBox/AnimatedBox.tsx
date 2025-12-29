import React, {
	useEffect,
	useRef,
	useState,
	useMemo,
	useContext,
	createContext,
} from "react";
import { Box, BoxProps } from "@/components/Box/Box";
import {
	DynamicKeyframe,
	createAnimatedProperties,
} from "./createAnimationFrames";
import { useChonkit } from "@/core/ChonkitProvider/ChonkitProvider";
import { animationManager } from "./createAnimationManager";

/**
 * RouteTransitionContext allows apps to signal when route/navigation transitions are happening.
 * When provided and isTransitioning is true, AnimatedBox will skip enter animations.
 * This prevents animation cascades when navigating between pages with many animated components.
 */
export const RouteTransitionContext = createContext<{
	isTransitioning: boolean;
} | null>(null);

// Build keyframe string from array
function buildKeyframeString(frames: DynamicKeyframe[]) {
	return frames
		.map(({ percent, styles }) => `${percent}% { ${styles} }`)
		.join(" ");
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
	stepRateHz?: number; // optional global tick rate to stair-step properties
	onBeforeStart?: () => void;
	onAfterEnd?: () => void;
};

/**
 * Serialize animation config to a stable string for dependency comparison.
 * This ensures effects only re-run when animation values actually change,
 * not just when the parent re-renders with a new object reference.
 */
function serializeAnimationPhase(
	phase: AnimationPhaseConfig | undefined
): string {
	if (!phase) return "";
	// Only serialize the meaningful parts (not callbacks)
	return JSON.stringify({
		frames: phase.frames,
		from: phase.from,
		to: phase.to,
		duration: phase.duration,
		delay: phase.delay,
		easing: phase.easing,
	});
}

/**
 * AnimatedBox supports three types of animations:
 * - enter: Plays when the component mounts (isVisible becomes true)
 * - exit: Plays when the component unmounts (isVisible becomes false)
 * - transition: Plays when the trigger value changes during the component's lifespan
 */
type AnimatedBoxProps = {
	animation?: {
		enter?: AnimationPhaseConfig;
		exit?: AnimationPhaseConfig;
		transition?: AnimationPhaseConfig & {
			trigger?: any; // Value that triggers the transition animation
		};
	};
	baseProps?: BoxProps;
	isVisible?: boolean;
	children?: React.ReactNode;
	skipEnterAnimation?: boolean; // Explicitly skip enter animation (useful as escape hatch)
};

export const AnimatedBox: React.FC<AnimatedBoxProps> = ({
	animation,
	baseProps,
	isVisible = true,
	children,
	skipEnterAnimation: explicitSkipEnterAnimation,
}) => {
	const ref = useRef<HTMLDivElement>(null);
	const [shouldRender, setShouldRender] = useState(isVisible);
	const { blockSize, stepRateHz: globalStepRateHz } = useChonkit();
	const routeTransition = useContext(RouteTransitionContext);

	const currentAnimationRef = useRef<"enter" | "exit" | "transition" | null>(
		null
	);
	const previousTriggerRef = useRef<any>(animation?.transition?.trigger);
	const cachedKeyframeStringsRef = useRef<string[]>([]);
	// Track if we've already decided to skip/play on mount - don't change the decision
	const animationDecisionMadeRef = useRef(false);
	const lastVisibleStateRef = useRef(isVisible);
	const hasEverBeenVisibleRef = useRef(false); // Always start as false, set to true only after first visibility

	// Capture the skip decision once per visibility transition
	const shouldSkipEnterDecision = useMemo(() => {
		// Only skip on the very first time the component becomes visible (during route transition)
		// After that, always allow animations
		if (hasEverBeenVisibleRef.current) {
			return false; // Component was visible before, always animate now
		}

		return (
			explicitSkipEnterAnimation ||
			routeTransition?.isTransitioning ||
			false
		);
	}, [explicitSkipEnterAnimation, routeTransition?.isTransitioning, isVisible]);

	// Memoize serialized animation configs to avoid re-running effects
	// when parent re-renders with new object references
	const serializedEnterPhase = useMemo(
		() => serializeAnimationPhase(animation?.enter),
		[animation?.enter]
	);
	const serializedExitPhase = useMemo(
		() => serializeAnimationPhase(animation?.exit),
		[animation?.exit]
	);
	const serializedTransitionPhase = useMemo(
		() => serializeAnimationPhase(animation?.transition),
		[animation?.transition]
	);

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

		// Track the first time component becomes visible
		if (isVisible && !hasEverBeenVisibleRef.current) {
			hasEverBeenVisibleRef.current = true;
		}

		// Reset decision when visibility changes
		if (isVisible && lastVisibleStateRef.current !== isVisible) {
			animationDecisionMadeRef.current = false;
		}
		lastVisibleStateRef.current = isVisible;

		// Only check skip flag on initial animation decision
		if (!animationDecisionMadeRef.current) {
			animationDecisionMadeRef.current = true;
		}

		// Skip enter animation if we decided to skip
		if (isVisible && shouldSkipEnterDecision) {
			// Apply final animation values to prevent stuck state
			const enterPhase = animation.enter;
			if (enterPhase?.to) {
				// Apply the "to" styles directly
				Object.entries(enterPhase.to).forEach(([key, value]) => {
					if (key === "xBlocks" || key === "yBlocks") {
						// Skip computed transform properties
						return;
					}
					if (
						typeof value === "number" ||
						typeof value === "string"
					) {
						(el.style as any)[key] = value;
					}
				});

				// Handle xBlocks/yBlocks transforms
				const { xBlocks = 0, yBlocks = 0 } = enterPhase.to;
				if (xBlocks !== 0 || yBlocks !== 0) {
					const xPx = xBlocks * blockSize;
					const yPx = yBlocks * blockSize;
					el.style.transform = `translate(${xPx}px, ${yPx}px)`;
				}
			}
			enterPhase?.onAfterEnd?.();
			return;
		}

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
			const effectiveStepRateHz = phase.stepRateHz ?? globalStepRateHz;
			frames = createAnimatedProperties({
				from,
				to,
				blockSize,
				easing,
				durationMs: duration,
				stepRateHz: effectiveStepRateHz,
			});
		}

		const keyframeString = buildKeyframeString(frames);
		const keyframeName = animationManager.cacheKeyframes(keyframeString);
		cachedKeyframeStringsRef.current.push(keyframeString);

		// Track the current animation phase
		currentAnimationRef.current = isVisible ? "enter" : "exit";

		// Reset animation state before applying new one
		el.style.animation = "none";
		void el.offsetHeight; // Force reflow

		// Use linear timing since easing is already baked into keyframe positions
		el.style.animation = `${keyframeName} ${duration}ms linear ${delay}ms forwards`;

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
			// Release cached keyframes when animation ends
			cachedKeyframeStringsRef.current.forEach((keyframeString) => {
				animationManager.releaseKeyframes(keyframeString);
			});
			cachedKeyframeStringsRef.current = [];
		};
	}, [
		serializedEnterPhase,
		serializedExitPhase,
		isVisible,
		shouldRender,
		blockSize,
		globalStepRateHz,
	]);

	// Handle transition animations triggered by value changes
	useEffect(() => {
		const el = ref.current;
		if (!el || !animation?.transition) return;

		const { trigger } = animation.transition;

		// Check if trigger has changed (skip on initial mount)
		if (
			previousTriggerRef.current === trigger ||
			previousTriggerRef.current === undefined
		) {
			previousTriggerRef.current = trigger;
			return;
		}

		previousTriggerRef.current = trigger;

		const {
			frames: rawFrames,
			from,
			to,
			duration = 500,
			delay = 0,
			easing = "ease",
			onBeforeStart,
			onAfterEnd,
		} = animation.transition;

		onBeforeStart?.();

		let frames: DynamicKeyframe[] = rawFrames || [];
		if (from && to) {
			const effectiveStepRateHz =
				animation.transition.stepRateHz ?? globalStepRateHz;
			frames = createAnimatedProperties({
				from,
				to,
				blockSize,
				easing,
				durationMs: duration,
				stepRateHz: effectiveStepRateHz,
			});
		}

		const keyframeString = buildKeyframeString(frames);
		const keyframeName = animationManager.cacheKeyframes(keyframeString);
		cachedKeyframeStringsRef.current.push(keyframeString);

		// Track the current animation phase
		currentAnimationRef.current = "transition";

		// Reset animation state before applying new one
		el.style.animation = "none";
		void el.offsetHeight; // Force reflow

		// Use linear timing since easing is already baked into keyframe positions
		el.style.animation = `${keyframeName} ${duration}ms linear ${delay}ms forwards`;

		const handleEnd = () => {
			// Ensure this is still the correct animation phase
			if (currentAnimationRef.current === "transition") {
				onAfterEnd?.();
			}
			el.removeEventListener("animationend", handleEnd);
		};

		el.addEventListener("animationend", handleEnd);

		// Cleanup
		return () => {
			el.removeEventListener("animationend", handleEnd);
			// Release cached keyframes when animation ends
			cachedKeyframeStringsRef.current.forEach((keyframeString) => {
				animationManager.releaseKeyframes(keyframeString);
			});
			cachedKeyframeStringsRef.current = [];
		};
	}, [
		animation?.transition?.trigger,
		serializedTransitionPhase,
		blockSize,
		globalStepRateHz,
	]);

	if (!shouldRender) return null;

	return (
		<Box ref={ref} {...baseProps}>
			{children}
		</Box>
	);
};
