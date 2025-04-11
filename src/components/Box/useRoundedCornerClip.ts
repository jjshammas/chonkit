import { useEffect } from "react";
import {
	convertPointsToPathString,
	generateRoundedCornerPoints,
} from "@/utils/svg/circle-generator/circle-generator";
import type { GeometryObserver } from "./useGeometryObserver";
import { useChonkit } from "../ChonkitProvider/ChonkitProvider";

export type RoundedCornerClipProps = {
	borderRadius?: number | [number, number, number, number];
};

export function useRoundedCornerClip(
	element: React.RefObject<HTMLElement | null>,
	options: RoundedCornerClipProps,
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
			if (options.borderRadius) {
				element.current.style.clipPath = `path('${convertPointsToPathString(
					generateRoundedCornerPoints(
						options.borderRadius!,
						blockSize,
						width,
						height
					)
				)}')`;
			} else {
				element.current.style.clipPath = "none";
			}
		};

		const unsubscribe = geometry.subscribe(apply);

		return unsubscribe;
	}, [options.borderRadius, blockSize, element]);
}
