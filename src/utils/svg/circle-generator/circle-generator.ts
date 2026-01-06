import type { LightingDirection } from "@/core/LightingProvider/LightingProvider";

// Based on https://observablehq.com/@jheeffer/pixelated-circle
export function generatePixelOval(radius: number) {
	if (radius < 1 || isNaN(radius)) return [];
	radius = Math.round(radius);

	type Step = {
		x: number;
		y: number;
		e: number;
		ex: number;
		ey: number;
		exy: number;
	};

	const fullSizeCircle = false;
	const sideLength = radius * 2;

	const grid = Array(sideLength)
		.fill(0)
		.map(() => Array(sideLength).fill(0));

	function error(x: number, y: number, r: number) {
		return x * x + y * y - r * r;
	}

	function drawPixel(x: number, y: number) {
		grid[y][x] = 1;
	}

	function drawCircle(pixels: number) {
		let d = fullSizeCircle ? pixels : pixels - 1;
		let r = d / 2;
		let x = -r;
		let y = r % 1 == 0 ? 0 : 0.5; // non-integer radius, move y half down
		if (fullSizeCircle) (y -= 0.5), (x += 0.5);

		let steps: Step[] = [];
		do {
			// draw current pixels
			let cx = r,
				cy = r;
			if (fullSizeCircle) cx = cy -= 0.5;
			drawPixel(cx + x, cy + y); // quadrant 3
			drawPixel(cx - x, cy - y); // quadrant 1
			drawPixel(cx - y, cy + x); // quadrant 2
			drawPixel(cx + y, cy - x); // quadrant 4

			// get error values for each possible next step
			let e = error(x, y, r);
			let ex = error(x + 1, y, r);
			let ey = error(x, y + 1, r);
			let exy = error(x + 1, y + 1, r);
			steps.push({ x, y, e, ex, ey, exy });

			// choose option with smallest error
			// long, clear version
			if (Math.abs(exy) < Math.abs(ex) && Math.abs(exy) < Math.abs(ey))
				x++, y++;
			else if (
				Math.abs(ex) < Math.abs(exy) &&
				Math.abs(ex) < Math.abs(ey)
			)
				x++;
			else if (
				Math.abs(ey) < Math.abs(exy) &&
				Math.abs(ey) < Math.abs(ex)
			) {
				y++;
				// spurious pixel removal (radius 4, 7.5, 11...). Move to the right now if next move will be right.
				if (
					Math.abs(error(x + 1, y + 1, r)) >
						Math.abs(error(x + 1, y, r)) &&
					Math.abs(error(x + 1, y, r)) < Math.abs(error(x, y + 1, r))
				)
					x++;
			}
		} while (x < 0);

		// return steps;
		return grid;
	}

	return drawCircle(sideLength);
}

// generates only the top-left corner of the oval
export function generatePixelCornerArc(radius: number): number[][] {
	return generatePixelOval(radius)
		.slice(0, radius)
		.map((row) => row.slice(0, radius));
}

export function flipPointsAboutHorizontalAxis(
	points: [number, number][],
	width: number
): [number, number][] {
	return points.map(([x, y]) => [width - x, y]);
}

export function flipPointsAboutVerticalAxis(
	points: [number, number][],
	height: number
): [number, number][] {
	return points.map(([x, y]) => [x, height - y]);
}

export function nudgePoints(
	points: [number, number][],
	x: number,
	y: number
): [number, number][] {
	return points.map(([px, py]) => [px + x, py + y]);
}

export function convertPointsToPathString(path: [number, number][]): string {
	const pathStr = [`M${path[0][0]},${path[0][1]}`];
	for (let i = 1; i < path.length; i++) {
		const [x, y] = path[i];
		pathStr.push(`L${x},${y}`);
	}
	pathStr.push("Z");
	return pathStr.join(" ");
}

