import { generateDitherPattern } from "./dither-patterns";

const SVG_URL = "http://www.w3.org/2000/svg";

export const removeInvalidCenters = (
	centers: { color: string; center: number }[],
	blockSize: number
): { color: string; center: number }[] => {
	const newCenters: { color: string; center: number }[] = [centers[0]];
	for (let i = 1; i < centers.length; i++) {
		const prevCenter = newCenters[newCenters.length - 1];
		const center = centers[i];
		if (center.center <= prevCenter.center) {
			if (i === centers.length - 1) break;
			const newCenter = prevCenter.center + blockSize;
			if (newCenter >= centers[centers.length - 1].center) continue;
			newCenters.push({
				color: center.color,
				center: newCenter,
			});
		} else {
			newCenters.push(center);
		}
	}
	return newCenters;
};

export const getIndexOfNextKnownCenter = (
	centers: { color: string; center: string | number | null }[],
	index: number
): number => {
	for (let i = index + 1; i < centers.length; i++) {
		if (centers[i].center !== null && centers[i].center !== undefined)
			return i;
	}
	return -1;
};

export const calculateCenters = (
	gradientParts: string[],
	size: number,
	blockSize: number
): { color: string; center: number }[] => {
	const centers = gradientParts.map((part, index) => {
		const [color, position] = part.split(" ").map((p) => p.trim());
		return {
			color,
			center: position
				? position.indexOf("%") !== -1
					? Math.round((parseFloat(position) / 100) * size)
					: parseFloat(position)
				: null,
		};
	});
	if (centers.length === 0) return [];
	if (centers[0].center === null || centers[0].center === undefined)
		centers[0].center = 0;
	if (
		centers[centers.length - 1].center === null ||
		centers[centers.length - 1].center === undefined
	)
		centers[centers.length - 1].center = size;

	for (let i = 1; i < centers.length - 1; i++) {
		const thisStep = centers[i];
		if (thisStep.center !== null && thisStep.center !== undefined) continue;
		const prevStep = centers[i - 1];
		const prevCenter = prevStep.center;
		if (typeof prevCenter !== "number")
			throw new Error(
				"Could not proces gradient. Missing center on previous step (" +
					i +
					")"
			);

		const nextKnownCenterIndex = getIndexOfNextKnownCenter(centers, i);
		if (nextKnownCenterIndex === -1)
			throw new Error(
				"Could not process gradient. Missing center on next known center step (" +
					nextKnownCenterIndex +
					")"
			);
		const nextKnownCenter = centers[nextKnownCenterIndex].center;
		if (nextKnownCenter === null || nextKnownCenter === undefined)
			throw new Error(
				"Could not proces gradient. Missing center on next known center step (" +
					nextKnownCenterIndex +
					")"
			);

		const gapSize = nextKnownCenter - prevCenter;
		const stepSize = gapSize / (nextKnownCenterIndex - i + 1);
		thisStep.center = prevCenter + stepSize * (i - (i - 1));
	}

	for (const center of centers) {
		if (center.center === null || center.center === undefined)
			throw new Error(
				"Could not process gradient. Missing center for color " +
					center.color
			);
		center.center = Math.round(
			Math.round(center.center / blockSize) * blockSize
		);
	}

	return removeInvalidCenters(
		centers as { color: string; center: number }[],
		blockSize
	);
};

