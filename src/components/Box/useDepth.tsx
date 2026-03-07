import { useChonkit } from "@/core/ChonkitProvider/ChonkitProvider";
import {
	convertPointsToPathString,
	generateRoundedCornerPoints,
} from "@/utils/svg/circle-generator/circle-generator";
import { useEffect, useRef } from "react";
import styles from "./Box.module.css";
import type { GeometryObserver } from "./useGeometryObserver";
import type { RoundedCornerClipProps } from "./useRoundedCornerClip";

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
		if (!depth) return;
		if (!elementDepth.current) return;

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
				if (elementDepth.current) {
					elementDepth.current.style.clipPath = depthPath;
				}
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
