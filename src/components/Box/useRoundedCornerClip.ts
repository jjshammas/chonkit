import { useChonkit } from "@/core/ChonkitProvider/ChonkitProvider";
import {
	convertPointsToPathString,
	generateRoundedCornerPoints,
} from "@/utils/svg/circle-generator/circle-generator";
import { useEffect, useLayoutEffect, useRef } from "react";
import type { GeometryObserver } from "./useGeometryObserver";

export type RoundedCornerClipProps = {
	borderRadius?: number | [number, number, number, number];
	showWhileGeometryUnknown?: boolean;
};

const roundedCornerPathCache = new Map<string, string>();
const MAX_ROUNDED_CORNER_CACHE = 200;

const getRadiiKey = (borderRadius: RoundedCornerClipProps["borderRadius"]) => {
	if (!borderRadius) return "none";
	return Array.isArray(borderRadius)
		? borderRadius.join(",")
		: String(borderRadius);
};

const getRoundedCornerPath = (
	borderRadius: RoundedCornerClipProps["borderRadius"],
	blockSize: number,
	width: number,
	height: number
) => {
	const key = `${blockSize}|${width}|${height}|${getRadiiKey(borderRadius)}`;
	const cached = roundedCornerPathCache.get(key);
	if (cached) return cached;
	const path = convertPointsToPathString(
		generateRoundedCornerPoints(borderRadius!, blockSize, width, height)
	);
	roundedCornerPathCache.set(key, path);
	if (roundedCornerPathCache.size > MAX_ROUNDED_CORNER_CACHE) {
		roundedCornerPathCache.clear();
	}
	return path;
};

export function useRoundedCornerClip(
	element: React.RefObject<HTMLElement | null>,
	options: RoundedCornerClipProps,
	geometry: GeometryObserver
) {
	const { blockSize } = useChonkit();
	const hadBorderRadius = useRef<boolean>(false);
	const lastClipKey = useRef<string | null>(null);

	useLayoutEffect(() => {
		// this applies a non-pixelated border radius only while geometry is not yet known. This looks better than no border radius at all.
		if (
			options.showWhileGeometryUnknown &&
			element.current &&
			options.borderRadius
		) {
			const cssBorderRadius = Array.isArray(options.borderRadius)
				? options.borderRadius
						.map((radius) => `${radius * blockSize}px`)
						.join(" ")
				: `${options.borderRadius * blockSize}px`;
			if (element.current)
				element.current.style.borderRadius = cssBorderRadius;
		}
	}, []);

	useEffect(() => {
		if (!element.current) return;
		if (!options.borderRadius && hadBorderRadius.current) {
			element.current.style.clipPath = "none";
			hadBorderRadius.current = false;
			lastClipKey.current = null;
			return;
		}
		if (!options.borderRadius) return;

		const apply = ({
			width,
			height,
		}: {
			width: number;
			height: number;
		}) => {
			if (!element.current) return;
			if (options.borderRadius) {
				const nextKey = `${blockSize}|${width}|${height}|${getRadiiKey(
					options.borderRadius
				)}`;
				if (lastClipKey.current === nextKey) return;
				hadBorderRadius.current = true;
				element.current.style.clipPath = `path('${getRoundedCornerPath(
					options.borderRadius!,
					blockSize,
					width,
					height
				)}')`;
				lastClipKey.current = nextKey;
			} else {
				element.current.style.clipPath = "none";
				lastClipKey.current = null;
			}
			if (
				options.showWhileGeometryUnknown &&
				element.current &&
				element.current.style.borderRadius
			)
				element.current.style.borderRadius = "";
		};

		const unsubscribe = geometry.subscribe(apply);

		return unsubscribe;
	}, [
		options.borderRadius,
		options.showWhileGeometryUnknown,
		blockSize,
		element,
		geometry,
	]);
}
