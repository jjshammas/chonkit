import type { WithInteractionStates } from "./";

export function createComponentThemeTypes<
	TBase extends Record<string, any>,
	TInteractionKeys extends readonly (keyof TBase & string)[],
>(config: { base: TBase; interactionAllowedKeys: TInteractionKeys }) {
	type InteractionSubset = Pick<TBase, TInteractionKeys[number]>;

	type Theme = TBase & WithInteractionStates<InteractionSubset>;

	return {
		types: {
			Theme: null! as Theme,
			Props: null! as Theme,
		},
	};
}

type VariantComponentThemeProps<T extends { variants: Record<string, any> }> = {
	variant?: keyof T["variants"];
};

/**
 * Helper function for generating the types of a component theme.
 * If you specify the `variants` property, only the variants provided will be allowed in the theme and prop.
 */
export function createComponentVariantThemeTypes<
	TBase extends Record<string, any>,
	TInteractionKeys extends readonly (keyof TBase & string)[],
	Variants extends string = string,
>(config: {
	base: TBase;
	interactionAllowedKeys: TInteractionKeys;
	variants?: Variants;
}) {
	type InteractionSubset = Pick<TBase, TInteractionKeys[number]>;

	type Theme = TBase &
		WithInteractionStates<InteractionSubset> & {
			variants: Record<
				Variants,
				Partial<TBase & WithInteractionStates<InteractionSubset>>
			>;
			defaultVariant: Variants;
		};
	type Props = VariantComponentThemeProps<Theme>;

	return {
		types: {
			Theme: null! as Theme,
			Props: null! as Props,
		},
	};
}