type RadiiAllCorners = [number, number, number, number];
export function generateRoundedCornerPoints(
	radius: number | RadiiAllCorners,
	blockSize: number,
	width: number,
	height: number
): [number, number][] {
	const maxRadius = Math.ceil(
		Math.min(width / blockSize / 2, height / blockSize / 2)
	);

	const radii = Array.isArray(radius)
		? radius.map((r) => Math.min(r, maxRadius))
		: Array(4).fill(Math.min(radius, maxRadius));

	const generateCornerArc = (radius: number) => {
		const path: [number, number][] = [];
		const arcGrid = generatePixelCornerArc(radius);
		// in each arc, there are always radius * 2 + 1 points
		// the first point is the left, bottom point of the arc
		let currentXBlock = 0;
		let currentYBlock = radius - 1;
		path.push([0, radius]);
		path.push([0, radius - 1]);
		for (let i = 0; i < radius * 2; i++) {
			// check if block exists above
			if (
				arcGrid[currentYBlock - 1] &&
				arcGrid[currentYBlock - 1][currentXBlock]
			) {
				currentYBlock--;
				path.push([currentXBlock, currentYBlock]);
			} else if (
				arcGrid[currentYBlock - 1] &&
				arcGrid[currentYBlock - 1][currentXBlock + 1]
			) {
				currentYBlock--;
				currentXBlock++;
				path.push([currentXBlock, currentYBlock + 1]);
				path.push([currentXBlock, currentYBlock]);
			} else if (
				arcGrid[currentYBlock] &&
				arcGrid[currentYBlock][currentXBlock + 1]
			) {
				currentXBlock++;
				path.push([currentXBlock, currentYBlock]);
			}
		}
		path.push([radius, 0]);

		// scale all the points based on the block size
		path.forEach((point) => {
			point[0] = point[0] * blockSize;
			point[1] = point[1] * blockSize;
		});

		return path;
	};

	const path: [number, number][] = [];

	const topLeftCorner = generateCornerArc(radii[0]);
	path.push(...topLeftCorner);
	const topRightCorner = flipPointsAboutHorizontalAxis(
		generateCornerArc(radii[1]),
		width
	);
	path.push(...topRightCorner.reverse());

	const bottomRightCorner = flipPointsAboutVerticalAxis(
		flipPointsAboutHorizontalAxis(generateCornerArc(radii[2]), width),
		height
	);
	path.push(...bottomRightCorner);

	const bottomLeftCorner = flipPointsAboutVerticalAxis(
		generateCornerArc(radii[3]),
		height
	).reverse();
	path.push(...bottomLeftCorner);

	return path;
}

export function generateBorderPoints(
	radius: number | RadiiAllCorners,
	borderWidth: number,
	blockSize: number,
	width: number,
	height: number
): [number, number][] {
	let innerPoints = nudgePoints(
		generateRoundedCornerPoints(
			Array.isArray(radius)
				? ((radius.map((r) => r - borderWidth) as number[])
						.slice(0, 4)
						.concat(Array(4).fill(0).slice(radius.length))
						.slice(0, 4) as RadiiAllCorners)
				: radius - borderWidth,
			blockSize,
			width - borderWidth * blockSize * 2,
			height - borderWidth * blockSize * 2
		),
		blockSize * borderWidth,
		blockSize * borderWidth
	);

	// we finish the above path on the left edge. now add points to invert this
	innerPoints.push(
		[-1, innerPoints[innerPoints.length - 1][1]],
		[-1, height + 1],
		[width + 1, height + 1],
		[width + 1, -1],
		[-1, -1],
		[-1, innerPoints[innerPoints.length - 1][1]],
		innerPoints[innerPoints.length - 1]
	);

	return innerPoints;
}

export function generateHighlightPoints(
	radius: number | RadiiAllCorners,
	borderWidth: number,
	blockSize: number,
	effectSize: number,
	direction: LightingDirection,
	width: number,
	height: number
): [number, number][] {
	const innerPoints = nudgePoints(
		generateRoundedCornerPoints(radius, blockSize, width, height),
		effectSize *
			blockSize *
			(direction !== 90 && direction !== 270 ? 1 : 0) *
			(direction < 90 || direction > 270 ? 1 : -1),
		effectSize *
			blockSize *
			(direction !== 0 && direction !== 180 ? 1 : 0) *
			(direction < 180 ? 1 : -1)
	);

	innerPoints.push(
		[-1, innerPoints[innerPoints.length - 1][1]],
		[-1, height + 1],
		[width + 1, height + 1],
		[width + 1, -1],
		[-1, -1],
		[-1, innerPoints[innerPoints.length - 1][1]],
		innerPoints[innerPoints.length - 1]
	);

	return innerPoints;
}
