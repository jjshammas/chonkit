import { useEffect, useRef } from "react";
import {
	generateBorderPoints,
	convertPointsToPathString,
} from "@/utils/svg/circle-generator/circle-generator";
import type { GeometryObserver } from "./useGeometryObserver";
import type { RoundedCornerClipProps } from "./useRoundedCornerClip";
import { useChonkit } from "@/core/ChonkitProvider/ChonkitProvider";
import styles from "./Box.module.css";

export type FabricatedBorderProps = {
	borderRadius?: RoundedCornerClipProps["borderRadius"];
	borderSize?: number;
	borderColor?: string;
};

export function useFabricatedBorder(
	element: React.RefObject<HTMLElement | null>,
	options: FabricatedBorderProps,
	geometry: GeometryObserver
) {
	const { blockSize } = useChonkit();
	const fabricatedBorder = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!options.borderRadius || !options.borderSize) return;
		if (!fabricatedBorder.current) return;

		const unsubscribe = geometry.subscribe(({ width, height }) => {
			const path = generateBorderPoints(
				options.borderRadius!,
				Math.max(options.borderSize || 0, 0),
				blockSize,
				width,
				height
			);
			fabricatedBorder.current!.style.clipPath = `path('${convertPointsToPathString(
				path
			)}')`;
		});

		return unsubscribe;
	}, [
		options.borderRadius,
		options.borderSize,
		blockSize,
		element,
		fabricatedBorder,
	]);

	return {
		fabricatedBorderEl: options.borderSize ? (
			<div ref={fabricatedBorder} className={styles.fabricatedBorder} />
		) : null,
	};
}
