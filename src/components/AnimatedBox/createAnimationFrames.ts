import BezierEasing from "bezier-easing";

export type DynamicKeyframe = {
	percent: number;
	styles: string;
};

/**
 * Property configuration for animation
 * - blockBased: true for properties that are measured in block units (xBlocks, yBlocks)
 *   and should be converted to transform: translate
 * - cssProperty: the CSS property name to animate (width, height, opacity, etc.)
 *   or null for block-based properties that use transform
 */
type PropertyConfig = {
	blockBased?: boolean;
	cssProperty?: string;
	transformType?: "translateX" | "translateY"; // for block-based properties
};

type AnimationProperty = {
	from: number | string;
	to: number | string;
	config: PropertyConfig;
};

type createAnimationTranslationFramesOptions = {
	from: {
		xBlocks?: number;
		yBlocks?: number;
	};
	to: {
		xBlocks?: number;
		yBlocks?: number;
	};
	blockSize: number;
	startPercent?: number;
	endPercent?: number;
	easing?: string;
};

// Manual steps() function generator
function steps(n: number, end: "start" | "end" = "end") {
	return function (t: number) {
		const step = end === "start" ? Math.floor(t * n) : Math.ceil(t * n - 1);
		return Math.max(0, Math.min(1, step / n)); // clamp between 0 and 1
	};
}

// Map of standard CSS timing keywords to cubic-bezier equivalents
const cssTimingMap: Record<string, [number, number, number, number]> = {
	linear: [0, 0, 1, 1],
	ease: [0.25, 0.1, 0.25, 1],
	"ease-in": [0.42, 0, 1, 1],
	"ease-out": [0, 0, 0.58, 1],
	"ease-in-out": [0.42, 0, 0.58, 1],
};

// Main parsing function
export function parseCSSTimingFunction(timing: string): (t: number) => number {
	timing = timing.trim();

	// Handle standard keywords
	if (cssTimingMap[timing]) {
		const [x1, y1, x2, y2] = cssTimingMap[timing];
		return BezierEasing(x1, y1, x2, y2);
	}

	// Handle cubic-bezier()
	const bezierMatch = timing.match(/cubic-bezier\(([^)]+)\)/i);
	if (bezierMatch) {
		const points = bezierMatch[1]
			.split(",")
			.map((v) => parseFloat(v.trim()));
		if (points.length === 4 && points.every((n) => !isNaN(n))) {
			return BezierEasing(points[0], points[1], points[2], points[3]);
		}
	}

	// Handle steps()
	const stepsMatch = timing.match(/steps\((\d+),?\s*(start|end)?\)/i);
	if (stepsMatch) {
		const n = parseInt(stepsMatch[1], 10);
		const end = (stepsMatch[2] || "end").toLowerCase() as "start" | "end";
		return steps(n, end);
	}

	// Default fallback
	console.warn(
		`Unknown timing function: "${timing}". Falling back to linear.`
	);
	return (t: number) => t; // linear fallback
}

export const mergeTransformValues = (...transformValues: string[]): string => {
	const transformMap: Record<string, string> = {};

	transformValues.forEach((transform) => {
		// Parse transform functions like "translateX(100px)" or "scale(1.5)"
		const functionMatch = transform.match(/(\w+)\(([^)]+)\)/g);
		if (functionMatch) {
			functionMatch.forEach((func) => {
				const [, name, value] = func.match(/(\w+)\(([^)]+)\)/) || [];
				if (name && value) {
					transformMap[name] = value;
				}
			});
		}
	});

	return Object.entries(transformMap)
		.map(([key, value]) => `${key}(${value})`)
		.join(" ");
};

export const mergeKeyframeStyle = (style: string): string => {
	const styleMap: Record<string, string> = {};
	const styles = style.split(";").map((s) => s.trim());
	styles.forEach((s) => {
		if (s) {
			const [key, value] = s.split(":").map((s) => s.trim());
			if (key && value) {
				if (key === "transform" && styleMap[key]) {
					styleMap[key] = mergeTransformValues(styleMap[key], value);
				} else {
					styleMap[key] = value;
				}
			}
		}
	});
	return Object.entries(styleMap)
		.map(([key, value]) => `${key}: ${value};`)
		.join(" ");
};

export const mergeAnimationFrames = (
	frames: DynamicKeyframe[]
): DynamicKeyframe[] => {
	const mergedFrames: DynamicKeyframe[] = [];
	const frameMap: Record<number, DynamicKeyframe> = {};
	frames.forEach(({ percent, styles }) => {
		if (frameMap[percent]) {
			frameMap[percent].styles = mergeKeyframeStyle(
				`${frameMap[percent].styles} ${styles}`
			);
		} else {
			frameMap[percent] = { percent, styles };
		}
	});
	Object.values(frameMap).forEach((frame) => {
		mergedFrames.push(frame);
	});
	mergedFrames.sort((a, b) => a.percent - b.percent);
	return mergedFrames;
};

