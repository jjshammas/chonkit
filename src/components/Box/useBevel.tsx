import { useEffect, useRef } from "react";
import { generateHighlightPath } from "@/utils/svg/circle-generator/circle-generator";
import type { GeometryObserver } from "./useGeometryObserver";
import styles from "./Box.module.css";

export function useBevel(
	element: React.RefObject<HTMLElement | null>,
	options: {
		highlightSize?: number;
		shadowSize?: number;
		borderRadius?: number;
		borderSize?: number;
		blockSize: number;
	},
	geometry: GeometryObserver
) {
	const elementHighlight = useRef<HTMLDivElement>(null);
	const elementShadow = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const unsubscribe = geometry.subscribe(({ width, height }) => {
			if (options.highlightSize) {
				const highlightPath = `path('${generateHighlightPath(
					options.borderRadius || 0,
					options.borderSize || 0,
					options.blockSize,
					options.highlightSize,
					"top",
					width,
					height
				)}')`;
				elementHighlight.current!.style.clipPath = highlightPath;
			}
			if (options.shadowSize) {
				const shadowPath = `path('${generateHighlightPath(
					options.borderRadius || 0,
					options.borderSize || 0,
					options.blockSize,
					options.shadowSize,
					"bottom",
					width,
					height
				)}')`;
				elementShadow.current!.style.clipPath = shadowPath;
			}
		});

		return unsubscribe;
	}, [
		options.borderRadius,
		options.borderSize,
		options.blockSize,
		options.highlightSize,
		options.shadowSize,
		element,
		elementHighlight,
		elementShadow,
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
