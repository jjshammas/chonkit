import BezierEasing from "bezier-easing";

export type DynamicKeyframe = {
	percent: number;
	styles: string;
};

// Manual steps() function generator
function steps(n: number, end: "start" | "end" = "end") {
	return function (t: number) {
		const step = end === "start" ? Math.floor(t * n) : Math.ceil(t * n - 1);
		return Math.max(0, Math.min(1, step / n));
	};
}

// Map of standard CSS timing keywords to cubic-bezier equivalents
// Source: https://easings.net (Robert Penner's easing functions)
const cssTimingMap: Record<string, [number, number, number, number]> = {
	linear: [0, 0, 1, 1],
	ease: [0.25, 0.1, 0.25, 1],
	"ease-in": [0.42, 0, 1, 1],
	"ease-out": [0, 0, 0.58, 1],
	"ease-in-out": [0.42, 0, 0.58, 1],
	// Quadratic (x^2)
	"ease-in-quad": [0.55, 0.085, 0.68, 0.53],
	"ease-out-quad": [0.25, 0.46, 0.45, 0.94],
	"ease-in-out-quad": [0.455, 0.03, 0.515, 0.955],
	// Cubic (x^3)
	"ease-in-cubic": [0.55, 0.055, 0.675, 0.19],
	"ease-out-cubic": [0.215, 0.61, 0.355, 1],
	"ease-in-out-cubic": [0.645, 0.045, 0.355, 1],
	// Quartic (x^4)
	"ease-in-quart": [0.895, 0.03, 0.685, 0.22],
	"ease-out-quart": [0.165, 0.84, 0.44, 1],
	"ease-in-out-quart": [0.77, 0, 0.175, 1],
	// Quintic (x^5)
	"ease-in-quint": [0.755, 0.05, 0.855, 0.06],
	"ease-out-quint": [0.23, 1, 0.32, 1],
	"ease-in-out-quint": [0.86, 0, 0.07, 1],
	// Sinusoidal
	"ease-in-sine": [0.47, 0, 0.745, 0.715],
	"ease-out-sine": [0.39, 0.575, 0.565, 1],
	"ease-in-out-sine": [0.445, 0.05, 0.55, 0.95],
	// Exponential
	"ease-in-expo": [0.95, 0.05, 0.795, 0.035],
	"ease-out-expo": [0.19, 1, 0.22, 1],
	"ease-in-out-expo": [1, 0, 0, 1],
	// Circular
	"ease-in-circ": [0.6, 0.04, 0.98, 0.335],
	"ease-out-circ": [0.075, 0.82, 0.165, 1],
	"ease-in-out-circ": [0.785, 0.135, 0.15, 0.86],
};

