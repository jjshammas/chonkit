import { useEffect } from "react";
import { generateRoundedCornerPath } from "@/utils/svg/circle-generator/circle-generator";
import type { GeometryObserver } from "./useGeometryObserver";
import { useChonkit } from "../ChonkitProvider/ChonkitProvider";

export function useRoundedCornerClip(
	element: React.RefObject<HTMLElement | null>,
	options: {
		borderRadius?: number;
	},
	geometry: GeometryObserver
) {
	const { blockSize } = useChonkit();

	useEffect(() => {
		if (!options.borderRadius || !element.current) return;

		const apply = ({
			width,
			height,
		}: {
			width: number;
			height: number;
		}) => {
			if (!element.current) return;
			if (options.borderRadius && options.borderRadius > 0) {
				element.current.style.clipPath = `path('${generateRoundedCornerPath(
					options.borderRadius!,
					blockSize,
					width,
					height
				)}')`;
			} else {
				element.current.style.clipPath = "none";
			}
		};

		const unsubscribe = geometry.subscribe(apply);

		return unsubscribe;
	}, [options.borderRadius, blockSize, element]);
}
