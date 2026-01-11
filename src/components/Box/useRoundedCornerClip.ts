import { useChonkit } from "@/core/ChonkitProvider/ChonkitProvider";
import {
	convertPointsToPathString,
	generateRoundedCornerPoints,
} from "@/utils/svg/circle-generator/circle-generator";
import { useEffect, useLayoutEffect, useRef } from "react";
import type { GeometryObserver } from "./useGeometryObserver";

export type RoundedCornerClipProps = {
	borderRadius?: number | [number, number, number, number];
	showWhileGeometryUnknown?: boolean;
};

export function useRoundedCornerClip(
	element: React.RefObject<HTMLElement | null>,
	options: RoundedCornerClipProps,
	geometry: GeometryObserver
) {
	const { blockSize } = useChonkit();
	const hadBorderRadius = useRef<boolean>(false);

	useLayoutEffect(() => {
		// this applies a non-pixelated border radius only while geometry is not yet known. This looks better than no border radius at all.
		if (
			options.showWhileGeometryUnknown &&
			element.current &&
			options.borderRadius
		) {
			const cssBorderRadius = Array.isArray(options.borderRadius)
				? options.borderRadius
						.map((radius) => `${radius * blockSize}px`)
						.join(" ")
				: `${options.borderRadius * blockSize}px`;
			if (element.current)
				element.current.style.borderRadius = cssBorderRadius;
		}
	}, []);

	useEffect(() => {
		if (!element.current) return;
		if (!options.borderRadius && hadBorderRadius.current) {
			element.current.style.clipPath = "none";
			hadBorderRadius.current = false;
			return;
		}
		if (!options.borderRadius) return;

		const apply = ({
			width,
			height,
		}: {
			width: number;
			height: number;
		}) => {
			if (!element.current) return;
			if (options.borderRadius) {
				hadBorderRadius.current = true;
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
			if (
				options.showWhileGeometryUnknown &&
				element.current &&
				element.current.style.borderRadius
			)
				element.current.style.borderRadius = "";
		};

		const unsubscribe = geometry.subscribe(apply);

		return unsubscribe;
	}, [options.borderRadius, blockSize, element]);
}
