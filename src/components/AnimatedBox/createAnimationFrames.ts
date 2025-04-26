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
};

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
}: createAnimationTranslationFramesOptions) => {
	const frames: DynamicKeyframe[] = [];

	// Calculate the total number of blocks in both directions
	const totalXBlocks = Math.abs(toXBlocks - fromXBlocks);
	const totalYBlocks = Math.abs(toYBlocks - fromYBlocks);

	// Calculate the percentage increment for each block
	const xPercentIncrement = totalXBlocks > 0 ? endPercent / totalXBlocks : 0;
	const yPercentIncrement = totalYBlocks > 0 ? endPercent / totalYBlocks : 0;

	// Generate keyframes for translation in the x direction
	if (totalXBlocks > 0) {
		for (let i = 0; i <= totalXBlocks; i++) {
			const percent = startPercent + i * xPercentIncrement;
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
			const percent = startPercent + j * yPercentIncrement;
			const translateY = (fromYBlocks + j) * blockSize;
			frames.push({
				percent,
				styles: `transform: translateY(${translateY}px);`,
			});
		}
	}

	return insertSteppedAnimationFrames(mergeAnimationFrames(frames));
};
