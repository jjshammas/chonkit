import type { ButtonTheme } from "@/components/Button/Button";
import { convertJSVariableNameToCSSVariableName } from "@/utils/cssVar";
import type { InteractionState } from "@/components/Box/createVisualStyle";

export type ColorDefinition = {
	main: string;
	fg: string;
};

export type Theme = {
	palette: {
		bg: ColorDefinition;
		primary: ColorDefinition;
		secondary: ColorDefinition;
		positive: ColorDefinition;
		negative: ColorDefinition;
		disabled: ColorDefinition;
	};
	lighting: {
		highlightColor: string;
		highlightBlendMode: string;
		shadowColor: string;
		shadowBlendMode: string;
	};
	Button: ButtonTheme;
};

export type DeepPartial<T> = T extends object
	? {
			[P in keyof T]?: DeepPartial<T[P]>;
	  }
	: T;
export type ThemePartial = DeepPartial<Theme>;

export type InteractionStates<T> = Partial<
	Record<`${InteractionState}`, Partial<T>>
>;
export type WithInteractionStates<T> = T & InteractionStates<T>;
export type WithoutInteractionStates<T> = Omit<T, keyof InteractionStates<T>>;

export type ComponentTheme<T> = WithInteractionStates<T>;
export type ComponentThemeProps<T> = T;

export type VariantComponentTheme<
	T,
	Variants extends string = string
> = WithInteractionStates<T> & {
	variants: Record<Variants, Partial<WithInteractionStates<T>>>;
	defaultVariant: Variants;
};
export type VariantComponentThemeProps<
	T extends { variants: Record<string, any> }
> = Omit<T, "variants" | "defaultVariant"> & {
	variant?: keyof T["variants"];
};

export const mergeThemes = <T>(base: T, partial: DeepPartial<T>): T => {
	if (
		typeof base !== "object" ||
		base === null ||
		typeof partial !== "object" ||
		partial === null
	) {
		return partial !== undefined ? (partial as T) : base;
	}

	const result: any = Array.isArray(base) ? [...base] : { ...base };

	for (const key in partial) {
		const baseVal = (base as any)[key];
		const partialVal = (partial as any)[key];

		result[key] = mergeThemes(baseVal, partialVal);
	}

	return result;
};

export const createCSSVariables = (theme: Theme): React.CSSProperties => {
	const variablesToConvert = {
		...theme.lighting,
		...Object.entries(theme.palette).reduce(
			(acc, [name, color]) => ({
				...acc,
				[`color-${name}`]: color.main,
				[`color-${name}-fg`]: color.fg,
			}),
			{} as Record<string, string>
		),
	};

	const cssVariables = {} as Record<string, string>;
	for (const key in variablesToConvert) {
		const cssVariableName = convertJSVariableNameToCSSVariableName(key);
		cssVariables[cssVariableName] =
			variablesToConvert[key as keyof typeof variablesToConvert];
	}

	return cssVariables;
};

import defaultTheme from "./default";
export default {
	default: defaultTheme,
};
