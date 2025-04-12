import { resolveColor } from "@/hooks/useResolvedColor";
import { convertJSVariableNameToCSSVariableName } from "@/utils/cssVar";
import type { Theme } from "@/core/themes";

const STATE_KEYS = ["_hover", "_active", "_focus", "_disabled"] as const;
type InteractionState = (typeof STATE_KEYS)[number];

export type ComponentVisualProps<T> = T & {
	[state in (typeof STATE_KEYS)[number]]?: Partial<T>;
};

type CustomVisualProps = {};

type VisualStyle = React.CSSProperties &
	CustomVisualProps & {
		[state in InteractionState]?: Partial<
			React.CSSProperties & CustomVisualProps
		>;
	};

type VisualStyleOutput = {
	renderValues: Record<string, string>; // For JS renderers
	cssVariables: Record<string, string>; // For inline vars
	cssBaseStyle: React.CSSProperties; // For actual CSS usage
};

export function createVisualStyle(
	style: VisualStyle,
	palette: Theme["palette"]
): VisualStyleOutput {
	const renderValues: Record<string, string> = {};
	const cssVariables: Record<string, string> = {};
	const cssBaseStyle: React.CSSProperties = {};

	for (const key in style) {
		// Skip state keys
		if ((STATE_KEYS as readonly string[]).includes(key)) continue;

		const rawValue = style[key as keyof VisualStyle];

		if (rawValue === undefined) continue;

		const valueStr = String(rawValue);
		const resolved = resolveColor(valueStr, palette);
		const varName = convertJSVariableNameToCSSVariableName(`${key}`);

		renderValues[key] = resolved!;
		cssVariables[varName] = resolved!;
		(cssBaseStyle as Record<string, any>)[key] = `var(${varName})`;
	}

	// Handle interaction states (_hover, _active, etc.)
	for (const stateKey of STATE_KEYS) {
		const stateValues = style[stateKey];
		if (!stateValues) continue;

		for (const key in stateValues) {
			const rawValue = stateValues[key as keyof typeof stateValues];

			if (rawValue === undefined) continue;

			const valueStr = String(rawValue);
			const resolved = resolveColor(valueStr, palette);
			const varName = convertJSVariableNameToCSSVariableName(
				`${key}-${stateKey.slice(1)}`
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

export function defineVisualKeys<const Keys extends readonly string[]>(
	keys: Keys
): Keys {
	return keys;
}

export function resolveComponentVisualStyle<
	T extends Record<string, any>
>(args: {
	props: Record<string, any>;
	keys: readonly (keyof T)[];
	palette: Theme["palette"];
}): {
	visualStyle: T & Partial<Record<InteractionState, Partial<T>>>;
	rest: Record<string, any>;
	renderValues: Record<string, string>;
	cssVariables: Record<string, string>;
	cssBaseStyle: React.CSSProperties;
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
		visualStyle,
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
