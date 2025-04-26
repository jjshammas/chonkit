import BezierEasing from "bezier-easing";

export type DynamicKeyframe = {
	percent: number;
	styles: string;
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
		const transforms = transform.split(" ").map((t) => t.trim());
		transforms.forEach((t) => {
			const [key, value] = t.split("(");
			if (key && value) {
				transformMap[key] = value;
			}
		});
	});

	return Object.entries(transformMap)
		.map(([key, value]) => `${key}(${value}`)
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
			const translateX = (fromXBlocks + i) * blockSize;
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
			const translateY = (fromYBlocks + j) * blockSize;
			frames.push({
				percent,
				styles: `transform: translateY(${translateY}px);`,
			});
		}
	}

	return insertSteppedAnimationFrames(mergeAnimationFrames(frames));
};
