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

export function createVisualStyle<T extends Record<string, VisualValue>>(
	style: VisualStyle<T>,
	palette: Theme["palette"]
): VisualStyleOutput<T> {
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
		cssVariables[varName] = resolved!;
		if (key in document.documentElement.style) {
			cssBaseStyle[key as keyof React.CSSProperties] =
				`var(${varName})` as any;
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

function normalizeVisualValue(value: VisualValue): string {
	if (Array.isArray(value)) return value.map(normalizeVisualValue).join(" ");
	if (typeof value === "number") return `${value}px`;
	return String(value);
}

export function resolveComponentVisualStyle<
	T extends Record<string, VisualValue>
>(args: {
	props: Record<string, any>;
	keys: readonly (keyof T)[];
	palette: Theme["palette"];
}): VisualStyleOutput<T> & {
	visualStyle: T & Partial<Record<InteractionState, Partial<T>>>;
	rest: Record<string, any>;
} {
	const { props, keys, palette } = args;

	const visualStyle: Partial<T & Record<InteractionState, Partial<T>>> = {};
	const rest: Record<string, any> = {};

	for (const key in props) {
		if ((keys as readonly string[]).includes(key)) {
			visualStyle[key as keyof T] = props[key];
		} else if (STATE_KEYS.includes(key as InteractionState)) {
			visualStyle[key as InteractionState] = props[key];
		} else {
			rest[key] = props[key];
		}
	}

	const { renderValues, cssVariables, cssBaseStyle } = createVisualStyle(
		visualStyle as VisualStyle<T>,
		palette
	);

	return {
		visualStyle: visualStyle as T &
			Partial<Record<InteractionState, Partial<T>>>,
		rest,
		renderValues,
		cssVariables,
		cssBaseStyle,
	};
}