function drawTransition(
	transitionHeight: number,
	patternWidthBlocks: number,
	color1: string,
	color2: string,
	blockSize: number
) {
	const g = document.createElementNS(SVG_URL, "g");

	// Generate dither patterns in blocks with size adaptive to transition height
	// Aim for 3-4 distinct dither patterns across the transition for good quality
	let blockRowSize = 8;
	if (transitionHeight < 32)
		blockRowSize = Math.max(2, Math.floor(transitionHeight / 3));
	else if (transitionHeight < 64) blockRowSize = 4;

	const totalIntensitySteps = Math.ceil(transitionHeight / blockRowSize);
	const rects: SVGRectElement[] = [];

	for (let blockRow = 0; blockRow < totalIntensitySteps; blockRow++) {
		const rowStart = blockRow * blockRowSize;
		const rowEnd = Math.min(rowStart + blockRowSize, transitionHeight);
		const rowsInBlock = rowEnd - rowStart;

		// Calculate intensity for this block: start dithering immediately
		// by centering the block intensity in its range position
		const blockIntensity = Math.round(
			((blockRow + 0.5) / totalIntensitySteps) * 255
		);

		// Generate dither pattern - only one tile unit, SVG pattern will handle repetition
		// Determine appropriate Bayer matrix size for the pattern width
		let bayerMatrixSize = 8;
		if (patternWidthBlocks < 4) bayerMatrixSize = 2;
		else if (patternWidthBlocks < 8) bayerMatrixSize = 4;
		else if (patternWidthBlocks >= 16) bayerMatrixSize = 16;
		else if (patternWidthBlocks >= 32) bayerMatrixSize = 32;

		// Generate one repeating tile
		const blockPattern = generateDitherPattern(
			bayerMatrixSize,
			blockRowSize,
			blockIntensity
		);

		// Pre-calculate y position to avoid repeated calculations
		const baseY = rowStart * blockSize;

		for (let row = 0; row < rowsInBlock; row++) {
			const patternRow = blockPattern[row];
			const y = baseY + row * blockSize;
			// Only render the repeating tile unit, not the entire width
			for (let col = 0; col < patternRow.length; col++) {
				const rect = document.createElementNS(SVG_URL, "rect");
				rect.setAttribute("x", col * blockSize + "px");
				rect.setAttribute("y", y + "px");
				rect.setAttribute("width", blockSize + "px");
				rect.setAttribute("height", blockSize + "px");
				rect.setAttribute(
					"fill",
					patternRow[col] === 1 ? color2 : color1
				);
				rects.push(rect);
			}
		}
	}

	// Batch append all rects at once for better performance
	rects.forEach((rect) => g.appendChild(rect));
	return g;
}

