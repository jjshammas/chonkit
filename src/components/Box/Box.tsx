import React, { ReactNode, useEffect, useRef, useState } from "react";
import { useChonkit } from "../ChonkitProvider/ChonkitProvider";
import {
	generateRoundedCornerPath,
	generateBorderPath,
	generateHighlightPath,
} from "../../utils/svg/circle-generator/circle-generator";
import styles from "./Box.module.css";

export interface BoxProps extends React.HTMLAttributes<HTMLDivElement> {
	as?: React.ElementType;
	children?: ReactNode;
	containerProps?: React.HTMLAttributes<HTMLDivElement>;

	borderRadius?: number;

	snap?: boolean;
	snapMethod?: "transform" | "padding";

	borderSize?: number;
	borderColor?: string;

	bevelHighlightSize?: number;
	bevelShadowSize?: number;
}

type SnapAdjustment = {
	x: number;
	y: number;
	width: number;
	height: number;
};

const getTransformForSnapAdj = (snapAdj: SnapAdjustment): string => {
	const { x, y, width, height } = snapAdj;
	return `translate(${x}px, ${y}px) scale(${width}, ${height})`;
};

const getSnapAdjFromTransform = (transform: string): SnapAdjustment => {
	if (!transform) return { x: -1, y: -1, width: 1, height: 1 };
	const match = transform.match(/translate\(([^)]+)\) scale\(([^)]+)\)/);
	if (!match) {
		throw new Error("Invalid transform string");
	}
	const [x, y] = match[1].split(",").map((val) => parseFloat(val));
	const [width, height] = match[2].split(",").map((val) => parseFloat(val));
	return {
		x,
		y,
		width,
		height,
	};
};

export const Box: React.FC<BoxProps> = ({
	as,
	children,
	containerProps,
	borderRadius: rawBorderRadius,
	snap,
	snapMethod = "transform",
	borderSize: rawBorderSize,
	borderColor,
	bevelHighlightSize: rawBevelHighlightSize,
	bevelShadowSize: rawBevelShadowSize,
	...rest
}) => {
	const clampValue = (value?: number) =>
		value !== undefined ? Math.max(value, 0) : undefined;
	const borderRadius = clampValue(rawBorderRadius);
	const borderSize = clampValue(rawBorderSize);
	const bevelHighlightSize = clampValue(rawBevelHighlightSize);
	const bevelShadowSize = clampValue(rawBevelShadowSize);

	const { blockSize, rootAncestor } = useChonkit();
	const ref = useRef<HTMLDivElement>(null);
	const innerRef = useRef<HTMLDivElement>(null);
	const isInternalPositioningUpdate = useRef(false);

	const shouldMonitorItsSize =
		snap ||
		borderRadius !== undefined ||
		!!bevelHighlightSize ||
		!!bevelShadowSize;

	const shouldFabricateBorder = borderSize && borderRadius;
	const fabricatedBorder = useRef<HTMLDivElement>(null);

	const bevelHighlight = useRef<HTMLDivElement>(null);
	const bevelShadow = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!shouldMonitorItsSize) return;

		const el = ref.current;
		const elInner = innerRef.current;
		const root = rootAncestor.current;
		if (!el || !elInner || !root) return;

		const update = () => {
			if (isInternalPositioningUpdate.current) {
				isInternalPositioningUpdate.current = false;
				return; // Skip this update — it was caused by our own transform
			}

			// determine current position and size of element
			const { width, height } = el.getBoundingClientRect();
			const elBox = el.getBoundingClientRect();
			const ancestorBox = root.getBoundingClientRect();
			const x = elBox.left - ancestorBox.left;
			const y = elBox.top - ancestorBox.top;

			// nudge the element to snap to the grid
			if (snap) {
				const existingSnapAdj = getSnapAdjFromTransform(
					el.style.transform
				);
				const xWithoutSnap = x - existingSnapAdj.x - 1;
				const yWithoutSnap = y - existingSnapAdj.y - 1;
				const widthWithoutSnap = width / existingSnapAdj.width;
				const heightWithoutSnap = height / existingSnapAdj.height;

				const nearestX =
					Math.round(xWithoutSnap / blockSize) * blockSize;
				const nearestY =
					Math.round(yWithoutSnap / blockSize) * blockSize;
				const nearestWidth =
					Math.round(widthWithoutSnap / blockSize) * blockSize;
				const nearestHeight =
					Math.round(heightWithoutSnap / blockSize) * blockSize;

				isInternalPositioningUpdate.current = true;
				el.style.transform = getTransformForSnapAdj({
					x: nearestX - xWithoutSnap + 1,
					y: nearestY - yWithoutSnap + 1,
					width:
						snapMethod === "transform"
							? nearestWidth / widthWithoutSnap
							: 1,
					height:
						snapMethod === "transform"
							? nearestHeight / heightWithoutSnap
							: 1,
				});
			}

			if (borderRadius !== undefined) {
				if (borderRadius > 0) {
					elInner.style.clipPath = `path('${generateRoundedCornerPath(
						borderRadius,
						blockSize,
						width,
						height
					)}')`;
				} else {
					elInner.style.clipPath = "none";
				}
			}

			// If there's a borderSize but not a border radius, it gets handled in the render
			// via an inset box shadow
			// This is only if we need to fabricate a border using SVG paths
			if (shouldFabricateBorder) {
				const borderClipPath = `path('${generateBorderPath(
					borderRadius,
					borderSize,
					blockSize,
					width,
					height
				)}')`;
				fabricatedBorder.current!.style.clipPath = borderClipPath;
			}

			if (bevelHighlightSize) {
				const highlightPath = `path('${generateHighlightPath(
					borderRadius || 0,
					borderSize || 0,
					blockSize,
					bevelHighlightSize,
					"top",
					width,
					height
				)}')`;
				bevelHighlight.current!.style.clipPath = highlightPath;
			}
			if (bevelShadowSize) {
				const shadowPath = `path('${generateHighlightPath(
					borderRadius || 0,
					borderSize || 0,
					blockSize,
					bevelShadowSize,
					"bottom",
					width,
					height
				)}')`;
				bevelShadow.current!.style.clipPath = shadowPath;
			}
		};

		update();
		const observer = new ResizeObserver(update);
		observer.observe(el);

		return () => observer.disconnect();
	}, [
		rootAncestor,
		blockSize,
		shouldMonitorItsSize,
		snap,
		borderRadius,
		borderSize,
		bevelHighlightSize,
		bevelShadowSize,
	]);

	return React.createElement(
		as || "div",
		{
			...containerProps,
			ref,
			style: {
				// if there's a border, but no rounded corner, we can use a box shadow for the border
				boxShadow:
					borderSize && !shouldFabricateBorder
						? `inset 0 0 0 ${
								blockSize * borderSize
						  }px ${borderColor}`
						: undefined,
				...containerProps?.style,
			},
			className: `${styles.container} ${containerProps?.className}`,
		},
		<div ref={innerRef} className={styles.inner} {...rest}>
			{shouldFabricateBorder && (
				<div
					ref={fabricatedBorder}
					style={{
						position: "absolute",
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						background: borderColor,
						pointerEvents: "none",
					}}
				></div>
			)}
			{!!bevelHighlightSize && (
				<div ref={bevelHighlight} className={styles.highlight}></div>
			)}
			{!!bevelShadowSize && (
				<div ref={bevelShadow} className={styles.shadow}></div>
			)}
			{children}
		</div>
	);
};
