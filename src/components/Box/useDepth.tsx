import { useEffect, useRef } from "react";
import {
	generateRoundedCornerPoints,
	convertPointsToPathString,
} from "@/utils/svg/circle-generator/circle-generator";
import type { GeometryObserver } from "./useGeometryObserver";
import { useChonkit } from "@/core/ChonkitProvider/ChonkitProvider";
import type { RoundedCornerClipProps } from "./useRoundedCornerClip";
import styles from "./Box.module.css";

export type DepthProps = {
	depth?: number;
	depthColor?: string;
	borderRadius?: RoundedCornerClipProps["borderRadius"];
};

export function useDepth(
	element: React.RefObject<HTMLElement | null>,
	options: DepthProps,
	geometry: GeometryObserver
) {
	const depth = Math.max(options.depth || 0, 0);

	const { blockSize } = useChonkit();
	const elementDepth = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const unsubscribe = geometry.subscribe(({ width, height }) => {
			if (depth) {
				const depthPath = `path('${convertPointsToPathString(
					generateRoundedCornerPoints(
						!options.borderRadius
							? 0
							: Array.isArray(options.borderRadius)
								? [
										0,
										0,
										options.borderRadius[2],
										options.borderRadius[3],
									]
								: [
										0,
										0,
										options.borderRadius,
										options.borderRadius,
									],
						blockSize,
						width,
						Math.floor(height / 2) + depth * blockSize
					)
				)}')`;
				elementDepth.current!.style.clipPath = depthPath;
			}
		});

		return unsubscribe;
	}, [depth, options.borderRadius, blockSize, element, elementDepth]);

	const depthEl = depth ? (
		<div ref={elementDepth} className={`${styles.depth}`}></div>
	) : null;

	return {
		depthEl,
	};
}
