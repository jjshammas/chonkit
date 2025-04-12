import { useChonkit } from "@/core/ChonkitProvider/ChonkitProvider";
import { mergeThemes, Theme, DeepPartial } from "@/core/themes";

export function useComponentTheme<
	Key extends keyof Theme,
	ResolvedTheme extends Theme[Key],
	Props extends Record<string, any> = Omit<
		ResolvedTheme,
		"variants" | "defaultVariant"
	> & {
		variant?: string;
	}
>(componentKey: Key, userProps: Props, defaultTheme?: ResolvedTheme): Props {
	const { theme } = useChonkit();

	const baseTheme = theme?.[componentKey] ?? {};
	const resolvedTheme = mergeThemes(
		defaultTheme || {},
		baseTheme as DeepPartial<ResolvedTheme>
	);

	let variantProps = {};

	const selectedVariant =
		userProps.variant ??
		("defaultVariant" in resolvedTheme
			? (resolvedTheme as any).defaultVariant
			: undefined);

	if ("variants" in resolvedTheme && selectedVariant) {
		variantProps = (resolvedTheme as any).variants?.[selectedVariant] ?? {};
	}

	const mergedProps = {
		...resolvedTheme,
		...variantProps,
		...userProps,
	} as Props;
	delete mergedProps.defaultVariant;
	delete mergedProps.variants;
	return mergedProps;
}
