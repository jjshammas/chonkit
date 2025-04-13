import React, { ReactNode, useRef } from "react";
import { useChonkit } from "@/core/ChonkitProvider/ChonkitProvider";
import { useGeometryObserver } from "./useGeometryObserver";
import { useFabricatedBorder } from "./useFabricatedBorder";
import {
	useRoundedCornerClip,
	RoundedCornerClipProps,
} from "./useRoundedCornerClip";
import { useBevel } from "./useBevel";
import styles from "./Box.module.css";
import { useEmboss } from "./useEmboss";
import { useShadow, ShadowProps } from "./useShadow";
import { useResolvedColorProps } from "@/hooks/useResolvedColor";
import { resolveComponentVisualStyle } from "./createVisualStyle";
import { createComponentVisualTypes } from "@/core/themes/createComponentVisualTypes";

export const boxVisual = createComponentVisualTypes({
	style: {
		backgroundColor: undefined as string | undefined,
		color: undefined as string | undefined,
		borderRadius: undefined as
			| RoundedCornerClipProps["borderRadius"]
			| undefined,
	},
	interactionAllowedKeys: ["backgroundColor", "color"] as const,
});

export type BoxVisualStyle = typeof boxVisual.types.VisualStyle;
export type BoxVisualProps = typeof boxVisual.types.Props;

export interface BoxProps
	extends Omit<React.HTMLAttributes<HTMLDivElement>, keyof BoxVisualProps>,
		BoxVisualProps,
		Omit<ShadowProps, "borderRadius"> {
	as?: React.ElementType;
	children?: ReactNode;
	containerProps?: React.HTMLAttributes<HTMLDivElement> & {
		[key: `data-${string}`]: any;
	};

	snap?: boolean;
	snapMethod?: "transform" | "padding";

	borderSize?: number;
	borderColor?: string;

	bevelHighlightSize?: number;
	bevelShadowSize?: number;
	embossHighlightSize?: number;
	embossShadowSize?: number;

	[key: `data-${string}`]: any;
}

export const Box: React.FC<BoxProps> = (props) => {
	const {
		renderValues: { borderRadius },
		cssVariables,
		rest: nonVisualRest,
	} = resolveComponentVisualStyle<BoxVisualStyle>({
		props,
		keys: boxVisual.baseKeys,
		palette: useChonkit().theme.palette,
	});

	const {
		as,
		children,
		containerProps,
		snap,
		snapMethod = "transform",
		borderSize: rawBorderSize,
		borderColor,
		bevelHighlightSize: rawBevelHighlightSize,
		bevelShadowSize: rawBevelShadowSize,
		embossHighlightSize: rawEmbossHighlightSize,
		embossShadowSize: rawEmbossShadowSize,
		dropShadow,
		...rest
	} = useResolvedColorProps(nonVisualRest);

	const clampValue = (value?: number) =>
		value !== undefined ? Math.max(value, 0) : undefined;
	const borderSize = clampValue(rawBorderSize);
	const bevelHighlightSize = clampValue(rawBevelHighlightSize);
	const bevelShadowSize = clampValue(rawBevelShadowSize);
	const embossHighlightSize = clampValue(rawEmbossHighlightSize);
	const embossShadowSize = clampValue(rawEmbossShadowSize);

	const { blockSize } = useChonkit();
	const ref = useRef<HTMLDivElement>(null);
	const innerRef = useRef<HTMLDivElement>(null);

	const shouldFabricateBorder = borderSize && borderRadius;

	const geometry = useGeometryObserver(ref);
	useRoundedCornerClip(innerRef, { borderRadius }, geometry);
	const { fabricatedBorderEl } = useFabricatedBorder(
		ref,
		{ borderRadius, borderSize, borderColor },
		geometry
	);
	const { bevelHighlightEl, bevelShadowEl } = useBevel(
		ref,
		{
			borderRadius,
			borderSize,
			highlightSize: bevelHighlightSize,
			shadowSize: bevelShadowSize,
		},
		geometry
	);
	const { embossHighlightEl, embossShadowEl } = useEmboss(
		ref,
		{
			borderRadius,
			borderSize,
			highlightSize: embossHighlightSize,
			shadowSize: embossShadowSize,
		},
		geometry
	);
	const { shadow } = useShadow(
		ref,
		{
			borderRadius,
			dropShadow,
		},
		geometry
	);

	return React.createElement(
		as || "div",
		{
			...containerProps,
			ref,
			className: `${styles.container} ${containerProps?.className}`,
			style: cssVariables,
		},
		<>
			<div
				ref={innerRef}
				{...rest}
				className={`${styles.inner} ${rest.className}`}
				style={{
					...rest.style,

					// if there's a border, but no rounded corner, we can use a box shadow for the border
					boxShadow:
						borderSize && !shouldFabricateBorder
							? `inset 0 0 0 ${
									blockSize * borderSize
							  }px ${borderColor}`
							: undefined,
				}}
			>
				{fabricatedBorderEl}
				{bevelHighlightEl}
				{bevelShadowEl}
				{children}
			</div>
			{embossHighlightEl}
			{embossShadowEl}
			{shadow}
		</>
	);
};