export function parseCSSTimingFunction(timing: string): (t: number) => number {
	timing = timing.trim();

	// Handle standard keywords
	if (cssTimingMap[timing]) {
		const [x1, y1, x2, y2] = cssTimingMap[timing];
		try {
			return BezierEasing(x1, y1, x2, y2);
		} catch (e) {
			console.warn(`Invalid bezier easing values for ${timing}:`, [
				x1,
				y1,
				x2,
				y2,
			]);
			return (t: number) => t; // linear fallback
		}
	}

	// Handle cubic-bezier()
	const bezierMatch = timing.match(/cubic-bezier\(([^)]+)\)/i);
	if (bezierMatch) {
		const points = bezierMatch[1]
			.split(",")
			.map((v) => parseFloat(v.trim()));
		if (points.length === 4 && points.every((n) => !isNaN(n))) {
			try {
				return BezierEasing(points[0], points[1], points[2], points[3]);
			} catch (e) {
				console.warn(`Invalid cubic-bezier values:`, points);
				return (t: number) => t; // linear fallback
			}
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
	return (t: number) => t; // linear fallback
}

export const mergeTransformValues = (...transformValues: string[]): string => {
	const transformMap: Record<string, string> = {};

	transformValues.forEach((transform) => {
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

export const toCSSTimingFunction = (timing: string): string => {
	const trimmed = timing.trim();
	if (cssTimingMap[trimmed]) {
		const [x1, y1, x2, y2] = cssTimingMap[trimmed];
		return `cubic-bezier(${x1}, ${y1}, ${x2}, ${y2})`;
	}

	if (/^cubic-bezier\(([^)]+)\)$/i.test(trimmed)) return trimmed;
	if (/^steps\((\d+),?\s*(start|end)?\)$/i.test(trimmed)) return trimmed;

	console.warn(
		`Unknown easing "${timing}", falling back to linear.`
	);
	return "linear";
};

const buildStyleString = (
	values: Record<string, any>,
	blockSize: number
): string => {
	const styleMap: Record<string, string> = {};

	Object.entries(values).forEach(([key, value]) => {
		if (
			key === "xBlocks" ||
			key === "yBlocks" ||
			key === "x" ||
			key === "y"
		) {
			return;
		}
		if (typeof value === "number" || typeof value === "string") {
			styleMap[key] = String(value);
		}
	});

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

	if (
		values.xBlocks !== undefined ||
		values.yBlocks !== undefined ||
		values.x !== undefined ||
		values.y !== undefined
	) {
		styleMap.transform = `translate(${xPx}px, ${yPx}px)`;
	}

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
		const delta = nextFrame.percent - frame.percent;
		const epsilon = delta > 0 ? Math.min(0.01, delta / 2) : 0;
		steppedFrames.push({
			percent: nextFrame.percent - epsilon,
			styles: frame.styles,
		});
	});
	steppedFrames.push(frames[frames.length - 1]);
	return steppedFrames;
};

export type createAnimationTranslationFramesOptions = {
	from: { xBlocks?: number; yBlocks?: number };
	to: { xBlocks?: number; yBlocks?: number };
	blockSize: number;
	startPercent?: number;
	endPercent?: number;
	easing?: string;
	disableAnimationBlockSnapping?: boolean;
};

export const createAnimationTranslationFrames = ({
	from: { xBlocks: fromXBlocks = 0, yBlocks: fromYBlocks = 0 },
	to: { xBlocks: toXBlocks = 0, yBlocks: toYBlocks = 0 },
	blockSize,
	startPercent = 0,
	endPercent = 100,
	easing = "ease-in-out",
	disableAnimationBlockSnapping = false,
}: createAnimationTranslationFramesOptions) => {
	const frames: DynamicKeyframe[] = [];

	const totalXBlocks = Math.abs(toXBlocks - fromXBlocks);
	const totalYBlocks = Math.abs(toYBlocks - fromYBlocks);

	const xDirection = toXBlocks >= fromXBlocks ? 1 : -1;
	const yDirection = toYBlocks >= fromYBlocks ? 1 : -1;

	const xPercentIncrement = totalXBlocks > 0 ? 1 / totalXBlocks : 0;
	const yPercentIncrement = totalYBlocks > 0 ? 1 / totalYBlocks : 0;

	const timingFunction = parseCSSTimingFunction(easing);

	if (totalXBlocks > 0) {
		for (let i = 0; i <= totalXBlocks; i++) {
			const linearProgress = i * xPercentIncrement;
			const percent =
				startPercent + linearProgress * (endPercent - startPercent);
			const easedProgress = timingFunction(linearProgress);
			const continuousBlocks =
				fromXBlocks + easedProgress * totalXBlocks * xDirection;
			const quantizedBlocks =
				xDirection >= 0
					? Math.floor(continuousBlocks)
					: Math.ceil(continuousBlocks);
			const translateX = quantizedBlocks * blockSize;
			frames.push({
				percent,
				styles: `transform: translateX(${translateX}px);`,
			});
		}
	}

	if (totalYBlocks > 0) {
		for (let j = 0; j <= totalYBlocks; j++) {
			const linearProgress = j * yPercentIncrement;
			const percent =
				startPercent + linearProgress * (endPercent - startPercent);
			const easedProgress = timingFunction(linearProgress);
			const continuousBlocks =
				fromYBlocks + easedProgress * totalYBlocks * yDirection;
			const quantizedBlocks =
				yDirection >= 0
					? Math.floor(continuousBlocks)
					: Math.ceil(continuousBlocks);
			const translateY = quantizedBlocks * blockSize;
			frames.push({
				percent,
				styles: `transform: translateY(${translateY}px);`,
			});
		}
	}

	const mergedFrames = mergeAnimationFrames(frames);
	if (disableAnimationBlockSnapping) return mergedFrames;
	return insertSteppedAnimationFrames(mergedFrames);
};

export type createAnimationPropertyFramesOptions = {
	property: string;
	from: string | number;
	to: string | number;
	blockSize: number;
	isBlockBased?: boolean;
	startPercent?: number;
	endPercent?: number;
	easing?: string;
	sharedSteps?: number;
	disableAnimationBlockSnapping?: boolean;
};

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
	disableAnimationBlockSnapping = false,
}: createAnimationPropertyFramesOptions) => {
	const frames: DynamicKeyframe[] = [];

	const fromNum = parseFloat(String(from));
	const toNum = parseFloat(String(to));

	if (isNaN(fromNum) || isNaN(toNum)) {
		return [
			{ percent: startPercent, styles: `${property}: ${from};` },
			{ percent: endPercent, styles: `${property}: ${to};` },
		];
	}

	const timingFunction = parseCSSTimingFunction(easing);

	if (isBlockBased) {
		const totalBlocks = Math.abs(toNum - fromNum);
		const direction = toNum >= fromNum ? 1 : -1;

		const stepsToUse =
			sharedSteps !== undefined ? sharedSteps : totalBlocks;
		const timeIncrement = stepsToUse > 0 ? 1 / stepsToUse : 0;

		for (let i = 0; i <= stepsToUse; i++) {
			const linearProgress = i * timeIncrement;
			const percent =
				startPercent + linearProgress * (endPercent - startPercent);
			const easedProgress = timingFunction(linearProgress);

			const continuousBlocks =
				fromNum + easedProgress * totalBlocks * direction;
			let quantizedBlocks: number;
			if (direction >= 0) {
				quantizedBlocks = Math.min(
					toNum,
					Math.max(fromNum, Math.floor(continuousBlocks))
				);
			} else {
				quantizedBlocks = Math.max(
					toNum,
					Math.min(fromNum, Math.ceil(continuousBlocks))
				);
			}

			const pixels = quantizedBlocks * blockSize;
			const transformProperty =
				property === "xBlocks" ? "translateX" : "translateY";
			frames.push({
				percent,
				styles: `transform: ${transformProperty}(${pixels}px);`,
			});
		}

		const mergedFrames = mergeAnimationFrames(frames);
		if (disableAnimationBlockSnapping) return mergedFrames;
		return insertSteppedAnimationFrames(mergedFrames);
	}

	const fromStr = String(from);
	const unit = fromStr.replace(/[0-9.-]/g, "") || "";

	if (!unit || unit === "") {
		const steps = sharedSteps !== undefined ? sharedSteps : 1;
		const timeIncrement = steps > 0 ? 1 / steps : 0;

		for (let i = 0; i <= steps; i++) {
			const linearProgress = i * timeIncrement;
			const percent =
				startPercent + linearProgress * (endPercent - startPercent);
			const easedProgress = timingFunction(linearProgress);
			const value = fromNum + easedProgress * (toNum - fromNum);
			frames.push({ percent, styles: `${property}: ${value};` });
		}

		const mergedFrames = mergeAnimationFrames(frames);
		if (disableAnimationBlockSnapping) return mergedFrames;
		return insertSteppedAnimationFrames(mergedFrames);
	}

	const totalDifference = Math.abs(toNum - fromNum);
	const direction = toNum >= fromNum ? 1 : -1;
	const steps =
		sharedSteps !== undefined
			? sharedSteps
			: Math.ceil(totalDifference / blockSize);
	const timeIncrement = steps > 0 ? 1 / steps : 0;

	for (let i = 0; i <= steps; i++) {
		const linearProgress = i * timeIncrement;
		const percent =
			startPercent + linearProgress * (endPercent - startPercent);
		const easedProgress = timingFunction(linearProgress);
		const continuousValue =
			fromNum + easedProgress * totalDifference * direction;
		const quantizedValue =
			direction >= 0
				? Math.floor(continuousValue / blockSize) * blockSize
				: Math.ceil(continuousValue / blockSize) * blockSize;
		frames.push({
			percent,
			styles: `${property}: ${quantizedValue}${unit};`,
		});
	}

	const mergedFrames = mergeAnimationFrames(frames);
	if (disableAnimationBlockSnapping) return mergedFrames;
	return insertSteppedAnimationFrames(mergedFrames);
};

