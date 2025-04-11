import { useEffect, useRef } from "react";
import { generateBorderPath } from "@/utils/svg/circle-generator/circle-generator";
import type { GeometryObserver } from "./useGeometryObserver";
import { useChonkit } from "../ChonkitProvider/ChonkitProvider";

export function useFabricatedBorder(
	element: React.RefObject<HTMLElement | null>,
	options: {
		borderRadius?: number;
		borderSize?: number;
		borderColor?: string;
	},
	geometry: GeometryObserver
) {
	const { blockSize } = useChonkit();
	const fabricatedBorder = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!options.borderRadius || !options.borderSize) return;
		if (!fabricatedBorder.current) return;

		const unsubscribe = geometry.subscribe(({ width, height }) => {
			const path = generateBorderPath(
				options.borderRadius!,
				options.borderSize!,
				blockSize,
				width,
				height
			);
			fabricatedBorder.current!.style.clipPath = `path('${path}')`;
		});

		return unsubscribe;
	}, [
		options.borderRadius,
		options.borderSize,
		blockSize,
		element,
		fabricatedBorder,
	]);

	return {
		fabricatedBorderEl: options.borderRadius ? (
			<div
				ref={fabricatedBorder}
				style={{
					position: "absolute",
					top: 0,
					left: 0,
					right: 0,
					bottom: 0,
					background: options.borderColor,
					pointerEvents: "none",
				}}
			/>
		) : null,
	};
}
