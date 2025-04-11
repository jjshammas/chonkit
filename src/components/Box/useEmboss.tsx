import { useEffect, useRef } from "react";
import {
	generateRoundedCornerPoints,
	convertPointsToPathString,
} from "@/utils/svg/circle-generator/circle-generator";
import type { GeometryObserver } from "./useGeometryObserver";
import { useChonkit } from "../ChonkitProvider/ChonkitProvider";
import type { RoundedCornerClipProps } from "./useRoundedCornerClip";
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
	const elementHighlight = useRef<HTMLDivElement>(null);
	const elementShadow = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const unsubscribe = geometry.subscribe(({ width, height }) => {
			if (options.highlightSize) {
				const highlightPath = `path('${convertPointsToPathString(
					generateRoundedCornerPoints(
						options.borderRadius || 0,
						blockSize,
						width,
						height
					)
				)}')`;
				elementHighlight.current!.style.clipPath = highlightPath;
			}
			if (options.shadowSize) {
				const shadowPath = `path('${convertPointsToPathString(
					generateRoundedCornerPoints(
						options.borderRadius || 0,
						blockSize,
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
	]);

	const embossHighlightEl = options.highlightSize ? (
		<div
			ref={elementHighlight}
			className={`${styles.highlight} ${styles.embossment}`}
			style={{
				bottom: `${blockSize * -options.highlightSize}px`,
			}}
		></div>
	) : null;

	const embossShadowEl = options.shadowSize ? (
		<div
			ref={elementShadow}
			className={`${styles.shadow} ${styles.embossment}`}
			style={{
				top: `${blockSize * -options.shadowSize}px`,
			}}
		></div>
	) : null;

	return {
		embossHighlightEl,
		embossShadowEl,
	};
}
