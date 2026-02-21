import type { WithoutInteractionStates } from "@/core/themes";
import { createComponentThemeTypes } from "@/core/themes/createComponentThemeTypes";
import { createComponentVisualTypes } from "@/core/themes/createComponentVisualTypes";
import { useComponentTheme } from "@/hooks/useComponentTheme";
import React, { ReactNode } from "react";
import { Scrollbar } from "react-scrollbars-custom";
import { Box, BoxProps, boxVisual } from "../Box/Box";
import { normalizeVisualValue } from "../Box/createVisualStyle";

const scrollAreaTrackVisual = createComponentVisualTypes({
	style: {
		...boxVisual.style,
		size: undefined as string | number | undefined,
	},
	interactionAllowedKeys: [...boxVisual.interactionAllowedKeys] as const,
});

const scrollAreaTrackThemeTypes = createComponentThemeTypes({
	base: scrollAreaTrackVisual.types.VisualStyle,
	interactionAllowedKeys: scrollAreaTrackVisual.interactionAllowedKeys,
});

export type ScrollAreaTrackTheme = typeof scrollAreaTrackThemeTypes.types.Theme;

const scrollAreaThumbVisual = createComponentVisualTypes({
	style: {
		...boxVisual.style,
		size: undefined as string | number | undefined,
	},
	interactionAllowedKeys: [...boxVisual.interactionAllowedKeys] as const,
});

const scrollAreaThumbThemeTypes = createComponentThemeTypes({
	base: scrollAreaThumbVisual.types.VisualStyle,
	interactionAllowedKeys: scrollAreaThumbVisual.interactionAllowedKeys,
});

export type ScrollAreaThumbTheme = typeof scrollAreaThumbThemeTypes.types.Theme;

export type ScrollAreaScrollState = {
	scrollTop: number;
	scrollLeft: number;
	scrollHeight: number;
	scrollWidth: number;
	clientHeight: number;
	clientWidth: number;
};

const isScrollAreaScrollState = (
	value: unknown
): value is ScrollAreaScrollState => {
	if (!value || typeof value !== "object") return false;
	const candidate = value as Record<string, unknown>;
	return (
		typeof candidate.scrollTop === "number" &&
		typeof candidate.scrollLeft === "number" &&
		typeof candidate.scrollHeight === "number" &&
		typeof candidate.scrollWidth === "number" &&
		typeof candidate.clientHeight === "number" &&
		typeof candidate.clientWidth === "number"
	);
};

export type ScrollAreaOnScroll = (
	scrollValues: ScrollAreaScrollState,
	prevScrollState: ScrollAreaScrollState
) => void;

export type ScrollAreaOnScrollEdge = (
	scrollValues: ScrollAreaScrollState
) => void;

export interface ScrollAreaProps extends WithoutInteractionStates<BoxProps> {
	children?: ReactNode;
	noScrollX?: boolean;
	noScrollY?: boolean;
	noScroll?: boolean;
	permanentTrackX?: boolean;
	permanentTrackY?: boolean;
	permanentTracks?: boolean;
	onScroll?: ScrollAreaOnScroll;
	onScrollStart?: ScrollAreaOnScrollEdge;
	onScrollStop?: ScrollAreaOnScrollEdge;
}

