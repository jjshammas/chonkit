import { useChonkit } from "@/core/ChonkitProvider/ChonkitProvider";
import { createComponentVisualTypes } from "@/core/themes/createComponentVisualTypes";
import clsx from "clsx";
import React, {
	ReactNode,
	useCallback,
	useInsertionEffect,
	useMemo,
	useRef,
} from "react";
import styles from "./Box.module.css";
import {
	BreakpointKey,
	resolveComponentVisualStyle,
} from "./createVisualStyle";
import { BevelProps, useBevel } from "./useBevel";
import { DepthProps, useDepth } from "./useDepth";
import { EmbossProps, useEmboss } from "./useEmboss";
import {
	FabricatedBorderProps,
	useFabricatedBorder,
} from "./useFabricatedBorder";
import { useGeometryObserver } from "./useGeometryObserver";
import { GradientProps, useGradient } from "./useGradient";
import {
	RoundedCornerClipProps,
	useRoundedCornerClip,
} from "./useRoundedCornerClip";
import { ShadowProps, useShadow } from "./useShadow";

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
		innerBorderWidth: undefined as
			| FabricatedBorderProps["innerBorderWidth"]
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
	showWhileGeometryUnknown?: boolean;
	/** Opt-in: Read geometry synchronously on mount. Use only for boxes needing immediate geometry (animations, layout). Default false for performance. */
	immediateGeometry?: boolean;

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
	"backgroundImage",
	"backgroundPosition",
	"backgroundSize",
	"backgroundRepeat",
	"backgroundOrigin",
	"backgroundClip",
	"backgroundAttachment",
	"backgroundColor",
	"background",
];

// Use a Set for O(1) membership checks when splitting styles
const cssAttributesMovedToInnerSet = new Set(cssAttributesToMoveToInner);

