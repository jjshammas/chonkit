import React, {
	ReactNode,
	useCallback,
	useRef,
	useMemo,
	useEffect,
} from "react";
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
import {
	resolveComponentVisualStyle,
	BreakpointKey,
} from "./createVisualStyle";
import { createComponentVisualTypes } from "@/core/themes/createComponentVisualTypes";
import styles from "./Box.module.css";
import clsx from "clsx";

export const boxVisual = createComponentVisualTypes({
	style: {
		borderRadius: undefined as
			| RoundedCornerClipProps["borderRadius"]
			| undefined,
		borderWidth: undefined as
			| FabricatedBorderProps["borderWidth"]
			| undefined,
		borderColor: undefined as
			| FabricatedBorderProps["borderColor"]
			| undefined,
		innerborderWidth: undefined as
			| FabricatedBorderProps["innerborderWidth"]
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

	// snap?: boolean;
	// snapMethod?: "transform" | "padding";

	[key: `data-${string}`]: any;
}

const cssAttributesToMoveToInner = [
	"padding",
	"paddingLeft",
	"paddingRight",
	"paddingTop",
	"paddingBottom",
	"flexDirection",
	"flexWrap",
	"flexFlow",
	"justifyContent",
	"alignItems",
	"alignContent",
	"gap",
	"gridTemplateColumns",
	"gridTemplateRows",
	"gridTemplateAreas",
	"gridAutoColumns",
	"gridAutoRows",
	"gridAutoFlow",
	"gridColumnGap",
	"gridRowGap",
	"gridGap",
	"placeItems",
	"placeContent",
];

export const Box: React.FC<BoxProps> = (props) => {
	const { theme, blockSize, viewportWidth } = useChonkit();

	// this is specifically memoized so that the resulting variables
	// like cssVariables don't change on every render
	// thus, allowing future memoized functions not to re-run
	const resolved = useMemo(
		() =>
			resolveComponentVisualStyle<BoxVisualStyle, BoxProps>({
				props,
				cssVariableKeys: [
					"depth",
					"depthColor",
					...boxVisual.interactionAllowedKeys,
				],
				palette: theme.palette,
				breakpoints: theme.breakpoints,
			}),
		[props, theme.palette, theme.breakpoints]
	);
	const { cssVariables, cssBaseStyle, mediaQueryStyles } = resolved;
	const nonVisualRest = resolved.rest;

	// Helper to pick the appropriate breakpoint value
	function pickBreakpointValue<V>(
		value: V | Partial<Record<BreakpointKey, V>> | undefined,
		width: number
	): V | undefined {
		if (value == null) return undefined;
		if (typeof value === "object" && !Array.isArray(value)) {
			const order: BreakpointKey[] = [
				"xs",
				"sm",
				"md",
				"lg",
				"xl",
				"2xl",
			];
			// Convert BREAKPOINTS to numeric px
			const bpPx = (bp: BreakpointKey) => theme.breakpoints[bp];
			let selected: V | undefined = (value as any).xs as V | undefined;
			for (const bp of order) {
				const min = bpPx(bp);
				if (width >= min && (value as any)[bp] !== undefined) {
					selected = (value as any)[bp] as V;
				}
			}
			return selected;
		}
		return value as V;
	}

	const borderRadius = pickBreakpointValue<
		RoundedCornerClipProps["borderRadius"]
	>(resolved.renderValues.borderRadius as any, viewportWidth);
	const borderWidth = pickBreakpointValue<
		FabricatedBorderProps["borderWidth"]
	>(resolved.renderValues.borderWidth as any, viewportWidth);
	const borderColor = pickBreakpointValue<
		FabricatedBorderProps["borderColor"]
	>(resolved.renderValues.borderColor as any, viewportWidth);
	const innerBorderColor = pickBreakpointValue<
		FabricatedBorderProps["innerBorderColor"]
	>(resolved.renderValues.innerBorderColor as any, viewportWidth);
	const innerborderWidth = pickBreakpointValue<
		FabricatedBorderProps["innerborderWidth"]
	>(resolved.renderValues.innerborderWidth as any, viewportWidth);
	const bevelHighlightSize = pickBreakpointValue<BevelProps["highlightSize"]>(
		resolved.renderValues.bevelHighlightSize as any,
		viewportWidth
	);
	const bevelShadowSize = pickBreakpointValue<BevelProps["shadowSize"]>(
		resolved.renderValues.bevelShadowSize as any,
		viewportWidth
	);
	const embossHighlightSize = pickBreakpointValue<
		EmbossProps["highlightSize"]
	>(resolved.renderValues.embossHighlightSize as any, viewportWidth);
	const embossShadowSize = pickBreakpointValue<EmbossProps["shadowSize"]>(
		resolved.renderValues.embossShadowSize as any,
		viewportWidth
	);
	const dropShadow = pickBreakpointValue<ShadowProps["dropShadow"]>(
		resolved.renderValues.dropShadow as any,
		viewportWidth
	);
	const depth = pickBreakpointValue<DepthProps["depth"]>(
		resolved.renderValues.depth as any,
		viewportWidth
	);
	const depthColor = pickBreakpointValue<DepthProps["depthColor"]>(
		resolved.renderValues.depthColor as any,
		viewportWidth
	);

	const {
		ref: forwardedRef,
		as,
		children,
		containerProps,
		...rest
		// color resolution should already happen in the visual style
		// } = useResolvedColorProps(nonVisualRest);
	} = nonVisualRest;

	// blockSize already from context above
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

	// Generate a unique ID for this instance to scope media queries
	const instanceId = useMemo(
		() => `box-${Math.random().toString(36).slice(2, 9)}`,
		[]
	);

	// Create media query styles, splitting outer and inner as needed
	const mediaQueryContent = useMemo(() => {
		const breakpointEntries = (
			Object.entries(mediaQueryStyles) as Array<
				[BreakpointKey, React.CSSProperties]
			>
		).filter(([_, styleObject]) => Object.keys(styleObject).length > 0);

		if (breakpointEntries.length === 0) return "";

		let css = "";
		for (const [breakpoint, styleObject] of breakpointEntries) {
			if (breakpoint === "xs") continue; // xs is already applied in base style
			const minWidth = theme.breakpoints[breakpoint as BreakpointKey];

			// Split styles into outer and inner
			const outerStyles: Record<string, string> = {};
			const innerStyles: Record<string, string> = {};

			for (const [key, value] of Object.entries(styleObject)) {
				const cssKey = key.replace(
					/([A-Z])/g,
					(match) => `-${match.toLowerCase()}`
				);
				if (cssAttributesToMoveToInner.includes(key)) {
					innerStyles[cssKey] = value as string;
				} else {
					outerStyles[cssKey] = value as string;
				}
			}

			const outerString = Object.entries(outerStyles)
				.map(([k, v]) => `${k}: ${v}`)
				.join("; ");
			const innerString = Object.entries(innerStyles)
				.map(([k, v]) => `${k}: ${v}`)
				.join("; ");

			if (outerString) {
				css += `@media (min-width: ${minWidth}px) { .${instanceId} { ${outerString} } }`;
			}
			if (innerString) {
				css += `@media (min-width: ${minWidth}px) { .${instanceId} > .${styles.inner} { ${innerString} } }`;
			}
		}
		return css;
	}, [
		mediaQueryStyles,
		instanceId,
		theme.breakpoints,
		cssAttributesToMoveToInner,
	]);

	// Inject media query styles and clean up on unmount
	useEffect(() => {
		if (!mediaQueryContent) return;
		const styleId = `${instanceId}-media-queries`;
		let styleEl = document.getElementById(
			styleId
		) as HTMLStyleElement | null;
		if (!styleEl) {
			styleEl = document.createElement("style");
			styleEl.id = styleId;
			document.head.appendChild(styleEl);
		}
		styleEl.textContent = mediaQueryContent;
		return () => {
			styleEl?.remove();
		};
	}, [mediaQueryContent, instanceId]);

	const shouldFabricateBorder =
		borderWidth && borderRadius && !innerborderWidth;

	const geometry = useGeometryObserver(ref);
	useRoundedCornerClip(innerRef, { borderRadius }, geometry);
	const { fabricatedBorderEl } = useFabricatedBorder(
		ref,
		{
			borderRadius,
			borderWidth,
			borderColor,
			innerBorderColor,
			innerborderWidth,
		},
		geometry
	);
	const { bevelHighlightEl, bevelShadowEl } = useBevel(
		ref,
		{
			borderRadius,
			borderWidth,
			highlightSize: bevelHighlightSize,
			shadowSize: bevelShadowSize,
		},
		geometry
	);
	const { embossHighlightEl, embossShadowEl } = useEmboss(
		ref,
		{
			borderRadius,
			borderWidth,
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
		{
			gradient: pickBreakpointValue<GradientProps["gradient"]>(
				(props.sx as any)?.backgroundGradient,
				viewportWidth
			),
		},
		geometry
	);
	const { depthEl } = useDepth(
		ref,
		{ borderRadius, depth, depthColor },
		geometry
	);

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
			className: clsx(
				styles.container,
				instanceId,
				containerProps?.className
			),
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
						borderWidth && !shouldFabricateBorder
							? `inset 0 0 0 ${
									blockSize * borderWidth
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
