import { useChonkit } from "@/core/ChonkitProvider/ChonkitProvider";
import {
	rotateDirection,
	useLighting,
} from "@/core/LightingProvider/LightingProvider";
import {
	convertPointsToPathString,
	generateHighlightPoints,
} from "@/utils/svg/circle-generator/circle-generator";
import { useEffect, useRef } from "react";
import styles from "./Box.module.css";
import type { FabricatedBorderProps } from "./useFabricatedBorder";
import type { GeometryObserver } from "./useGeometryObserver";
import type { RoundedCornerClipProps } from "./useRoundedCornerClip";

export type BevelProps = {
	highlightSize?: number;
	shadowSize?: number;
	borderRadius?: RoundedCornerClipProps["borderRadius"];
	borderWidth?: FabricatedBorderProps["borderWidth"];
};

export function useBevel(
	element: React.RefObject<HTMLElement | null>,
	options: BevelProps,
	geometry: GeometryObserver
) {
	const highlightSize = Math.max(options.highlightSize || 0, 0);
	const shadowSize = Math.max(options.shadowSize || 0, 0);

	const { blockSize } = useChonkit();
	const { direction } = useLighting();
	const elementHighlight = useRef<HTMLDivElement>(null);
	const elementShadow = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!highlightSize && !shadowSize) return;

		const unsubscribe = geometry.subscribe(({ width, height }) => {
			if (highlightSize) {
				const highlightPath = `path('${convertPointsToPathString(
					generateHighlightPoints(
						options.borderRadius || 0,
						options.borderWidth || 0,
						blockSize,
						highlightSize,
						direction,
						width,
						height
					)
				)}')`;
				elementHighlight.current!.style.clipPath = highlightPath;
			}
			if (shadowSize) {
				const shadowPath = `path('${convertPointsToPathString(
					generateHighlightPoints(
						options.borderRadius || 0,
						options.borderWidth || 0,
						blockSize,
						shadowSize,
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
		options.borderWidth,
		blockSize,
		highlightSize,
		shadowSize,
		element,
		elementHighlight,
		elementShadow,
		direction,
	]);

	const bevelHighlightEl = highlightSize ? (
		<div ref={elementHighlight} className={styles.highlight} />
	) : null;

	const bevelShadowEl = shadowSize ? (
		<div ref={elementShadow} className={styles.shadow} />
	) : null;

	return {
		bevelHighlightEl,
		bevelShadowEl,
	};
}