export type createAnimatedPropertiesOptions = {
	from: Record<string, any>;
	to: Record<string, any>;
	blockSize: number;
	startPercent?: number;
	endPercent?: number;
	easing?: string;
	durationMs?: number;
	stepRateHz?: number;
	disableAnimationBlockSnapping?: boolean;
};

export const createAnimatedProperties = ({
	from,
	to,
	blockSize,
	startPercent = 0,
	endPercent = 100,
	easing = "ease-in-out",
	durationMs,
	stepRateHz,
	disableAnimationBlockSnapping = false,
}: createAnimatedPropertiesOptions) => {
	if (disableAnimationBlockSnapping && stepRateHz === Infinity) {
		const fromStyles = buildStyleString(from, blockSize);
		const toStyles = buildStyleString(to, blockSize);
		return mergeAnimationFrames([
			{
				percent: startPercent,
				styles: mergeKeyframeStyle(fromStyles),
			},
			{
				percent: endPercent,
				styles: mergeKeyframeStyle(toStyles),
			},
		]);
	}
	const frames: DynamicKeyframe[] = [];

	// Convert x/y to xBlocks/yBlocks
	const normalizedFrom = { ...from };
	const normalizedTo = { ...to };

	if (from.x !== undefined && to.x !== undefined) {
		normalizedFrom.xBlocks = parseFloat(String(from.x)) / blockSize;
		normalizedTo.xBlocks = parseFloat(String(to.x)) / blockSize;
		delete normalizedFrom.x;
		delete normalizedTo.x;
	}

	if (from.y !== undefined && to.y !== undefined) {
		normalizedFrom.yBlocks = parseFloat(String(from.y)) / blockSize;
		normalizedTo.yBlocks = parseFloat(String(to.y)) / blockSize;
		delete normalizedFrom.y;
		delete normalizedTo.y;
	}

	const allProperties = Object.entries(normalizedFrom);

	let maxSteps = 0;
	allProperties.forEach(([key, fromValue]) => {
		const toValue = normalizedTo[key];
		if (toValue === undefined) return;

		const fromNum = parseFloat(String(fromValue));
		const toNum = parseFloat(String(toValue));
		if (isNaN(fromNum) || isNaN(toNum)) return;

		let steps = 0;
		if (key === "xBlocks" || key === "yBlocks") {
			steps = Math.abs(toNum - fromNum);
		} else {
			const fromStr = String(fromValue);
			const unit = fromStr.replace(/[0-9.-]/g, "") || "";
			if (unit !== "") {
				steps = Math.ceil(Math.abs(toNum - fromNum) / blockSize);
			} else {
				// For unitless properties (opacity, etc), count them as 1 step minimum
				// so they participate in the Hz-based step calculation
				steps = 1;
			}
		}

		maxSteps = Math.max(maxSteps, steps);
	});

	let hertzSteps: number | undefined;
	if (
		durationMs &&
		stepRateHz !== undefined &&
		Number.isFinite(stepRateHz)
	) {
		hertzSteps = Math.max(1, Math.floor((stepRateHz * durationMs) / 1000));
	}

	const sharedSteps = hertzSteps ?? (maxSteps > 0 ? maxSteps : 1);

	allProperties.forEach(([key, fromValue]) => {
		const toValue = normalizedTo[key];
		if (toValue === undefined) return;

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
			sharedSteps,
			disableAnimationBlockSnapping,
		});

		frames.push(...propertyFrames);
	});

	return mergeAnimationFrames(frames);
};
