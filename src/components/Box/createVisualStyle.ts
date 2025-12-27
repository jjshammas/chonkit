import { resolveColor } from "@/hooks/useResolvedColor";
import { convertJSVariableNameToCSSVariableName } from "@/utils/cssVar";
import type { Theme } from "@/core/themes";

export const STATE_KEYS = ["_hover", "_active", "_focus", "_disabled"] as const;
export type InteractionState = (typeof STATE_KEYS)[number];

export type BreakpointKey = keyof Theme["breakpoints"];

type VisualStyle<T extends Record<string, VisualValue>> = T & {
	[state in InteractionState]?: Partial<T>;
};

type VisualStyleOutput<T> = {
	renderValues: T;
	cssVariables: Record<string, string>;
	cssBaseStyle: React.CSSProperties;
	mediaQueryStyles: Partial<Record<BreakpointKey, React.CSSProperties>>;
};

const exemptKeysFromNormalization = [
	"flex",
	"flexGrow",
	"flexShrink",
	"opacity",
	"zIndex",
];
export function createVisualStyle<T extends Record<string, VisualValue>>(args: {
	style: VisualStyle<T>;
	cssVariableKeys: ReadonlyArray<keyof T>;
	palette: Theme["palette"];
	breakpoints: Theme["breakpoints"];
}): VisualStyleOutput<T> {
	const { style, cssVariableKeys, palette, breakpoints } = args;

	const renderValues = {} as T;
	const cssVariables: Record<string, string> = {};
	const cssBaseStyle: React.CSSProperties = {};
	const mediaQueryStyles: Partial<
		Record<BreakpointKey, React.CSSProperties>
	> = {};

	for (const key in style) {
		if (STATE_KEYS.includes(key as InteractionState)) continue;

		const rawValue = style[key];
		if (rawValue === undefined) continue;

		// Check if the value is a breakpoint object
		if (
			isBreakpointObject(rawValue, breakpoints) &&
			!Array.isArray(rawValue) &&
			typeof rawValue === "object"
		) {
			renderValues[key as keyof T] = rawValue as T[keyof T];

			const shouldUseCSSVariable = cssVariableKeys.includes(
				key as keyof T
			);

			// For each breakpoint, process the value
			for (const breakpoint of Object.keys(rawValue) as BreakpointKey[]) {
				const breakpointValue = rawValue[breakpoint];
				if (breakpointValue === undefined) continue;

				const normalized = normalizeVisualValue(breakpointValue, key);
				const resolved = resolveColor(normalized, palette);

				if (breakpoint === "xs") {
					// xs is the default, applies to cssBaseStyle
					const varName = convertJSVariableNameToCSSVariableName(
						`${key}`
					);
					if (!shouldUseCSSVariable) {
						if (key in document.documentElement.style) {
							cssBaseStyle[key as keyof React.CSSProperties] =
								normalized as any;
						}
					} else {
						cssVariables[varName] = resolved!;
					}
				} else {
					// Other breakpoints go into mediaQueryStyles
					const varName = convertJSVariableNameToCSSVariableName(
						`${key}`
					);
					if (!mediaQueryStyles[breakpoint])
						mediaQueryStyles[breakpoint] = {};
					if (!shouldUseCSSVariable) {
						(mediaQueryStyles[breakpoint] as React.CSSProperties)[
							key as keyof React.CSSProperties
						] = (normalized + " !important") as any;
					} else {
						(mediaQueryStyles[breakpoint] as React.CSSProperties)[
							`${varName}` as keyof React.CSSProperties
						] = (resolved + " !important") as any;
					}
				}
			}
		} else {
			// Non-breakpoint value
			const normalized = normalizeVisualValue(rawValue, key);
			const resolved = resolveColor(normalized, palette);
			const varName = convertJSVariableNameToCSSVariableName(`${key}`);

			renderValues[key as keyof T] = rawValue as T[keyof T];

			const shouldUseCSSVariable = cssVariableKeys.includes(
				key as keyof T
			);
			if (!shouldUseCSSVariable) {
				if (key in document.documentElement.style) {
					cssBaseStyle[key as keyof React.CSSProperties] =
						normalized as any;
				}
			} else {
				cssVariables[varName] = resolved!;
			}
		}
	}

	// Handle interaction states
	for (const state of STATE_KEYS) {
		const nested = style[state];
		if (!nested) continue;

		for (const key in nested) {
			const rawValue = nested[key];
			if (rawValue == null) continue;

			const normalized = normalizeVisualValue(
				rawValue as VisualValue,
				key
			);
			const resolved = resolveColor(normalized, palette);
			const varName = convertJSVariableNameToCSSVariableName(
				`${key}-${state.slice(1)}`
			);

			cssVariables[varName] = resolved!;
		}
	}

	return {
		renderValues,
		cssVariables,
		cssBaseStyle,
		mediaQueryStyles,
	};
}

// type VisualValue = string | number | (string | number)[];
type VisualValue = any;

function isBreakpointObject(
	value: any,
	breakpoints: Theme["breakpoints"]
): value is Record<BreakpointKey, VisualValue> {
	if (typeof value !== "object" || value === null || Array.isArray(value)) {
		return false;
	}
	// Check if the object has any of the known breakpoint keys
	const breakpointKeys = Object.keys(breakpoints);
	return Object.keys(value).some((key) => breakpointKeys.includes(key));
}

export function normalizeVisualValue(
	value: VisualValue,
	cssKey: string
): string {
	if (Array.isArray(value))
		return value
			.map((value) => normalizeVisualValue(value, cssKey))
			.join(" ");
	if (exemptKeysFromNormalization.includes(cssKey)) return String(value);
	if (typeof value === "number")
		return `calc(${value} * var(--ck-block-size))`;
	if (/^-?\d+px$/.test(value.trim()))
		return `round(${value}, var(--ck-block-size))`;
	if (typeof value === "string" && /px/.test(value.trim()))
		return value.replace(
			/(\d+(\.\d+)?)px/g,
			(_, num) => `round(${num}px, var(--ck-block-size))`
		);
	return String(value);
}

export function resolveComponentVisualStyle<
	T extends Record<string, VisualValue>,
	AllProps extends Record<string, any> = T & Record<string, any>,
>(args: {
	props: AllProps;
	cssVariableKeys: ReadonlyArray<keyof T>;
	palette: Theme["palette"];
	breakpoints: Theme["breakpoints"];
}): VisualStyleOutput<T> & {
	visualStyle: T & Partial<Record<InteractionState, Partial<T>>>;
	rest: Omit<AllProps, "sx">;
} {
	const { props, cssVariableKeys, palette, breakpoints } = args;

	const visualStyle = props.sx || {};
	const rest = { ...props } as Omit<AllProps, "sx">;
	delete rest.sx;

	const { renderValues, cssVariables, cssBaseStyle, mediaQueryStyles } =
		createVisualStyle({
			style: visualStyle,
			cssVariableKeys,
			palette,
			breakpoints,
		});

	return {
		visualStyle: visualStyle as T &
			Partial<Record<InteractionState, Partial<T>>>,
		rest,
		renderValues,
		cssVariables,
		cssBaseStyle,
		mediaQueryStyles,
	};
}
