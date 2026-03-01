import { Box, BoxProps } from "@/components/Box/Box";
import { useChonkit } from "@/core/ChonkitProvider/ChonkitProvider";
import React, {
	createContext,
	useContext,
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import {
	DynamicKeyframe,
	createAnimatedProperties,
	toCSSTimingFunction,
} from "./createAnimationFrames";
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
 * Compute inline styles from animation phase values (from/to).
 * Handles both regular CSS properties and block-based/pixel-based transforms.
 */
function computeAnimationStyles(
	values: Record<string, any> | undefined,
	blockSize: number
): React.CSSProperties {
	if (!values) return {};

	const styles: React.CSSProperties = {};

	// Apply regular CSS properties
	Object.entries(values).forEach(([key, value]) => {
		if (
			key === "xBlocks" ||
			key === "yBlocks" ||
			key === "x" ||
			key === "y"
		) {
			// Skip - will handle transforms separately
			return;
		}
		if (typeof value === "number" || typeof value === "string") {
			(styles as any)[key] = value;
		}
	});

	// Handle xBlocks/yBlocks/x/y transforms
	let xPx = 0;
	let yPx = 0;

	if (values.xBlocks !== undefined) {
		xPx = values.xBlocks * blockSize;
	} else if (values.x !== undefined) {
		xPx = parseFloat(String(values.x));
	}

	if (values.yBlocks !== undefined) {
		yPx = values.yBlocks * blockSize;
	} else if (values.y !== undefined) {
		yPx = parseFloat(String(values.y));
	}

	// Always set transform if any position values were specified, even if result is 0
	if (
		values.xBlocks !== undefined ||
		values.yBlocks !== undefined ||
		values.x !== undefined ||
		values.y !== undefined
	) {
		styles.transform = `translate(${xPx}px, ${yPx}px)`;
	}

	return styles;
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
		loop?: AnimationPhaseConfig;
	};
	baseProps?: BoxProps;
	isVisible?: boolean;
	children?: React.ReactNode;
	skipEnterAnimation?: boolean; // Explicitly skip enter animation (useful as escape hatch)
	animateDuringRouteTransition?: boolean; // If true, always animate even during route transitions
};

