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
	borderWidth?: number;
	borderColor?: string;
	innerborderWidth?: number;
	innerBorderColor?: string;
};

export function useFabricatedBorder(
	element: React.RefObject<HTMLElement | null>,
	options: FabricatedBorderProps,
	geometry: GeometryObserver
) {
	const { blockSize } = useChonkit();
	const fabricatedBorder = useRef<HTMLDivElement>(null);
	const fabricatedInnerBorder = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (
			(!options.borderRadius || !options.borderWidth) &&
			!options.innerborderWidth
		)
			return;
		if (!fabricatedBorder.current && !fabricatedInnerBorder.current) return;

		const unsubscribe = geometry.subscribe(({ width, height }) => {
			const path = generateBorderPoints(
				options.borderRadius || 0,
				Math.max(options.borderWidth || 0, 0),
				blockSize,
				width,
				height
			);
			if (fabricatedBorder.current) {
				fabricatedBorder.current.style.clipPath = `path('${convertPointsToPathString(
					path
				)}')`;
			}

			const pathInner = generateBorderPoints(
				options.borderRadius || 0,
				Math.max(
					(options.borderWidth || 0) +
						(options.innerborderWidth || 0),
					0
				),
				blockSize,
				width,
				height
			);
			if (fabricatedInnerBorder.current) {
				fabricatedInnerBorder.current.style.clipPath = `path('${convertPointsToPathString(
					pathInner
				)}')`;
			}
		});

		return unsubscribe;
	}, [
		options.borderRadius,
		options.borderWidth,
		options.innerborderWidth,
		blockSize,
		element,
		fabricatedBorder.current,
		fabricatedInnerBorder.current,
	]);

	return {
		fabricatedBorderEl: (
			<>
				{options.borderWidth && options.borderRadius ? (
					<div
						ref={fabricatedBorder}
						className={styles.fabricatedBorder}
					/>
				) : null}
				{options.innerborderWidth ? (
					<div
						ref={fabricatedInnerBorder}
						className={styles.fabricatedInnerBorder}
					/>
				) : null}
			</>
		),
	};
}
