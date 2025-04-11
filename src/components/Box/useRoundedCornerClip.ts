import { useEffect } from "react";
import { generateRoundedCornerPath } from "@/utils/svg/circle-generator/circle-generator";
import type { GeometryObserver } from "./useGeometryObserver";

export function useRoundedCornerClip(
	element: React.RefObject<HTMLElement | null>,
	elementInner: React.RefObject<HTMLElement | null>,
	options: {
		borderRadius?: number;
		blockSize: number;
	},
	geometry: GeometryObserver
) {
	useEffect(() => {
		if (!options.borderRadius || !element.current) return;

		const apply = ({
			width,
			height,
		}: {
			width: number;
			height: number;
		}) => {
			if (!elementInner.current) return;
			if (options.borderRadius && options.borderRadius > 0) {
				elementInner.current.style.clipPath = `path('${generateRoundedCornerPath(
					options.borderRadius!,
					options.blockSize,
					width,
					height
				)}')`;
			} else {
				elementInner.current.style.clipPath = "none";
			}
		};

		const unsubscribe = geometry.subscribe(apply);

		return unsubscribe;
	}, [options.borderRadius, options.blockSize, element, elementInner]);
}
