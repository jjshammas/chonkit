import React, { ReactNode, useRef } from "react";
import { useChonkit } from "@/core/ChonkitProvider/ChonkitProvider";
import { useGeometryObserver } from "./useGeometryObserver";
import {
	useFabricatedBorder,
	FabricatedBorderProps,
} from "./useFabricatedBorder";
import {
	useRoundedCornerClip,
	RoundedCornerClipProps,
} from "./useRoundedCornerClip";
import { useBevel, BevelProps } from "./useBevel";
import { useEmboss, EmbossProps } from "./useEmboss";
import { useShadow, ShadowProps } from "./useShadow";
import { useGradient, GradientProps } from "./useGradient";
import { useResolvedColorProps } from "@/hooks/useResolvedColor";
import { resolveComponentVisualStyle } from "./createVisualStyle";
import { createComponentVisualTypes } from "@/core/themes/createComponentVisualTypes";
import styles from "./Box.module.css";

export const boxVisual = createComponentVisualTypes({
	style: {
		backgroundColor: undefined as string | undefined,
		color: undefined as string | undefined,
		borderRadius: undefined as
			| RoundedCornerClipProps["borderRadius"]
			| undefined,
		borderSize: undefined as
			| FabricatedBorderProps["borderSize"]
			| undefined,
		borderColor: undefined as
			| FabricatedBorderProps["borderColor"]
			| undefined,
		embossHighlightSize: undefined as
			| EmbossProps["highlightSize"]
			| undefined,
		embossShadowSize: undefined as EmbossProps["shadowSize"] | undefined,
		bevelHighlightSize: undefined as
			| BevelProps["highlightSize"]
			| undefined,
		bevelShadowSize: undefined as BevelProps["shadowSize"] | undefined,
		dropShadow: undefined as ShadowProps["dropShadow"] | undefined,
		backgroundGradient: undefined as GradientProps["gradient"] | undefined,
	},
	interactionAllowedKeys: [
		"backgroundColor",
		"color",
		"borderColor",
	] as const,
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

	[key: `data-${string}`]: any;
}

export const Box: React.FC<BoxProps> = (props) => {
	const {
		renderValues: {
			borderRadius,
			borderSize,
			borderColor,
			bevelHighlightSize,
			bevelShadowSize,
			embossHighlightSize,
			embossShadowSize,
			dropShadow,
		},
		cssVariables,
		rest: nonVisualRest,
	} = resolveComponentVisualStyle<BoxVisualStyle, BoxProps>({
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
		...rest
	} = useResolvedColorProps(nonVisualRest);

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
	const { gradientEl } = useGradient(
		ref,
		{ gradient: props.backgroundGradient },
		geometry
	);

	return React.createElement(
		as || "div",
		{
			...containerProps,
			ref,
			className: `${styles.container} ${containerProps?.className}`,
			style: {
				...cssVariables,
				...containerProps?.style,
			},
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
				{gradientEl}
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
