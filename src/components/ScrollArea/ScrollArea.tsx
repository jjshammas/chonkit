import React, { ReactNode, useEffect, useRef } from "react";
import { Box, BoxProps, boxVisual } from "../Box/Box";
import { useComponentTheme } from "@/hooks/useComponentTheme";
import type { WithoutInteractionStates } from "@/core/themes";
import { createComponentVisualTypes } from "@/core/themes/createComponentVisualTypes";
import { createComponentThemeTypes } from "@/core/themes/createComponentThemeTypes";
import clsx from "clsx";
import { Scrollbar } from "react-scrollbars-custom";
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

export interface ScrollAreaProps extends WithoutInteractionStates<BoxProps> {
	children?: ReactNode;
}

export const ScrollArea: React.FC<ScrollAreaProps> = (props) => {
	const { children, ...rest } = props;
	const trackTheme = useComponentTheme<
		"ScrollAreaTrack",
		ScrollAreaTrackTheme
	>("ScrollAreaTrack", {});
	const thumbTheme = useComponentTheme<
		"ScrollAreaThumb",
		ScrollAreaThumbTheme
	>("ScrollAreaThumb", {});

	if (!trackTheme.size) trackTheme.size = "10px";
	if (!thumbTheme.size) thumbTheme.size = "10px";
	const trackGap = trackTheme.size;

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
			/*ref={scrollRef}*/ style={{ flex: 1 }}
			trackYProps={{
				renderer: (props) => {
					const { elementRef, style, ...restProps } = props;
					return (
						<Box
							{...restProps}
							{...trackTheme}
							ref={elementRef}
							width={trackTheme.size}
							containerProps={{
								style: {
									...style,
									borderRadius: 0,
									background: "transparent",
									width: undefined,
								},
							}}
						/>
					);
				},
			}}
			trackXProps={{
				renderer: (props) => {
					console.log("rendering track X");
					const { elementRef, style, ...restProps } = props;
					return (
						<Box
							{...restProps}
							{...trackTheme}
							ref={elementRef}
							height={trackTheme.size}
							containerProps={{
								style: {
									...style,
									borderRadius: 0,
									background: "transparent",
									height: undefined,
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
							{...thumbTheme}
							ref={elementRef}
							width={thumbTheme.size}
							containerProps={{
								style: {
									...style,
									borderRadius: 0,
									background: "transparent",
									width: undefined,
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
					console.log(props);
					return (
						<Box
							{...restProps}
							{...thumbTheme}
							ref={elementRef}
							height={thumbTheme.size}
							containerProps={{
								style: {
									...style,
									borderRadius: 0,
									background: "transparent",
									height: undefined,
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
									? `calc(${normalizeVisualValue(trackGap)} + 10px)`
									: undefined,
								paddingBottom: isHorizontal
									? `calc(${normalizeVisualValue(trackGap)} + 10px)`
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
