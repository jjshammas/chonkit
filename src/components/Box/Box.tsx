import React, { ReactNode, useCallback, useRef } from "react";
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
import { useDepth, DepthProps } from "./useDepth";
import { resolveComponentVisualStyle } from "./createVisualStyle";
import { createComponentVisualTypes } from "@/core/themes/createComponentVisualTypes";
import styles from "./Box.module.css";
import clsx from "clsx";

export const boxVisual = createComponentVisualTypes({
	style: {
		borderRadius: undefined as
			| RoundedCornerClipProps["borderRadius"]
			| undefined,
		borderSize: undefined as
			| FabricatedBorderProps["borderSize"]
			| undefined,
		borderColor: undefined as
			| FabricatedBorderProps["borderColor"]
			| undefined,
		innerBorderSize: undefined as
			| FabricatedBorderProps["innerBorderSize"]
			| undefined,
		innerBorderColor: undefined as
			| FabricatedBorderProps["innerBorderColor"]
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
		depth: undefined as DepthProps["depth"] | undefined,
		depthColor: undefined as DepthProps["depthColor"] | undefined,
	},
	interactionAllowedKeys: [
		"backgroundColor",
		"color",
		"borderColor",
		"innerBorderColor",
		"depth",
	] as const,
});

export type BoxVisualStyle = typeof boxVisual.types.VisualStyle;
export type BoxVisualProps = typeof boxVisual.types.Props;

export interface BoxProps
	extends React.HTMLAttributes<HTMLDivElement>,
		BoxVisualProps {
	ref?: React.Ref<HTMLDivElement>;
	as?: React.ElementType | string;
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
			innerBorderColor,
			innerBorderSize,
			bevelHighlightSize,
			bevelShadowSize,
			embossHighlightSize,
			embossShadowSize,
			dropShadow,
			depth,
			depthColor,
		},
		cssVariables,
		cssBaseStyle,
		rest: nonVisualRest,
	} = resolveComponentVisualStyle<BoxVisualStyle, BoxProps>({
		props,
		cssVariableKeys: [
			"depth",
			"depthColor",
			...boxVisual.interactionAllowedKeys,
		],
		palette: useChonkit().theme.palette,
	});

	const {
		ref: forwardedRef,
		as,
		children,
		containerProps,
		...rest
		// color resolution should already happen in the visual style
		// } = useResolvedColorProps(nonVisualRest);
	} = nonVisualRest;

	const { blockSize } = useChonkit();
	const ref = useRef<HTMLDivElement>(null);
	const setRef = useCallback(
		(node: HTMLDivElement | null) => {
			ref.current = node;

			if (typeof forwardedRef === "function") {
				forwardedRef(node);
			} else if (forwardedRef && "current" in forwardedRef) {
				forwardedRef.current = node;
			}
		},
		[forwardedRef]
	);
	const innerRef = useRef<HTMLDivElement>(null);

	const shouldFabricateBorder =
		borderSize && borderRadius && !innerBorderSize;

	const geometry = useGeometryObserver(ref);
	useRoundedCornerClip(innerRef, { borderRadius }, geometry);
	const { fabricatedBorderEl } = useFabricatedBorder(
		ref,
		{
			borderRadius,
			borderSize,
			borderColor,
			innerBorderColor,
			innerBorderSize,
		},
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
		{ gradient: props.sx?.backgroundGradient },
		geometry
	);
	const { depthEl } = useDepth(
		ref,
		{ borderRadius, depth, depthColor },
		geometry
	);

	const cssAttributesToMoveToInner = [
		"padding",
		"paddingLeft",
		"paddingRight",
		"paddingTop",
		"paddingBottom",
	];
	const cssBaseStyleOuter = Object.fromEntries(
		Object.entries(cssBaseStyle).filter(
			([key]) => !cssAttributesToMoveToInner.includes(key)
		)
	);
	const cssBaseStyleInner = Object.fromEntries(
		Object.entries(cssBaseStyle).filter(([key]) =>
			cssAttributesToMoveToInner.includes(key)
		)
	);

	return React.createElement(
		as || "div",
		{
			...containerProps,
			ref: setRef,
			className: clsx(styles.container, containerProps?.className),
			style: {
				...cssVariables,
				...cssBaseStyleOuter,
				...containerProps?.style,
			},
		},
		<>
			<div
				ref={innerRef}
				{...rest}
				className={clsx(styles.inner, rest.className)}
				style={{
					...cssBaseStyleInner,
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
			{depthEl}
			{embossHighlightEl}
			{embossShadowEl}
			{shadow}
		</>
	);
};