export const ScrollArea: React.FC<ScrollAreaProps> = (props) => {
	const { children, ...rest } = props;
	const trackTheme = useComponentTheme<
		"ScrollAreaTrack",
		ScrollAreaTrackTheme
	>("ScrollAreaTrack", {}).sx;
	const thumbTheme = useComponentTheme<
		"ScrollAreaThumb",
		ScrollAreaThumbTheme
	>("ScrollAreaThumb", {}).sx;

	if (!trackTheme.size) trackTheme.size = "10px";
	if (!thumbTheme.size) thumbTheme.size = "10px";
	const trackGap = trackTheme.size;

	const handleScroll = rest.onScroll
		? ((eventOrValues: unknown, prevValues?: unknown) => {
				if (!rest.onScroll) return;
				if (isScrollAreaScrollState(eventOrValues)) {
					const prevScrollState = isScrollAreaScrollState(prevValues)
						? prevValues
						: eventOrValues;
					rest.onScroll(eventOrValues, prevScrollState);
				}
		  }) as React.UIEventHandler<HTMLDivElement> & ScrollAreaOnScroll
		: undefined;

	const handleScrollStart = rest.onScrollStart
		? ((values: unknown) => {
				if (isScrollAreaScrollState(values)) {
					rest.onScrollStart?.(values);
				}
		  }) as ScrollAreaOnScrollEdge
		: undefined;

	const handleScrollStop = rest.onScrollStop
		? ((values: unknown) => {
				if (isScrollAreaScrollState(values)) {
					rest.onScrollStop?.(values);
				}
		  }) as ScrollAreaOnScrollEdge
		: undefined;

	// This code snaps the scroll position to the block size.
	// It works, but makes it feel very unnatural.
	// const scrollRef = useRef(null);
	// const scrollPosition = useRef(0);
	// const snapInterval = 2;
	// useEffect(() => {
	// 	const scrollEl = scrollRef.current?.contentElement; // Access inner scrollable element
	// 	if (!scrollEl) return;

	// 	const handleWheel = (e) => {
	// 		console.log("wheel");
	// 		e.preventDefault(); // Prevent default scrolling
	// 		const delta = e.deltaY > 0 ? snapInterval : -snapInterval;
	// 		scrollPosition.current = Math.max(
	// 			0,
	// 			scrollPosition.current + delta
	// 		);
	// 		scrollRef.current?.scrollTo(undefined, scrollPosition.current);
	// 	};

	// 	scrollPosition.current = scrollEl.scrollTop;

	// 	scrollEl.addEventListener("wheel", handleWheel, { passive: false });

	// 	return () => {
	// 		scrollEl.removeEventListener("wheel", handleWheel);
	// 	};
	// }, [snapInterval]);

	return (
		<Scrollbar
			noScrollX={rest.noScrollX}
			noScrollY={rest.noScrollY}
			noScroll={rest.noScroll}
			permanentTrackX={rest.permanentTrackX}
			permanentTrackY={rest.permanentTrackY}
			permanentTracks={rest.permanentTracks}
			onScroll={handleScroll}
			onScrollStart={handleScrollStart}
			onScrollStop={handleScrollStop}
			/*ref={scrollRef}*/ style={{ flex: 1 }}
			trackYProps={{
				renderer: (props) => {
					const { elementRef, style, ...restProps } = props;
					return (
						<Box
							{...restProps}
							ref={elementRef}
							sx={{
								...trackTheme,
								width: trackTheme.size,
							}}
							containerProps={{
								style: {
									...style,
									borderRadius: 0,
									background: "transparent",
								},
							}}
						/>
					);
				},
			}}
			trackXProps={{
				renderer: (props) => {
					const { elementRef, style, ...restProps } = props;
					return (
						<Box
							{...restProps}
							ref={elementRef}
							sx={{
								...trackTheme,
								height: trackTheme.size,
							}}
							containerProps={{
								style: {
									...style,
									borderRadius: 0,
									background: "transparent",
								},
							}}
						/>
					);
				},
			}}
			thumbYProps={{
				renderer: (props) => {
					const { elementRef, style, ...restProps } = props;
					return (
						<Box
							{...restProps}
							ref={elementRef}
							sx={{
								...thumbTheme,
								width: thumbTheme.size,
							}}
							containerProps={{
								style: {
									...style,
									borderRadius: 0,
									background: "transparent",
									margin: "auto",
								},
							}}
						/>
					);
				},
			}}
			thumbXProps={{
				renderer: (props) => {
					const { elementRef, style, ...restProps } = props;
					return (
						<Box
							{...restProps}
							ref={elementRef}
							sx={{
								...thumbTheme,
								height: thumbTheme.size,
							}}
							containerProps={{
								style: {
									...style,
									borderRadius: 0,
									background: "transparent",
								},
							}}
						/>
					);
				},
			}}
			scrollerProps={{
				renderer: (props) => {
					const { elementRef, key, style, ...restProps } = props;
					const isVertical = style?.overflowY === "scroll";
					const isHorizontal = style?.overflowX === "scroll";
					return (
						<span
							key={key}
							{...restProps}
							style={{
								...style,
								paddingRight: isVertical
									? `calc(${normalizeVisualValue(trackGap, "gap")} + 10px)`
									: undefined,
								paddingBottom: isHorizontal
									? `calc(${normalizeVisualValue(trackGap, "gap")} + 10px)`
									: undefined,
							}}
							ref={elementRef}
						/>
					);
				},
			}}
		>
			{children}
		</Scrollbar>
	);
};
