import { resolveColor } from "@/hooks/useResolvedColor";
import { convertJSVariableNameToCSSVariableName } from "@/utils/cssVar";
import type { Theme } from "@/core/themes";

export const STATE_KEYS = ["_hover", "_active", "_focus", "_disabled"] as const;
export type InteractionState = (typeof STATE_KEYS)[number];

type VisualStyle<T extends Record<string, VisualValue>> = T & {
	[state in InteractionState]?: Partial<T>;
};

type VisualStyleOutput<T> = {
	renderValues: T;
	cssVariables: Record<string, string>;
	cssBaseStyle: React.CSSProperties;
};

export function createVisualStyle<T extends Record<string, VisualValue>>(args: {
	style: VisualStyle<T>;
	cssVariableKeys: ReadonlyArray<keyof T>;
	palette: Theme["palette"];
}): VisualStyleOutput<T> {
	const { style, cssVariableKeys, palette } = args;

	const renderValues = {} as T;
	const cssVariables: Record<string, string> = {};
	const cssBaseStyle: React.CSSProperties = {};

	for (const key in style) {
		if (STATE_KEYS.includes(key as InteractionState)) continue;

		const rawValue = style[key];
		if (rawValue === undefined) continue;

		const normalized = normalizeVisualValue(rawValue);
		const resolved = resolveColor(normalized, palette);
		const varName = convertJSVariableNameToCSSVariableName(`${key}`);

		renderValues[key as keyof T] = rawValue as T[keyof T];

		const shouldUseCSSVariable = cssVariableKeys.includes(key as keyof T);
		if (!shouldUseCSSVariable) {
			if (key in document.documentElement.style) {
				cssBaseStyle[key as keyof React.CSSProperties] =
					normalized as any;
			}
		} else {
			cssVariables[varName] = resolved!;
		}
	}

	// Handle interaction states
	for (const state of STATE_KEYS) {
		const nested = style[state];
		if (!nested) continue;

		for (const key in nested) {
			const rawValue = nested[key];
			if (rawValue == null) continue;

			const normalized = normalizeVisualValue(rawValue as VisualValue);
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
	};
}

// type VisualValue = string | number | (string | number)[];
type VisualValue = any;

export function normalizeVisualValue(value: VisualValue): string {
	if (Array.isArray(value)) return value.map(normalizeVisualValue).join(" ");
	if (typeof value === "number")
		return `calc(${value} * var(--ck-block-size))`;
	if (/^\d+px$/.test(value.trim()))
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
}): VisualStyleOutput<T> & {
	visualStyle: T & Partial<Record<InteractionState, Partial<T>>>;
	rest: Omit<AllProps, "sx">;
} {
	const { props, cssVariableKeys, palette } = args;

	const visualStyle = props.sx || {};
	const rest = { ...props } as Omit<AllProps, "sx">;
	delete rest.sx;

	const { renderValues, cssVariables, cssBaseStyle } = createVisualStyle({
		style: visualStyle,
		cssVariableKeys,
		palette,
	});

	return {
		visualStyle: visualStyle as T &
			Partial<Record<InteractionState, Partial<T>>>,
		rest,
		renderValues,
		cssVariables,
		cssBaseStyle,
	};
}