export const insertSteppedAnimationFrames = (
	frames: DynamicKeyframe[]
): DynamicKeyframe[] => {
	if (frames.length < 2) return frames;
	const steppedFrames: DynamicKeyframe[] = [];
	frames.forEach((frame, index) => {
		if (index === frames.length - 1) return;
		steppedFrames.push(frame);
		const nextFrame = frames[index + 1];
		steppedFrames.push({
			percent: nextFrame.percent - 0.01,
			styles: frame.styles,
		});
	});
	steppedFrames.push(frames[frames.length - 1]);
	return steppedFrames;
};

export const createAnimationTranslationFrames = ({
	from: { xBlocks: fromXBlocks = 0, yBlocks: fromYBlocks = 0 },
	to: { xBlocks: toXBlocks = 0, yBlocks: toYBlocks = 0 },
	blockSize,
	startPercent = 0,
	endPercent = 100,
	easing = "ease-in-out",
}: createAnimationTranslationFramesOptions) => {
	const frames: DynamicKeyframe[] = [];

	// Calculate the total number of blocks in both directions
	const totalXBlocks = Math.abs(toXBlocks - fromXBlocks);
	const totalYBlocks = Math.abs(toYBlocks - fromYBlocks);

	// Determine direction for each axis
	const xDirection = toXBlocks >= fromXBlocks ? 1 : -1;
	const yDirection = toYBlocks >= fromYBlocks ? 1 : -1;

	// Calculate the percentage increment for each block
	const xPercentIncrement = totalXBlocks > 0 ? 1 / totalXBlocks : 0;
	const yPercentIncrement = totalYBlocks > 0 ? 1 / totalYBlocks : 0;

	const timingFunction = parseCSSTimingFunction(easing);

	// Generate keyframes for translation in the x direction
	if (totalXBlocks > 0) {
		for (let i = 0; i <= totalXBlocks; i++) {
			const easedProgress = timingFunction(i * xPercentIncrement);
			const percent =
				startPercent + easedProgress * (endPercent - startPercent);
			const translateX = (fromXBlocks + i * xDirection) * blockSize;
			frames.push({
				percent,
				styles: `transform: translateX(${translateX}px);`,
			});
		}
	}

	// Generate keyframes for translation in the y direction
	if (totalYBlocks > 0) {
		for (let j = 0; j <= totalYBlocks; j++) {
			const easedProgress = timingFunction(j * yPercentIncrement);
			const percent =
				startPercent + easedProgress * (endPercent - startPercent);
			const translateY = (fromYBlocks + j * yDirection) * blockSize;
			frames.push({
				percent,
				styles: `transform: translateY(${translateY}px);`,
			});
		}
	}

	return insertSteppedAnimationFrames(mergeAnimationFrames(frames));
};

export type createAnimationPropertyFramesOptions = {
	property: string;
	from: string | number;
	to: string | number;
	blockSize: number;
	isBlockBased?: boolean; // true for xBlocks/yBlocks, converts to transform: translateX/Y
	startPercent?: number;
	endPercent?: number;
	easing?: string;
	sharedSteps?: number; // Shared timing reference across all properties
};

/**
 * Unified keyframe generator for all animation properties
 * - Block-based properties (xBlocks, yBlocks): Converted to transform: translateX/Y with block-size stepping
 * - Pixel-based CSS properties (width, height): Stepped by blockSize increments
 * - Unitless CSS properties (opacity, z-index): Simple start/end keyframes
 * - sharedSteps: When provided, synchronizes all properties to the same timing base
 */
