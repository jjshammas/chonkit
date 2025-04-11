import { useEffect, useRef } from "react";
import {
	generateRoundedCornerPoints,
	convertPointsToPathString,
} from "@/utils/svg/circle-generator/circle-generator";
import type { GeometryObserver } from "./useGeometryObserver";
import { useChonkit } from "@/core/ChonkitProvider/ChonkitProvider";
import type { RoundedCornerClipProps } from "./useRoundedCornerClip";
import { useLighting } from "@/core/LightingProvider/LightingProvider";
import styles from "./Box.module.css";

export function useEmboss(
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
					generateRoundedCornerPoints(
						options.borderRadius || 0,
						blockSize,
						width +
							(direction !== 90 && direction !== 270
								? options.highlightSize * blockSize
								: 0),
						height +
							(direction !== 0 && direction !== 180
								? options.highlightSize * blockSize
								: 0)
					)
				)}')`;
				elementHighlight.current!.style.clipPath = highlightPath;
			}
			if (options.shadowSize) {
				const shadowPath = `path('${convertPointsToPathString(
					generateRoundedCornerPoints(
						options.borderRadius || 0,
						blockSize,
						width +
							(direction !== 90 && direction !== 270
								? options.shadowSize * blockSize
								: 0),
						height +
							(direction !== 0 && direction !== 180
								? options.shadowSize * blockSize
								: 0)
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

	const embossHighlightEl = options.highlightSize ? (
		<div
			ref={elementHighlight}
			className={`${styles.highlight} ${styles.embossment}`}
			style={{
				bottom:
					direction !== 0 && direction !== 180
						? direction < 180
							? `${blockSize * -options.highlightSize}px`
							: 0
						: 0,
				top:
					direction !== 0 && direction !== 180
						? direction > 180
							? `${blockSize * -options.highlightSize}px`
							: 0
						: 0,
				left:
					direction !== 90 && direction !== 270
						? direction > 90 && direction < 270
							? `${blockSize * -options.highlightSize}px`
							: 0
						: 0,
				right:
					direction !== 90 && direction !== 270
						? direction < 90 || direction > 270
							? `${blockSize * -options.highlightSize}px`
							: 0
						: 0,
			}}
		></div>
	) : null;

	const embossShadowEl = options.shadowSize ? (
		<div
			ref={elementShadow}
			className={`${styles.shadow} ${styles.embossment}`}
			style={{
				top:
					direction !== 0 && direction !== 180
						? direction < 180
							? `${blockSize * -options.shadowSize}px`
							: 0
						: 0,
				bottom:
					direction !== 0 && direction !== 180
						? direction > 180
							? `${blockSize * -options.shadowSize}px`
							: 0
						: 0,
				right:
					direction !== 90 && direction !== 270
						? direction > 90 && direction < 270
							? `${blockSize * -options.shadowSize}px`
							: 0
						: 0,
				left:
					direction !== 90 && direction !== 270
						? direction < 90 || direction > 270
							? `${blockSize * -options.shadowSize}px`
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
