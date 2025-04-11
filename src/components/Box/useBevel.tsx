import { useEffect, useRef } from "react";
import {
	generateHighlightPoints,
	convertPointsToPathString,
} from "@/utils/svg/circle-generator/circle-generator";
import type { GeometryObserver } from "./useGeometryObserver";
import { useChonkit } from "@/core/ChonkitProvider/ChonkitProvider";
import {
	useLighting,
	rotateDirection,
} from "@/core/LightingProvider/LightingProvider";
import type { RoundedCornerClipProps } from "./useRoundedCornerClip";
import styles from "./Box.module.css";

export function useBevel(
	element: React.RefObject<HTMLElement | null>,
	options: {
		highlightSize?: number;
		shadowSize?: number;
		borderRadius?: RoundedCornerClipProps["borderRadius"];
		borderSize?: number;
	},
	geometry: GeometryObserver
) {
	const { blockSize } = useChonkit();
	const { direction } = useLighting();
	const elementHighlight = useRef<HTMLDivElement>(null);
	const elementShadow = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const unsubscribe = geometry.subscribe(({ width, height }) => {
			if (options.highlightSize) {
				const highlightPath = `path('${convertPointsToPathString(
					generateHighlightPoints(
						options.borderRadius || 0,
						options.borderSize || 0,
						blockSize,
						options.highlightSize,
						direction,
						width,
						height
					)
				)}')`;
				elementHighlight.current!.style.clipPath = highlightPath;
			}
			if (options.shadowSize) {
				const shadowPath = `path('${convertPointsToPathString(
					generateHighlightPoints(
						options.borderRadius || 0,
						options.borderSize || 0,
						blockSize,
						options.shadowSize,
						rotateDirection(direction, 180),
						width,
						height
					)
				)}')`;
				elementShadow.current!.style.clipPath = shadowPath;
			}
		});

		return unsubscribe;
	}, [
		options.borderRadius,
		options.borderSize,
		blockSize,
		options.highlightSize,
		options.shadowSize,
		element,
		elementHighlight,
		elementShadow,
		direction,
	]);

	const bevelHighlightEl = options.highlightSize ? (
		<div ref={elementHighlight} className={styles.highlight} />
	) : null;

	const bevelShadowEl = options.shadowSize ? (
		<div ref={elementShadow} className={styles.shadow} />
	) : null;

	return {
		bevelHighlightEl,
		bevelShadowEl,
	};
}
