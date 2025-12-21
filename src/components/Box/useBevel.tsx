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
import type { FabricatedBorderProps } from "./useFabricatedBorder";
import type { RoundedCornerClipProps } from "./useRoundedCornerClip";
import styles from "./Box.module.css";

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
