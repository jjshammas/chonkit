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
const cssTimingMap: Record<string, [number, number, number, number]> = {
	linear: [0, 0, 1, 1],
	ease: [0.25, 0.1, 0.25, 1],
	"ease-in": [0.42, 0, 1, 1],
	"ease-out": [0, 0, 0.58, 1],
	"ease-in-out": [0.42, 0, 0.58, 1],
};

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

export type createAnimationTranslationFramesOptions = {
	from: { xBlocks?: number; yBlocks?: number };
	to: { xBlocks?: number; yBlocks?: number };
	blockSize: number;
	startPercent?: number;
	endPercent?: number;
	easing?: string;
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

	const totalXBlocks = Math.abs(toXBlocks - fromXBlocks);
	const totalYBlocks = Math.abs(toYBlocks - fromYBlocks);

	const xDirection = toXBlocks >= fromXBlocks ? 1 : -1;
	const yDirection = toYBlocks >= fromYBlocks ? 1 : -1;

	const xPercentIncrement = totalXBlocks > 0 ? 1 / totalXBlocks : 0;
	const yPercentIncrement = totalYBlocks > 0 ? 1 / totalYBlocks : 0;

	const timingFunction = parseCSSTimingFunction(easing);

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
	isBlockBased?: boolean;
	startPercent?: number;
	endPercent?: number;
	easing?: string;
	sharedSteps?: number;
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
			const easedProgress = timingFunction(i * timeIncrement);
			const percent =
				startPercent + easedProgress * (endPercent - startPercent);

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

		return insertSteppedAnimationFrames(mergeAnimationFrames(frames));
	}

	const fromStr = String(from);
	const unit = fromStr.replace(/[0-9.-]/g, "") || "";

	if (!unit || unit === "") {
		const steps = sharedSteps !== undefined ? sharedSteps : 1;
		const valueIncrement = steps > 0 ? (toNum - fromNum) / steps : 0;
		const timeIncrement = steps > 0 ? 1 / steps : 0;

		for (let i = 0; i <= steps; i++) {
			const easedProgress = timingFunction(i * timeIncrement);
			const percent =
				startPercent + easedProgress * (endPercent - startPercent);
			const value = fromNum + i * valueIncrement;
			frames.push({ percent, styles: `${property}: ${value};` });
		}

		return insertSteppedAnimationFrames(mergeAnimationFrames(frames));
	}

	const totalDifference = Math.abs(toNum - fromNum);
	const direction = toNum >= fromNum ? 1 : -1;
	const steps =
		sharedSteps !== undefined
			? sharedSteps
			: Math.ceil(totalDifference / blockSize);
	const valueIncrement = steps > 0 ? totalDifference / steps : 0;
	const timeIncrement = steps > 0 ? 1 / steps : 0;

	for (let i = 0; i <= steps; i++) {
		const easedProgress = timingFunction(i * timeIncrement);
		const percent =
			startPercent + easedProgress * (endPercent - startPercent);
		const value = fromNum + i * valueIncrement * direction;
		frames.push({ percent, styles: `${property}: ${value}${unit};` });
	}

	return insertSteppedAnimationFrames(mergeAnimationFrames(frames));
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
}: createAnimatedPropertiesOptions) => {
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
			}
		}

		maxSteps = Math.max(maxSteps, steps);
	});

	let hertzSteps: number | undefined;
	if (stepRateHz && durationMs) {
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
		});

		frames.push(...propertyFrames);
	});

	return mergeAnimationFrames(frames);
};
