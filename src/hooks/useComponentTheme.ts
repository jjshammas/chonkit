import { useChonkit } from "@/core/ChonkitProvider/ChonkitProvider";
import { mergeThemes, Theme, DeepPartial } from "@/core/themes";

const isPlainObject = (val: any) =>
	val &&
	typeof val === "object" &&
	val.constructor === Object &&
	Object.getPrototypeOf(val) === Object.prototype;

const deepMerge = (...objects: DeepPartial<any>[]): DeepPartial<any> => {
	return objects.reduce((prev, obj) => {
		obj &&
			Object.keys(obj).forEach((key) => {
				if (isPlainObject(obj[key])) {
					prev[key] = deepMerge(prev[key], obj[key]);
				} else {
					prev[key] = obj[key];
				}
			});
		return prev;
	}, {});
};

export function useComponentTheme<
	Key extends keyof Theme,
	ResolvedTheme extends Theme[Key],
	Props extends Record<string, any> = Omit<
		ResolvedTheme,
		"variants" | "defaultVariant"
	> & {
		variant?: string;
	},
>(
	componentKey: Key,
	userProps: Props,
	defaultTheme?: ResolvedTheme
): Props & { sx: Props["sx"] | Record<string, any> } {
	const { theme } = useChonkit();

	const baseTheme = theme?.[componentKey] ?? {};
	const resolvedTheme: Record<string, any> = mergeThemes(
		defaultTheme || {},
		baseTheme as DeepPartial<ResolvedTheme>
	);

	let variantSx = {};

	const selectedVariant =
		userProps.variant ??
		("defaultVariant" in resolvedTheme
			? (resolvedTheme as any).defaultVariant
			: undefined);

	if ("variants" in resolvedTheme && selectedVariant) {
		variantSx = (resolvedTheme as any).variants?.[selectedVariant] ?? {};
	}

	const userSx = userProps?.sx ?? {};

	const resolvedThemeSx = resolvedTheme ?? {};
	delete resolvedThemeSx.defaultVariant;
	delete resolvedThemeSx.variants;
	const mergedSx = deepMerge(
		resolvedThemeSx,
		variantSx,
		userSx
	) as Props["sx"];

	const mergedProps = {
		...userProps,
		sx: mergedSx,
	} as Props & { sx: Props["sx"] | Record<string, any> };
	return mergedProps;
}
