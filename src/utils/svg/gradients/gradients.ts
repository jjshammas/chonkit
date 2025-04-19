import { svgToDataURL } from "../svgToDataURL";
import patterns from "./dither-patterns";

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
		if (centers[i].center) return i;
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
	if (!centers[0].center) centers[0].center = 0;
	if (!centers[centers.length - 1].center)
		centers[centers.length - 1].center = 100;

	for (let i = 1; i < centers.length - 1; i++) {
		const thisStep = centers[i];
		if (thisStep.center) continue;
		const prevStep = centers[i - 1];
		const prevCenter = prevStep.center;
		if (!prevCenter)
			throw new Error(
				"Could not proces gradient. Missing center on previous step (" +
					i +
					")"
			);

		const nextKnownCenterIndex = getIndexOfNextKnownCenter(centers, i);
		const nextKnownCenter = centers[nextKnownCenterIndex].center;
		if (!nextKnownCenter)
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
		if (center.center === null)
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

function selectPattern(width: number, height: number): string[] {
	return (
		patterns
			.sort((a, b) => b.length - a.length)
			.find((pattern) => pattern.length <= height) || []
	);
}

function drawTransition(
	transition: string[],
	color1: string,
	color2: string,
	blockSize: number
) {
	const g = document.createElementNS(SVG_URL, "g");
	for (let row = 0; row < transition.length; row++) {
		for (let col = 0; col < transition[row].length; col++) {
			const rect = document.createElementNS(SVG_URL, "rect");
			rect.setAttribute("x", col * blockSize + "px");
			rect.setAttribute("y", row * blockSize + "px");
			rect.setAttribute("width", blockSize + "px");
			rect.setAttribute("height", blockSize + "px");
			rect.setAttribute(
				"fill",
				transition[row][col] === "1" ? color2 : color1
			);
			g.appendChild(rect);
		}
	}
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
	const direction = parseFloat(gradientParts[0].replace("deg", ""));
	if (direction !== 90) {
		throw new Error("Unsupported gradient direction: " + direction);
	}

	// svg.setAttribute("width", width.toString());
	svg.setAttribute("width", width + "px");
	svg.setAttribute("height", height + "px");

	const gradientSteps = calculateCenters(
		gradientParts.slice(1),
		height,
		blockSize
	);

	const g = document.createElementNS(SVG_URL, "g");
	// g.setAttribute("transform", "rotate(90 16 16)");

	const patternWidth = width;
	const rect = document.createElementNS(SVG_URL, "rect");
	rect.setAttribute("x", "0");
	rect.setAttribute("y", "0");
	rect.setAttribute("width", patternWidth + "px");
	rect.setAttribute("height", height + "px");
	rect.setAttribute("fill", gradientSteps[0].color);
	g.appendChild(rect);

	for (let i = 1; i < gradientSteps.length; i++) {
		const step = gradientSteps[i];
		const prevStep = gradientSteps[i - 1];
		const nextStep = gradientSteps[i + 1];

		const transitionMaxSize =
			step.center - (prevStep ? prevStep.center : 0);
		const transitionMaxBlocks = Math.floor(transitionMaxSize / blockSize);

		const transitionPattern = selectPattern(100, transitionMaxBlocks);
		const transitionBlocks = transitionPattern.length;
		const transitionSize = transitionBlocks * blockSize;
		const transitionRepeatBlocks = transitionPattern[0]?.length || 0;
		const transitionRepeatSize = transitionRepeatBlocks * blockSize;
		const transitionStartYUnrounded =
			(prevStep.center + step.center) / 2 - transitionSize / 2;
		const transitionStartY = Math.round(
			Math.round(transitionStartYUnrounded / blockSize) * blockSize
		);
		const transitionGroup = drawTransition(
			transitionPattern,
			prevStep.color,
			step.color,
			blockSize
		);
		const pattern = document.createElementNS(SVG_URL, "pattern");
		pattern.setAttribute("patternUnits", "userSpaceOnUse");
		pattern.setAttribute("width", transitionRepeatSize + "px");
		pattern.setAttribute("height", transitionSize + "px");
		pattern.setAttribute("x", "0");
		pattern.setAttribute("y", transitionStartY + "px");
		pattern.appendChild(transitionGroup);
		const patternID = "pattern-" + Math.random().toString(36).substr(2, 9);
		pattern.setAttribute("id", patternID);
		const repeatingTransition = document.createElementNS(SVG_URL, "rect");
		repeatingTransition.setAttribute("x", "0");
		repeatingTransition.setAttribute("y", transitionStartY + "px");
		repeatingTransition.setAttribute("width", patternWidth + "px");
		repeatingTransition.setAttribute("height", transitionSize + "px");
		repeatingTransition.setAttribute("fill", `url(#${patternID})`);

		const rect = document.createElementNS(SVG_URL, "rect");
		rect.setAttribute("x", "0");
		rect.setAttribute("y", transitionStartY + "px");
		rect.setAttribute("width", patternWidth + "px");
		rect.setAttribute("height", height - transitionStartY + "px");
		rect.setAttribute("fill", step.color);
		g.appendChild(rect);

		if (prevStep.color !== step.color) {
			g.appendChild(pattern);
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
