import type { ColorDefinition, Theme } from "@/core/themes";
import { useChonkit } from "@/core/ChonkitProvider/ChonkitProvider";

/**
 * Attempts to look up the string in the theme's palette.
 * Can be just a color name (e.g. "primary") or a color with a variant (e.g. "primary-bg").
 * If the color is not found, it returns the original value.
 */
export function resolveColor(
	value: string | undefined,
	palette: Record<string, ColorDefinition>
): string | undefined {
	if (!value) return undefined;

	if (
		value.startsWith("#") ||
		value.startsWith("rgb") ||
		value.startsWith("hsl") ||
		value.startsWith("var(")
	) {
		return value;
	}

	const [base, variant = "main"] = value.split(".");
	const colorGroup = palette[base];

	if (colorGroup && variant in colorGroup) {
		return colorGroup[variant as keyof ColorDefinition];
	}

	return value;
}

export function useResolvedColor(value?: string): string | undefined {
	const { theme } = useChonkit();
	const palette: Record<string, ColorDefinition> = theme?.palette ?? {};

	return resolveColor(value, palette);
}

const DEFAULT_COLOR_KEYS = [
	"backgroundColor",
	"color",
	"borderColor",
	"outlineColor",
	"fill",
	"stroke",
];

export function useResolvedColorProps<T extends Record<string, any>>(
	props: T,
	keys: (keyof T)[] = DEFAULT_COLOR_KEYS
): T {
	const { theme } = useChonkit();
	const palette = theme?.palette ?? {};

	const resolved: Record<string, any> = { ...props };

	for (const key of keys) {
		const value = props[key];
		if (typeof value === "string") {
			resolved[key as string] = resolveColor(value, palette);
		}
	}

	return resolved as T;
}
