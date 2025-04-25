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

	// const mergedProps = {
	// 	...resolvedTheme,
	// 	...variantProps,
	// 	...userProps,
	// } as Props;

	const mergedProps = deepMerge(
		resolvedTheme,
		variantProps,
		userProps
	) as Props;
	delete mergedProps.defaultVariant;
	delete mergedProps.variants;
	return mergedProps;
}
