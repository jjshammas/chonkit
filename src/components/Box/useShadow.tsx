import { useEffect, useRef } from "react";
import {
	convertPointsToPathString,
	generateRoundedCornerPoints,
} from "@/utils/svg/circle-generator/circle-generator";
import type { GeometryObserver } from "./useGeometryObserver";
import { useChonkit } from "@/core/ChonkitProvider/ChonkitProvider";
import styles from "./Box.module.css";
import { useLighting } from "@/core/LightingProvider/LightingProvider";

export type ShadowProps = {
	borderRadius?: number | [number, number, number, number];
	dropShadow?:
		| {
				blur?: number;
				offsetX?: number;
				offsetY?: number;
				color: string;
		  }
		| {
				blur?: number;
				distance?: number;
				color: string;
		  };
};

const SHADOW_REDRAW_COUNT = 3;

const getAlphaFromColor = (color: string) => {
	const rgba = color.match(
		/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/
	);
	if (!rgba) return 1;
	const alpha = parseFloat(rgba[4]);
	return alpha !== undefined ? alpha : 1;
};

const removeAlphaFromColor = (color: string) => {
	const rgba = color.match(
		/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/
	);
	if (!rgba) return color;
	const alpha = parseFloat(rgba[4]);
	return `rgb(${rgba[1]}, ${rgba[2]}, ${rgba[3]})`;
};

export function useShadow(
	element: React.RefObject<HTMLElement | null>,
	options: ShadowProps,
	geometry: GeometryObserver
) {
	const { blockSize } = useChonkit();
	const { direction } = useLighting();
	const shadow = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!shadow.current || !options.dropShadow) return;

		const apply = ({
			width,
			height,
		}: {
			width: number;
			height: number;
		}) => {
			if (options.dropShadow) {
				if (!shadow.current) return;

				const shape = generateRoundedCornerPoints(
					options.borderRadius || 0,
					blockSize,
					width,
					height
				);

				let offsetX = 0,
					offsetY = 0;
				if (
					"offsetX" in options.dropShadow &&
					"offsetY" in options.dropShadow
				) {
					offsetX = options.dropShadow.offsetX || 0;
					offsetY = options.dropShadow.offsetY || 0;
				} else if ("distance" in options.dropShadow) {
					const distance = options.dropShadow.distance;
					const angle = (direction * Math.PI) / 180;
					const safeDistance = distance ?? 0;
					offsetX = Math.round(Math.cos(angle) * safeDistance);
					offsetY = Math.round(Math.sin(angle) * safeDistance);
				}

				const canvas = document.createElement("canvas");
				const ctx = canvas.getContext("2d");
				if (!ctx) throw new Error("Could not create canvas context");
				canvas.width = width;
				canvas.height = height;
				ctx.imageSmoothingEnabled = false;

				ctx.beginPath();
				ctx.moveTo(shape[0][0], shape[0][1]);
				for (let i = 1; i < shape.length; i++) {
					ctx.lineTo(shape[i][0], shape[i][1]);
				}
				ctx.fillStyle = removeAlphaFromColor(options.dropShadow.color);
				ctx.fill();
				ctx.closePath();

				const blurRadius = options.dropShadow.blur || 0;
				const miniCanvas = document.createElement("canvas");
				const miniCtx = miniCanvas.getContext("2d");
				if (!miniCtx)
					throw new Error("Could not create canvas context");
				miniCanvas.width = width / blockSize + blurRadius * 2;
				miniCanvas.height = height / blockSize + blurRadius * 2;
				miniCtx.imageSmoothingEnabled = false;

				miniCtx.shadowColor = removeAlphaFromColor(
					options.dropShadow.color
				);
				miniCtx.shadowBlur = blurRadius;
				for (let i = 0; i < SHADOW_REDRAW_COUNT; i++) {
					miniCtx.drawImage(
						canvas,
						0,
						0,
						canvas.width,
						canvas.height,
						blurRadius,
						blurRadius,
						width / blockSize,
						height / blockSize
					);
				}

				const top = -blurRadius + (offsetY || 0);
				const bottom = -blurRadius - (offsetY || 0);
				const left = -blurRadius + (offsetX || 0);
				const right = -blurRadius - (offsetX || 0);
				shadow.current.style.inset = `${top * blockSize}px ${
					right * blockSize
				}px ${bottom * blockSize}px ${left * blockSize}px`;
				shadow.current.style.backgroundImage = `url(${miniCanvas.toDataURL()})`;
				shadow.current.style.opacity = `calc(${
					getAlphaFromColor(options.dropShadow.color) * 100 + "%"
				} * var(--ck-current-drop-shadow-opacity-multiplier))`;
			} else {
				// remove the drop shadow
			}
		};

		const unsubscribe = geometry.subscribe(apply);

		return unsubscribe;
	}, [
		options.dropShadow,
		options.dropShadow?.blur,
		options.dropShadow?.color,
		options.dropShadow && "offsetX" in options.dropShadow
			? options.dropShadow.offsetX
			: undefined,
		options.dropShadow && "offsetY" in options.dropShadow
			? options.dropShadow.offsetY
			: undefined,
		options.dropShadow && "distance" in options.dropShadow
			? options.dropShadow.distance
			: undefined,
		options.borderRadius,
		blockSize,
		element,
		shadow,
		direction,
	]);

	return {
		shadow: <div ref={shadow} className={styles.dropShadow} />,
	};
}
