import { useEffect, useRef } from "react";
import type { GeometryObserver } from "./useGeometryObserver";
import { useChonkit } from "@/core/ChonkitProvider/ChonkitProvider";
import { resolveColor } from "@/hooks/useResolvedColor";
import type { Theme } from "@/core/themes";
import { createGradientSVG } from "@/utils/svg/gradients/gradients";
import styles from "./Box.module.css";

const resolveGradientColors = (
	gradient: string,
	palette: Theme["palette"]
): string => {
	let newString = gradient;
	gradient
		.split(",")
		.map((group) => group.trim().split(" "))
		.flat()
		.forEach((token) => {
			const resolved = resolveColor(token, palette);
			if (resolved && resolved !== token) {
				newString = newString.replace(token, resolved);
			}
		});
	return newString;
};

export type GradientProps = {
	gradient?: string;
};

export function useGradient(
	element: React.RefObject<HTMLElement | null>,
	options: GradientProps,
	geometry: GeometryObserver
) {
	const {
		blockSize,
		theme: { palette },
	} = useChonkit();
	const elementGradient = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!options.gradient) return;

		const gradientString = resolveGradientColors(options.gradient, palette);
		const unsubscribe = geometry.subscribe(({ width, height }) => {
			if (!gradientString || !elementGradient.current) return;
			const svg = createGradientSVG(
				gradientString,
				blockSize,
				width,
				height
			);
			elementGradient.current.innerHTML = "";
			elementGradient.current.appendChild(svg);
		});

		return unsubscribe;
	}, [options.gradient, blockSize, element]);

	const gradientEl = options.gradient ? (
		<div ref={elementGradient} className={styles.gradient} />
	) : null;

	return {
		gradientEl,
	};
}
