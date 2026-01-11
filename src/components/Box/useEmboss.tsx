import { useChonkit } from "@/core/ChonkitProvider/ChonkitProvider";
import { useLighting } from "@/core/LightingProvider/LightingProvider";
import {
	convertPointsToPathString,
	generateRoundedCornerPoints,
} from "@/utils/svg/circle-generator/circle-generator";
import { useEffect, useRef } from "react";
import styles from "./Box.module.css";
import type { FabricatedBorderProps } from "./useFabricatedBorder";
import type { GeometryObserver } from "./useGeometryObserver";
import type { RoundedCornerClipProps } from "./useRoundedCornerClip";

export type EmbossProps = {
	highlightSize?: number;
	shadowSize?: number;
	borderRadius?: RoundedCornerClipProps["borderRadius"];
	borderWidth?: FabricatedBorderProps["borderWidth"];
};

export function useEmboss(
	element: React.RefObject<HTMLElement | null>,
	options: EmbossProps,
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
					generateRoundedCornerPoints(
						options.borderRadius || 0,
						blockSize,
						width +
							(direction !== 90 && direction !== 270
								? highlightSize * blockSize
								: 0),
						height +
							(direction !== 0 && direction !== 180
								? highlightSize * blockSize
								: 0)
					)
				)}')`;
				elementHighlight.current!.style.clipPath = highlightPath;
			}
			if (shadowSize) {
				const shadowPath = `path('${convertPointsToPathString(
					generateRoundedCornerPoints(
						options.borderRadius || 0,
						blockSize,
						width +
							(direction !== 90 && direction !== 270
								? shadowSize * blockSize
								: 0),
						height +
							(direction !== 0 && direction !== 180
								? shadowSize * blockSize
								: 0)
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

	const embossHighlightEl = highlightSize ? (
		<div
			ref={elementHighlight}
			className={`${styles.highlight} ${styles.embossment}`}
			style={{
				bottom:
					direction !== 0 && direction !== 180
						? direction < 180
							? `${blockSize * -highlightSize}px`
							: 0
						: 0,
				top:
					direction !== 0 && direction !== 180
						? direction > 180
							? `${blockSize * -highlightSize}px`
							: 0
						: 0,
				left:
					direction !== 90 && direction !== 270
						? direction > 90 && direction < 270
							? `${blockSize * -highlightSize}px`
							: 0
						: 0,
				right:
					direction !== 90 && direction !== 270
						? direction < 90 || direction > 270
							? `${blockSize * -highlightSize}px`
							: 0
						: 0,
			}}
		></div>
	) : null;

	const embossShadowEl = shadowSize ? (
		<div
			ref={elementShadow}
			className={`${styles.shadow} ${styles.embossment}`}
			style={{
				top:
					direction !== 0 && direction !== 180
						? direction < 180
							? `${blockSize * -shadowSize}px`
							: 0
						: 0,
				bottom:
					direction !== 0 && direction !== 180
						? direction > 180
							? `${blockSize * -shadowSize}px`
							: 0
						: 0,
				right:
					direction !== 90 && direction !== 270
						? direction > 90 && direction < 270
							? `${blockSize * -shadowSize}px`
							: 0
						: 0,
				left:
					direction !== 90 && direction !== 270
						? direction < 90 || direction > 270
							? `${blockSize * -shadowSize}px`
							: 0
						: 0,
			}}
		></div>
	) : null;

	return {
		embossHighlightEl,
		embossShadowEl,
	};
}