export const createAnimationPropertyFrames = ({
	property,
	from,
	to,
	blockSize,
	isBlockBased = false,
	startPercent = 0,
	endPercent = 100,
	easing = "ease-in-out",
	sharedSteps,
}: createAnimationPropertyFramesOptions) => {
	const frames: DynamicKeyframe[] = [];

	// Parse numeric values
	const fromNum = parseFloat(String(from));
	const toNum = parseFloat(String(to));

	// If values aren't numeric, generate simple start/end keyframes
	if (isNaN(fromNum) || isNaN(toNum)) {
		return [
			{ percent: startPercent, styles: `${property}: ${from};` },
			{ percent: endPercent, styles: `${property}: ${to};` },
		];
	}

	const timingFunction = parseCSSTimingFunction(easing);

	// For block-based properties (xBlocks, yBlocks), generate stepped translation frames
	if (isBlockBased) {
		const totalBlocks = Math.abs(toNum - fromNum);
		const direction = toNum >= fromNum ? 1 : -1;

		// Use sharedSteps if provided for synchronized animations, otherwise use totalBlocks
		const stepsToUse =
			sharedSteps !== undefined ? sharedSteps : totalBlocks;
		const blockIncrement = stepsToUse > 0 ? totalBlocks / stepsToUse : 0;
		const timeIncrement = stepsToUse > 0 ? 1 / stepsToUse : 0;

		for (let i = 0; i <= stepsToUse; i++) {
			const easedProgress = timingFunction(i * timeIncrement);
			const percent =
				startPercent + easedProgress * (endPercent - startPercent);
			const pixels =
				(fromNum + i * blockIncrement * direction) * blockSize;
			const transformProperty =
				property === "xBlocks" ? "translateX" : "translateY";
			frames.push({
				percent,
				styles: `transform: ${transformProperty}(${pixels}px);`,
			});
		}

		return insertSteppedAnimationFrames(mergeAnimationFrames(frames));
	}

	// Extract unit (e.g., "px" from "100px")
	const fromStr = String(from);
	const unit = fromStr.replace(/[0-9.-]/g, "") || "";

	// For unitless properties (opacity, z-index, etc.), use simple start/end keyframes
	if (!unit || unit === "") {
		return [
			{ percent: startPercent, styles: `${property}: ${fromNum};` },
			{ percent: endPercent, styles: `${property}: ${toNum};` },
		];
	}

	// For pixel-based CSS properties, generate stair-stepped keyframes
	const totalDifference = Math.abs(toNum - fromNum);
	const direction = toNum >= fromNum ? 1 : -1;

	// Use sharedSteps if provided for synchronized animations, otherwise calculate based on blockSize
	const steps =
		sharedSteps !== undefined
			? sharedSteps
			: Math.ceil(totalDifference / blockSize);
	const valueIncrement = steps > 0 ? totalDifference / steps : 0;
	const timeIncrement = steps > 0 ? 1 / steps : 0;

	// Generate keyframes for each step
	for (let i = 0; i <= steps; i++) {
		const easedProgress = timingFunction(i * timeIncrement);
		const percent =
			startPercent + easedProgress * (endPercent - startPercent);
		const value = fromNum + i * valueIncrement * direction;
		frames.push({
			percent,
			styles: `${property}: ${value}${unit};`,
		});
	}

	return insertSteppedAnimationFrames(mergeAnimationFrames(frames));
};

/**
 * Unified animation builder for all animation properties
 * Handles block-based properties (xBlocks, yBlocks) and CSS properties (width, height, opacity, etc.)
 */
export type createAnimatedPropertiesOptions = {
	from: Record<string, any>;
	to: Record<string, any>;
	blockSize: number;
	startPercent?: number;
	endPercent?: number;
	easing?: string;
};

export const createAnimatedProperties = ({
	from,
	to,
	blockSize,
	startPercent = 0,
	endPercent = 100,
	easing = "ease-in-out",
}: createAnimatedPropertiesOptions) => {
	const frames: DynamicKeyframe[] = [];

	// Process all properties uniformly
	const allProperties = Object.entries(from).filter(
		([key]) => key !== "x" && key !== "y" // exclude raw x/y, they're deprecated
	);

	// Calculate the maximum number of steps across all properties
	// This ensures all animations use the same time base, keeping them synchronized
	let maxSteps = 0;
	allProperties.forEach(([key, fromValue]) => {
		const toValue = to[key];
		if (toValue === undefined) return;

		const fromNum = parseFloat(String(fromValue));
		const toNum = parseFloat(String(toValue));

		if (isNaN(fromNum) || isNaN(toNum)) return;

		let steps = 0;
		if (key === "xBlocks" || key === "yBlocks") {
			// Block-based: count blocks
			steps = Math.abs(toNum - fromNum);
		} else {
			// CSS property: extract unit and calculate steps
			const fromStr = String(fromValue);
			const unit = fromStr.replace(/[0-9.-]/g, "") || "";
			if (unit !== "") {
				// Only count steps for properties with units (pixel-based)
				steps = Math.ceil(Math.abs(toNum - fromNum) / blockSize);
			}
		}

		maxSteps = Math.max(maxSteps, steps);
	});

	// Use maxSteps as the shared timing base; if no block-based properties, use a default
	const sharedSteps = maxSteps > 0 ? maxSteps : 1;

	allProperties.forEach(([key, fromValue]) => {
		const toValue = to[key];
		if (toValue === undefined) return;

		// Check if this is a block-based property
		const isBlockBased = key === "xBlocks" || key === "yBlocks";

		const propertyFrames = createAnimationPropertyFrames({
			property: key,
			from: fromValue,
			to: toValue,
			blockSize,
			isBlockBased,
			startPercent,
			endPercent,
			easing,
			sharedSteps, // Pass the maximum steps as a shared timing reference
		});

		frames.push(...propertyFrames);
	});

	return mergeAnimationFrames(frames);
};