export const AnimatedBox: React.FC<AnimatedBoxProps> = ({
	animation,
	baseProps,
	isVisible = true,
	children,
	skipEnterAnimation: explicitSkipEnterAnimation,
	animateDuringRouteTransition = false,
}) => {
	const ref = useRef<HTMLDivElement>(null);
	const [shouldRender, setShouldRender] = useState(isVisible);
	const {
		blockSize,
		stepRateHz: globalStepRateHz,
		disableAnimationBlockSnapping,
	} = useChonkit();
	const routeTransition = useContext(RouteTransitionContext);

	const currentAnimationRef = useRef<
		"enter" | "exit" | "transition" | "loop" | null
	>(null);
	const pendingAnimationCompleteRef = useRef<(() => void) | null>(null);
	const previousTriggerRef = useRef<any>(animation?.transition?.trigger);
	// Track if we've already decided to skip/play on mount - don't change the decision
	const animationDecisionMadeRef = useRef(false);
	const lastVisibleStateRef = useRef(isVisible);
	const hasEverBeenVisibleRef = useRef(false); // Always start as false, set to true only after first visibility
	// Track persistent inline styles from completed animations
	const persistentStylesRef = useRef<React.CSSProperties>({});
	const loopKeyframeStringRef = useRef<string | null>(null);
	const loopAnimationNameRef = useRef<string | null>(null);
	const loopActiveRef = useRef(false);

	// Capture the skip decision once per visibility transition
	const shouldSkipEnterDecision = useMemo(() => {
		// Only skip on the very first time the component becomes visible (during route transition)
		// After that, always allow animations
		if (hasEverBeenVisibleRef.current) {
			return false; // Component was visible before, always animate now
		}

		return (
			explicitSkipEnterAnimation ||
			(routeTransition?.isTransitioning &&
				!animateDuringRouteTransition) ||
			false
		);
	}, [
		explicitSkipEnterAnimation,
		routeTransition?.isTransitioning,
		isVisible,
	]);

	// Apply initial "from" styles synchronously on first layout to prevent flash
	useLayoutEffect(() => {
		const el = ref.current;
		if (
			!el ||
			!animation?.enter?.from ||
			shouldSkipEnterDecision ||
			hasEverBeenVisibleRef.current
		) {
			return;
		}

		const styles = computeAnimationStyles(animation.enter.from, blockSize);
		Object.entries(styles).forEach(([key, value]) => {
			(el.style as any)[key] = value;
		});
	}, [animation?.enter?.from, shouldSkipEnterDecision, blockSize]);

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
	const serializedLoopPhase = useMemo(
		() => serializeAnimationPhase(animation?.loop),
		[animation?.loop]
	);

	const stopLoopAnimation = (el: HTMLDivElement) => {
		if (!loopActiveRef.current) return;

		const loopAnimationName = loopAnimationNameRef.current;
		if (
			loopAnimationName &&
			el.style.animation.includes(loopAnimationName)
		) {
			el.style.animation = "";
		}

		if (loopKeyframeStringRef.current) {
			animationManager.releaseKeyframes(loopKeyframeStringRef.current);
		}

		loopKeyframeStringRef.current = null;
		loopAnimationNameRef.current = null;
		loopActiveRef.current = false;
	};

	const startLoopAnimation = (
		el: HTMLDivElement,
		phase: AnimationPhaseConfig
	) => {
		stopLoopAnimation(el);

		const {
			frames: rawFrames,
			from,
			to,
			duration = 500,
			delay = 0,
			easing = "ease",
		} = phase;
		const timingFunction =
			disableAnimationBlockSnapping &&
			(phase.stepRateHz ?? globalStepRateHz) === Infinity
				? toCSSTimingFunction(easing)
				: "linear";

		let frames: DynamicKeyframe[] = rawFrames || [];
		if (from && to) {
			const effectiveStepRateHz = phase.stepRateHz ?? globalStepRateHz;
			const forwardFrames = createAnimatedProperties({
				from,
				to,
				blockSize,
				easing,
				durationMs: duration,
				stepRateHz: effectiveStepRateHz,
				disableAnimationBlockSnapping,
			});
			const backwardFrames = createAnimatedProperties({
				from: to,
				to: from,
				blockSize,
				easing,
				durationMs: duration,
				stepRateHz: effectiveStepRateHz,
				disableAnimationBlockSnapping,
			});

			frames = [
				...forwardFrames.map((frame) => ({
					...frame,
					percent: frame.percent * 0.5,
				})),
				...backwardFrames.map((frame) => ({
					...frame,
					percent: 50 + frame.percent * 0.5,
				})),
			];
		}

		const keyframeString = buildKeyframeString(frames);
		const keyframeName = animationManager.cacheKeyframes(keyframeString);
		loopKeyframeStringRef.current = keyframeString;
		loopAnimationNameRef.current = keyframeName;
		loopActiveRef.current = true;

		if (from) {
			const fromStyles = computeAnimationStyles(from, blockSize);
			const mergedStyles = {
				...persistentStylesRef.current,
				...fromStyles,
			};
			Object.entries(mergedStyles).forEach(([key, value]) => {
				if (value !== undefined) {
					(el.style as any)[key] = value;
				}
			});
		}

		el.style.animation = "none";
		void el.offsetHeight; // Force reflow

		const animationValue = [
			keyframeName,
			`${duration}ms`,
			timingFunction,
			`${delay}ms`,
			"infinite",
			"both",
		].join(" ");
		el.style.animation = animationValue;
		currentAnimationRef.current = "loop";
	};

	// Mount or unmount based on isVisible
	useEffect(() => {
		if (isVisible && !shouldRender) {
			setShouldRender(true);
		}
	}, [isVisible, shouldRender]);

	// Handle animations when shouldRender changes
	useLayoutEffect(() => {
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
				const styles = computeAnimationStyles(enterPhase.to, blockSize);
				Object.entries(styles).forEach(([key, value]) => {
					(el.style as any)[key] = value;
				});
				persistentStylesRef.current = {
					...persistentStylesRef.current,
					...styles,
				};
			}
			enterPhase?.onAfterEnd?.();
			if (animation.loop) {
				startLoopAnimation(el, animation.loop);
			} else {
				currentAnimationRef.current = null;
			}
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
		const timingFunction =
			disableAnimationBlockSnapping &&
			(phase.stepRateHz ?? globalStepRateHz) === Infinity
				? toCSSTimingFunction(easing)
				: "linear";

		onBeforeStart?.();

		const keyframeStrings: string[] = [];
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
				disableAnimationBlockSnapping,
			});

			// Apply "from" styles directly to ensure they're visible during animation delay
			Object.entries(from).forEach(([key, value]) => {
				if (
					key === "xBlocks" ||
					key === "yBlocks" ||
					key === "x" ||
					key === "y"
				) {
					// Skip - will be handled by animation
					return;
				}
				if (typeof value === "number" || typeof value === "string") {
					(el.style as any)[key] = value;
				}
			});

			// Handle xBlocks/yBlocks/x/y transforms
			let xPx = 0;
			let yPx = 0;

			if (from.xBlocks !== undefined) {
				xPx = from.xBlocks * blockSize;
			} else if (from.x !== undefined) {
				xPx = parseFloat(String(from.x));
			}

			if (from.yBlocks !== undefined) {
				yPx = from.yBlocks * blockSize;
			} else if (from.y !== undefined) {
				yPx = parseFloat(String(from.y));
			}

			if (xPx !== 0 || yPx !== 0) {
				el.style.transform = `translate(${xPx}px, ${yPx}px)`;
			}
		}

		const keyframeString = buildKeyframeString(frames);
		const keyframeName = animationManager.cacheKeyframes(keyframeString);
		keyframeStrings.push(keyframeString);

		// Track the current animation phase
		currentAnimationRef.current = isVisible ? "enter" : "exit";

		if (!isVisible) {
			stopLoopAnimation(el);
		}

		// Reset animation state before applying new one
		el.style.animation = "none";
		void el.offsetHeight; // Force reflow

		// Use linear timing since easing is already baked into keyframe positions
		el.style.animation = `${keyframeName} ${duration}ms ${timingFunction} ${delay}ms forwards`;

		const handleEnd = () => {
			// Ensure this is still the correct animation phase
			if (
				currentAnimationRef.current === (isVisible ? "enter" : "exit")
			) {
				onAfterEnd?.();
				if (!isVisible) {
					setShouldRender(false); // Unmount after exit completes
				}

				// Apply "to" styles as inline styles so element stays at final position
				const finalStyles = computeAnimationStyles(
					to || from,
					blockSize
				);
				Object.entries(finalStyles).forEach(([key, value]) => {
					if (value !== undefined) {
						(el.style as any)[key] = value;
					}
				});

				// Save these styles so they persist across future transitions
				persistentStylesRef.current = {
					...persistentStylesRef.current,
					...finalStyles,
				};

				if (isVisible && animation.loop) {
					startLoopAnimation(el, animation.loop);
				} else {
					currentAnimationRef.current = null;
				}
			}
			pendingAnimationCompleteRef.current = null;
			el.removeEventListener("animationend", handleEnd);
		};

		// Store the completion handler so it can be manually triggered if a transition starts
		pendingAnimationCompleteRef.current = handleEnd;

		el.addEventListener("animationend", handleEnd);

		// Cleanup
		return () => {
			if (
				currentAnimationRef.current === "enter" ||
				currentAnimationRef.current === "exit"
			) {
				el.style.animation = "";
				currentAnimationRef.current = null;
			}
			el.removeEventListener("animationend", handleEnd);
			// Release cached keyframes when animation ends
			keyframeStrings.forEach((keyframeString) => {
				animationManager.releaseKeyframes(keyframeString);
			});
		};
	}, [
		serializedEnterPhase,
		serializedExitPhase,
		isVisible,
		shouldRender,
		blockSize,
		globalStepRateHz,
		disableAnimationBlockSnapping,
	]);

	// Handle transition animations triggered by value changes
	useLayoutEffect(() => {
		const el = ref.current;
		if (!el || !animation?.transition) return;

		const { trigger } = animation.transition;
		const normalizedTrigger =
			trigger === undefined ? undefined : String(trigger);

		// Check if trigger has changed (skip on initial mount)
		if (
			previousTriggerRef.current === normalizedTrigger ||
			previousTriggerRef.current === undefined
		) {
			previousTriggerRef.current = normalizedTrigger;
			return;
		}

		previousTriggerRef.current = normalizedTrigger;

		// If an enter or exit animation is still pending, force-complete it first
		// This ensures its final styles are applied before the transition starts
		if (pendingAnimationCompleteRef.current) {
			pendingAnimationCompleteRef.current();
			pendingAnimationCompleteRef.current = null;
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
		} = animation.transition;
		const timingFunction =
			disableAnimationBlockSnapping &&
			(animation.transition.stepRateHz ?? globalStepRateHz) === Infinity
				? toCSSTimingFunction(easing)
				: "linear";

		stopLoopAnimation(el);

		onBeforeStart?.();

		const keyframeStrings: string[] = [];
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
				disableAnimationBlockSnapping,
			});
		}

		const keyframeString = buildKeyframeString(frames);
		const keyframeName = animationManager.cacheKeyframes(keyframeString);
		keyframeStrings.push(keyframeString);

		// Track the current animation phase
		currentAnimationRef.current = "transition";

		// Apply "from" styles synchronously BEFORE clearing animation
		// Merge with persistent styles from previous animations to preserve enter animation state
		const fromStyles = computeAnimationStyles(from, blockSize);
		const mergedStyles = {
			...persistentStylesRef.current,
			...fromStyles,
		};
		Object.entries(mergedStyles).forEach(([key, value]) => {
			if (value !== undefined) {
				(el.style as any)[key] = value;
			}
		});

		// Reset animation state AFTER applying from styles
		el.style.animation = "none";
		void el.offsetHeight; // Force reflow

		// Use linear timing since easing is already baked into keyframe positions
		el.style.animation = `${keyframeName} ${duration}ms ${timingFunction} ${delay}ms forwards`;

		const handleEnd = () => {
			// Ensure this is still the correct animation phase
			if (currentAnimationRef.current === "transition") {
				onAfterEnd?.();

				// Apply "to" styles as inline styles so element stays at final position
				const toStyles = computeAnimationStyles(to, blockSize);
				const mergedStyles = {
					...persistentStylesRef.current,
					...toStyles,
				};
				Object.entries(mergedStyles).forEach(([key, value]) => {
					if (value !== undefined) {
						(el.style as any)[key] = value;
					}
				});

				// Update persistent styles with the new final state
				persistentStylesRef.current = mergedStyles;

				if (animation.loop) {
					startLoopAnimation(el, animation.loop);
				} else {
					currentAnimationRef.current = null;
				}
			}
			el.removeEventListener("animationend", handleEnd);
		};

		el.addEventListener("animationend", handleEnd);

		// Cleanup
		return () => {
			el.removeEventListener("animationend", handleEnd);
			// Release cached keyframes when animation ends
			keyframeStrings.forEach((keyframeString) => {
				animationManager.releaseKeyframes(keyframeString);
			});
		};
	}, [
		animation?.transition?.trigger,
		blockSize,
		globalStepRateHz,
		disableAnimationBlockSnapping,
	]);

	useLayoutEffect(() => {
		const el = ref.current;
		if (!el) return;
		if (!animation?.loop || !isVisible || !shouldRender) {
			stopLoopAnimation(el);
		} else if (
			currentAnimationRef.current !== "enter" &&
			currentAnimationRef.current !== "exit" &&
			currentAnimationRef.current !== "transition" &&
			!loopActiveRef.current
		) {
			startLoopAnimation(el, animation.loop);
		}
		return () => {
			stopLoopAnimation(el);
		};
	}, [
		serializedLoopPhase,
		isVisible,
		shouldRender,
		blockSize,
		globalStepRateHz,
		disableAnimationBlockSnapping,
	]);

	if (!shouldRender) return null;

	return (
		<Box ref={ref} {...baseProps} sx={{ ...baseProps?.sx }}>
			{children}
		</Box>
	);
};
