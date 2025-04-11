import React, { ReactNode, useRef } from "react";
import { useChonkit } from "../ChonkitProvider/ChonkitProvider";
import { useGeometryObserver } from "./useGeometryObserver";
import { useFabricatedBorder } from "./useFabricatedBorder";
import { useRoundedCornerClip } from "./useRoundedCornerClip";
import { useBevel } from "./useBevel";
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
	embossHighlightSize?: number;
	embossShadowSize?: number;
}

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
	embossHighlightSize: rawEmbossHighlightSize,
	embossShadowSize: rawEmbossShadowSize,
	...rest
}) => {
	const clampValue = (value?: number) =>
		value !== undefined ? Math.max(value, 0) : undefined;
	const borderRadius = clampValue(rawBorderRadius);
	const borderSize = clampValue(rawBorderSize);
	const bevelHighlightSize = clampValue(rawBevelHighlightSize);
	const bevelShadowSize = clampValue(rawBevelShadowSize);
	const embossHighlightSize = clampValue(rawEmbossHighlightSize);
	const embossShadowSize = clampValue(rawEmbossShadowSize);

	const { blockSize, rootAncestor } = useChonkit();
	const ref = useRef<HTMLDivElement>(null);
	const innerRef = useRef<HTMLDivElement>(null);

	const shouldFabricateBorder = borderSize && borderRadius;

	const embossHighlight = useRef<HTMLDivElement>(null);
	const embossShadow = useRef<HTMLDivElement>(null);

	const geometry = useGeometryObserver(ref, rootAncestor);
	useRoundedCornerClip(ref, innerRef, { borderRadius, blockSize }, geometry);
	const { fabricatedBorderEl } = useFabricatedBorder(
		ref,
		{ borderRadius, borderSize, blockSize, borderColor },
		geometry
	);
	const { bevelHighlightEl, bevelShadowEl } = useBevel(
		ref,
		{
			borderRadius,
			borderSize,
			blockSize,
			highlightSize: bevelHighlightSize,
			shadowSize: bevelShadowSize,
		},
		geometry
	);

	return React.createElement(
		as || "div",
		{
			...containerProps,
			ref,
			style: {
				...containerProps?.style,

				// if there's a border, but no rounded corner, we can use a box shadow for the border
				boxShadow:
					borderSize && !shouldFabricateBorder
						? `inset 0 0 0 ${
								blockSize * borderSize
						  }px ${borderColor}`
						: undefined,

				// filter: [
				// 	// ...containerProps?.style?.filter,
				// 	embossShadowSize &&
				// 		`drop-shadow(0px ${
				// 			blockSize * -embossShadowSize
				// 		}px 0 var(--chonkit-shadow-color))`,
				// ]
				// 	.filter((x) => !!x)
				// 	.join(" "),
			},
			className: `${styles.container} ${containerProps?.className}`,
		},
		<>
			<div ref={innerRef} className={styles.inner} {...rest}>
				{fabricatedBorderEl}
				{bevelHighlightEl}
				{bevelShadowEl}
				{children}
			</div>
			{!!embossHighlightSize && (
				<div
					ref={embossHighlight}
					className={`${styles.highlight} ${styles.embossment}`}
					style={{
						bottom: `${blockSize * -embossHighlightSize}px`,
					}}
				></div>
			)}
			{!!embossShadowSize && (
				<div
					ref={embossShadow}
					className={`${styles.shadow} ${styles.embossment}`}
					style={{
						top: `${blockSize * -embossShadowSize}px`,
					}}
				></div>
			)}
		</>
	);
};