export const createGradientSVG = (
	gradientString: string,
	blockSize: number,
	width: number,
	height: number
): SVGElement => {
	const svg = document.createElementNS(SVG_URL, "svg");
	svg.setAttribute("xmlns", SVG_URL);
	svg.setAttribute("shape-rendering", "crispEdges");

	const gradientParts = gradientString.split(",").map((part) => part.trim());
	let direction = parseFloat(gradientParts[0].replace("deg", ""));
	if (
		direction !== 0 &&
		direction !== 90 &&
		direction !== 180 &&
		direction !== 270
	) {
		console.warn("Unsupported gradient direction: " + direction);
		direction = 90;
	}
	const isHorizontal = direction === 0 || direction === 180;

	// svg.setAttribute("width", width.toString());
	svg.setAttribute("width", width + "px");
	svg.setAttribute("height", height + "px");

	const gradientSteps = calculateCenters(
		gradientParts.slice(1),
		isHorizontal ? width : height,
		blockSize
	);
	if (gradientSteps.length === 0) return svg;

	const g = document.createElementNS(SVG_URL, "g");
	g.setAttribute("transform-origin", "0 0");
	if (direction === 0) {
		g.setAttribute("transform", "rotate(-90) translate(-" + height + ",0)");
	} else if (direction === 180) {
		g.setAttribute("transform", "rotate(90) translate(0,-" + width + ")");
	} else if (direction === 270) {
		g.setAttribute(
			"transform",
			"rotate(180) translate(-" + width + ",-" + height + ")"
		);
	}

	const patternWidth = isHorizontal ? height : width;
	const patternHeight = isHorizontal ? width : height;
	const rect = document.createElementNS(SVG_URL, "rect");
	rect.setAttribute("x", "0");
	rect.setAttribute("y", "0");
	rect.setAttribute("width", patternWidth + "px");
	rect.setAttribute("height", patternHeight + "px");
	rect.setAttribute("fill", gradientSteps[0].color);
	g.appendChild(rect);

	for (let i = 1; i < gradientSteps.length; i++) {
		const step = gradientSteps[i];
		const prevStep = gradientSteps[i - 1];

		const transitionMaxSize =
			step.center - (prevStep ? prevStep.center : 0);

		// Guard against invalid transition sizes
		if (transitionMaxSize <= 0) continue;

		const transitionMaxBlocks = Math.max(
			1,
			Math.floor(transitionMaxSize / blockSize)
		);

		// Calculate pattern width in blocks
		const patternWidthBlocks = Math.floor(patternWidth / blockSize);

		// Generate a gradient dither transition where intensity increases from 0 to 255
		const transitionGroup = drawTransition(
			transitionMaxBlocks,
			patternWidthBlocks,
			prevStep.color,
			step.color,
			blockSize
		);

		// Pattern width for the SVG pattern element - use the Bayer matrix tile size
		let bayerMatrixSize = 8;
		if (patternWidthBlocks < 4) bayerMatrixSize = 2;
		else if (patternWidthBlocks < 8) bayerMatrixSize = 4;
		else if (patternWidthBlocks >= 16) bayerMatrixSize = 16;
		else if (patternWidthBlocks >= 32) bayerMatrixSize = 32;

		const patternTileWidth = bayerMatrixSize * blockSize;

		const transitionStartY = Math.round(
			Math.round(
				((prevStep.center + step.center) / 2 - transitionMaxSize / 2) /
					blockSize
			) * blockSize
		);

		// Clamp transition position to valid range
		const clampedTransitionStartY = Math.max(
			0,
			Math.min(transitionStartY, patternHeight)
		);
		const clampedTransitionSize = Math.min(
			transitionMaxSize,
			patternHeight - clampedTransitionStartY
		);

		const svgPattern = document.createElementNS(SVG_URL, "pattern");
		svgPattern.setAttribute("patternUnits", "userSpaceOnUse");
		svgPattern.setAttribute("width", patternTileWidth + "px");
		svgPattern.setAttribute("height", clampedTransitionSize + "px");
		svgPattern.setAttribute("x", "0");
		svgPattern.setAttribute("y", clampedTransitionStartY + "px");
		svgPattern.appendChild(transitionGroup);
		const patternID = "pattern-" + Math.random().toString(36).substr(2, 9);
		svgPattern.setAttribute("id", patternID);

		const repeatingTransition = document.createElementNS(SVG_URL, "rect");
		repeatingTransition.setAttribute("x", "0");
		repeatingTransition.setAttribute("y", clampedTransitionStartY + "px");
		repeatingTransition.setAttribute("width", patternWidth + "px");
		repeatingTransition.setAttribute(
			"height",
			clampedTransitionSize + "px"
		);
		repeatingTransition.setAttribute("fill", `url(#${patternID})`);

		const remainingHeight = Math.max(
			0,
			patternHeight - clampedTransitionStartY - clampedTransitionSize
		);
		if (remainingHeight > 0) {
			const rect = document.createElementNS(SVG_URL, "rect");
			rect.setAttribute("x", "0");
			rect.setAttribute(
				"y",
				clampedTransitionStartY + clampedTransitionSize + "px"
			);
			rect.setAttribute("width", patternWidth + "px");
			rect.setAttribute("height", remainingHeight + "px");
			rect.setAttribute("fill", step.color);
			g.appendChild(rect);
		}

		if (prevStep.color !== step.color) {
			g.appendChild(svgPattern);
			g.appendChild(repeatingTransition);
		}
	}

	svg.appendChild(g);

	const tempElement = document.getElementById("temp");
	if (tempElement) {
		tempElement.innerHTML = "";
		tempElement.appendChild(svg);
	}

	return svg;
};
