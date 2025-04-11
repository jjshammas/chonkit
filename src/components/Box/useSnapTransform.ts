import { useEffect, useRef } from "react";
import type { Geometry, GeometryCallback } from "./useGeometryObserver";

type SnapOptions = {
	snap?: boolean;
	snapMethod: "transform" | "padding";
	blockSize: number;
};

const getTransformForSnapAdj = ({ x, y, width, height }: Geometry): string =>
	`translate(${x}px, ${y}px) scale(${width}, ${height})`;

const getSnapAdjFromTransform = (transform: string): Geometry => {
	if (!transform) return { x: -1, y: -1, width: 1, height: 1 };
	const match = transform.match(/translate\(([^)]+)\) scale\(([^)]+)\)/);
	if (!match) return { x: 0, y: 0, width: 1, height: 1 };
	const [x, y] = match[1].split(",").map(Number);
	const [width, height] = match[2].split(",").map(Number);
	return { x, y, width, height };
};

export function useSnapTransform(
	element: React.RefObject<HTMLElement>,
	options: SnapOptions,
	subscribeToGeometry: (cb: GeometryCallback) => () => void
) {
	const isInternalUpdate = useRef(false);

	useEffect(() => {
		if (!options.snap) return;
		const el = element.current;
		if (!el) return;

		const unsubscribe = subscribeToGeometry(({ x, y, width, height }) => {
			if (isInternalUpdate.current) {
				isInternalUpdate.current = false;
				return;
			}

			const existing = getSnapAdjFromTransform(el.style.transform);
			const xNoSnap = x - existing.x - 1;
			const yNoSnap = y - existing.y - 1;
			const wNoSnap = width / existing.width;
			const hNoSnap = height / existing.height;

			const nearestX =
				Math.round(xNoSnap / options.blockSize) * options.blockSize;
			const nearestY =
				Math.round(yNoSnap / options.blockSize) * options.blockSize;
			const nearestW =
				Math.round(wNoSnap / options.blockSize) * options.blockSize;
			const nearestH =
				Math.round(hNoSnap / options.blockSize) * options.blockSize;

			isInternalUpdate.current = true;
			el.style.transform = getTransformForSnapAdj({
				x: nearestX - xNoSnap + 1,
				y: nearestY - yNoSnap + 1,
				width:
					options.snapMethod === "transform" ? nearestW / wNoSnap : 1,
				height:
					options.snapMethod === "transform" ? nearestH / hNoSnap : 1,
			});
		});

		return unsubscribe;
	}, [
		element,
		options.snap,
		options.snapMethod,
		options.blockSize,
		subscribeToGeometry,
	]);
}