// Props consumed by hooks that should not leak to DOM CSS
const hookConsumedProps = new Set([
	"borderRadius",
	"borderWidth",
	"borderColor",
	"innerBorderWidth",
	"innerBorderColor",
	"embossHighlightSize",
	"embossShadowSize",
	"bevelHighlightSize",
	"bevelShadowSize",
	"dropShadow",
	"backgroundGradient",
	"depth",
	"depthColor",
]);

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

	// toBlockUnits and toBlockRadius were added to extract the value back out of the computed strings for use cases like: I put in "6px" as my borderRadius but the borderRadius hook needs the value in block units. We may want to instead modify resolveComponentVisualStyle to return both the raw value and the computed CSS variable, but this felt less invasive for now.
	type BlockUnitValue = number | string;

	const toBlockUnits = (
		value: BlockUnitValue | undefined,
		currentBlockSize: number
	): number | undefined => {
		if (value == null) return undefined;
		if (typeof value === "number") return value;
		const match = value.trim().match(/^(-?\d+(?:\.\d+)?)px$/);
		if (!match) return undefined;
		const pxValue = Number(match[1]);
		if (Number.isNaN(pxValue) || currentBlockSize <= 0) return undefined;
		return Math.round(pxValue / currentBlockSize);
	};

	const toBlockRadius = (
		value:
			| RoundedCornerClipProps["borderRadius"]
			| string
			| BlockUnitValue[]
			| undefined,
		currentBlockSize: number
	): RoundedCornerClipProps["borderRadius"] | undefined => {
		if (value == null) return undefined;
		if (Array.isArray(value)) {
			const normalized = value.map((entry) =>
				toBlockUnits(entry, currentBlockSize)
			);
			if (normalized.some((entry) => entry == null)) return undefined;
			return normalized as number[];
		}
		return toBlockUnits(value, currentBlockSize);
	};

	const pickedValues = useMemo(() => {
		return {
			borderRadius: toBlockRadius(
				pickBreakpointValue<RoundedCornerClipProps["borderRadius"]>(
					resolved.renderValues.borderRadius as any,
					viewportWidth
				),
				blockSize
			),
			borderWidth: toBlockUnits(
				pickBreakpointValue<FabricatedBorderProps["borderWidth"]>(
					resolved.renderValues.borderWidth as any,
					viewportWidth
				),
				blockSize
			),
			borderColor: pickBreakpointValue<
				FabricatedBorderProps["borderColor"]
			>(resolved.renderValues.borderColor as any, viewportWidth),
			innerBorderColor: pickBreakpointValue<
				FabricatedBorderProps["innerBorderColor"]
			>(resolved.renderValues.innerBorderColor as any, viewportWidth),
			innerBorderWidth: toBlockUnits(
				pickBreakpointValue<FabricatedBorderProps["innerBorderWidth"]>(
					resolved.renderValues.innerBorderWidth as any,
					viewportWidth
				),
				blockSize
			),
			bevelHighlightSize: toBlockUnits(
				pickBreakpointValue<BevelProps["highlightSize"]>(
					resolved.renderValues.bevelHighlightSize as any,
					viewportWidth
				),
				blockSize
			),
			bevelShadowSize: toBlockUnits(
				pickBreakpointValue<BevelProps["shadowSize"]>(
					resolved.renderValues.bevelShadowSize as any,
					viewportWidth
				),
				blockSize
			),
			embossHighlightSize: toBlockUnits(
				pickBreakpointValue<EmbossProps["highlightSize"]>(
					resolved.renderValues.embossHighlightSize as any,
					viewportWidth
				),
				blockSize
			),
			embossShadowSize: toBlockUnits(
				pickBreakpointValue<EmbossProps["shadowSize"]>(
					resolved.renderValues.embossShadowSize as any,
					viewportWidth
				),
				blockSize
			),
			dropShadow: pickBreakpointValue<ShadowProps["dropShadow"]>(
				resolved.renderValues.dropShadow as any,
				viewportWidth
			),
			depth: toBlockUnits(
				pickBreakpointValue<DepthProps["depth"]>(
					resolved.renderValues.depth as any,
					viewportWidth
				),
				blockSize
			),
			depthColor: pickBreakpointValue<DepthProps["depthColor"]>(
				resolved.renderValues.depthColor as any,
				viewportWidth
			),
			backgroundGradient: pickBreakpointValue<GradientProps["gradient"]>(
				(props.sx as any)?.backgroundGradient,
				viewportWidth
			),
		};
	}, [resolved.renderValues, viewportWidth, blockSize]);

	const {
		borderRadius,
		borderWidth,
		borderColor,
		innerBorderColor,
		innerBorderWidth,
		bevelHighlightSize,
		bevelShadowSize,
		embossHighlightSize,
		embossShadowSize,
		dropShadow,
		depth,
		depthColor,
		backgroundGradient,
	} = pickedValues;

	const {
		ref: forwardedRef,
		as,
		children,
		containerProps,
		className,
		style,
		showWhileGeometryUnknown,
		immediateGeometry,
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
				// Skip hook-consumed props
				if (hookConsumedProps.has(key)) continue;

				const cssKey = key.replace(
					/([A-Z])/g,
					(match) => `-${match.toLowerCase()}`
				);
				if (cssAttributesMovedToInnerSet.has(key)) {
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
	}, [mediaQueryStyles, instanceId, theme.breakpoints]);

	// Inject media query styles and clean up on unmount
	useInsertionEffect(() => {
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
		borderWidth && borderRadius && !innerBorderWidth;

	// Determine if this box will need geometry for any effects
	const needsGeometry = !!(
		bevelHighlightSize ||
		bevelShadowSize ||
		embossHighlightSize ||
		embossShadowSize ||
		dropShadow ||
		depth ||
		borderRadius ||
		dropShadow ||
		backgroundGradient
	);

	const geometry = useGeometryObserver(ref, { immediateGeometry });
	useRoundedCornerClip(
		innerRef,
		{ borderRadius, showWhileGeometryUnknown },
		geometry
	);
	const { fabricatedBorderEl } = useFabricatedBorder(
		ref,
		{
			borderRadius,
			borderWidth,
			borderColor,
			innerBorderColor,
			innerBorderWidth,
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
			gradient: backgroundGradient,
		},
		geometry
	);
	const { depthEl } = useDepth(
		ref,
		{ borderRadius, depth, depthColor },
		geometry
	);

	const cssBaseStyleOuter = useMemo(
		() =>
			Object.fromEntries(
				Object.entries(cssBaseStyle).filter(
					([key]) =>
						!cssAttributesMovedToInnerSet.has(key) &&
						!hookConsumedProps.has(key)
				)
			),
		[cssBaseStyle]
	);
	const cssBaseStyleInner = useMemo(
		() =>
			Object.fromEntries(
				Object.entries(cssBaseStyle).filter(
					([key]) =>
						cssAttributesMovedToInnerSet.has(key) &&
						!hookConsumedProps.has(key)
				)
			),
		[cssBaseStyle]
	);

	return React.createElement(
		as || "div",
		{
			...containerProps,
			ref: setRef,
			className: clsx(
				styles.container,
				instanceId,
				needsGeometry &&
					!immediateGeometry &&
					(showWhileGeometryUnknown
						? "geometry-unknown-show"
						: "geometry-unknown"),
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
				className={clsx(styles.inner, className)}
				style={{
					...cssBaseStyleInner,
					...style,

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
