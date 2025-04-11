import { useEffect } from "react";
import { generateBorderPath } from "@/utils/svg/circle-generator/circle-generator";
import type { GeometryObserver } from "./useGeometryObserver";

export function useFabricatedBorder(
	element: React.RefObject<HTMLElement | null>,
	fabricatedBorder: React.RefObject<HTMLElement | null>,
	options: {
		borderRadius?: number;
		borderSize?: number;
		blockSize: number;
	},
	geometry: GeometryObserver
) {
	useEffect(() => {
		if (!options.borderRadius || !options.borderSize) return;
		if (!fabricatedBorder.current) return;

		const unsubscribe = geometry.subscribe(({ width, height }) => {
			const path = generateBorderPath(
				options.borderRadius!,
				options.borderSize!,
				options.blockSize,
				width,
				height
			);
			fabricatedBorder.current!.style.clipPath = `path('${path}')`;
		});

		return unsubscribe;
	}, [
		options.borderRadius,
		options.borderSize,
		options.blockSize,
		element,
		fabricatedBorder,
	]);
}
